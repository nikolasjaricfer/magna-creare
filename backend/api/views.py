from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.microsoft.views import MicrosoftGraphOAuth2Adapter
from .serializers import CustomMicrosoftLoginSerializer
from django.http import HttpResponseRedirect

from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
import math
from .models import (
    Quiz,
    Team,
    Review,
    FavoriteOrganizer,
    Notification,
    Location,
    User
)
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    QuizSerializer,
    TeamSerializer,
    ReviewSerializer,
    FavoriteOrganizerSerializer,
    NotificationSerializer,
    ChangePasswordSerializer,
    LocationSerializer
)

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['id'] = self.user.id
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomMicrosoftLoginView(SocialLoginView):
    adapter_class = MicrosoftGraphOAuth2Adapter
    serializer_class = CustomMicrosoftLoginSerializer

    def get_response(self):
        response = super().get_response()
        user = self.request.user
        access_token = response.data.get('access_token')
        refresh_token = response.data.get('refresh_token')

        frontend_url = (
            f"https://quiz-finder.onrender.com/login?"
            f"access_token={access_token}&refresh_token={refresh_token}"
        )
        return HttpResponseRedirect(frontend_url)


class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    Only Admin can view all users or delete them.
    Users can update their own user object, but cannot delete other users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        # Only allow the user themselves or admin to update
        instance = self.get_object()
        if request.user.role != User.ADMIN and instance != request.user:
            raise ValidationError("You do not have permission to edit this user.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Only admin can delete a user
        instance = self.get_object()
        if request.user.role != User.ADMIN:
            raise ValidationError("Only admins can delete a user.")
        return super().destroy(request, *args, **kwargs)


class QuizViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing quiz instances.
    - Admin can do anything (create, edit, delete).
    - Quizmaker can create quizzes, edit/delete only their own.
    - Regular users can read only.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Admin or quizmaker can create
        if self.request.user.role not in [User.QUIZMAKER, User.ADMIN]:
            raise ValidationError("Only quizmakers or admins can create quizzes.")
        serializer.save(organizer=self.request.user)

    def perform_update(self, serializer):
        quiz = self.get_object()
        # Only admin or the quiz's organizer can update
        if self.request.user.role != User.ADMIN and quiz.organizer != self.request.user:
            raise ValidationError("You do not have permission to edit this quiz.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        quiz = self.get_object()
        # Only admin or the quiz's organizer can delete
        if request.user.role != User.ADMIN and quiz.organizer != request.user:
            raise ValidationError("You do not have permission to delete this quiz.")
        return super().destroy(request, *args, **kwargs)


class TeamViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing team instances.
    - Anyone can read if authenticated.
    - Users can create teams to sign up for a quiz (not if they are the quizmaker of that quiz).
    - Only the user who registered the team, OR the quiz's organizer, OR an admin can update/delete the team.
    """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        quiz = serializer.validated_data.get('quiz')
        members_count = serializer.validated_data.get('members_count')

        # Quizmaker cannot sign up for their own quiz
        if user.role == User.QUIZMAKER and quiz.organizer == user:
            raise ValidationError("Quiz makers cannot sign up for their own quizzes.")

        if members_count is None:
            raise ValidationError("members_count is required.")
        if members_count <= 0:
            raise ValidationError("members_count must be a positive integer.")
        if members_count > quiz.max_team_members:
            raise ValidationError(f"Team members exceed the allowed maximum of {quiz.max_team_members}.")
        if quiz.teams.count() >= quiz.max_teams:
            raise ValidationError("Maximum number of teams for this quiz has been reached.")

        serializer.save(registered_by=user)

    def perform_update(self, serializer):
        team = self.get_object()
        # Only admin, the user who registered, or the quiz's organizer can edit
        if (
            self.request.user.role != User.ADMIN
            and team.registered_by != self.request.user
            and team.quiz.organizer != self.request.user
        ):
            raise ValidationError("You do not have permission to edit this team.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        team = self.get_object()
        # Only admin, the user who registered, or the quiz's organizer can delete
        if (
            request.user.role != User.ADMIN
            and team.registered_by != request.user
            and team.quiz.organizer != request.user
        ):
            raise ValidationError("You do not have permission to delete this team.")
        return super().destroy(request, *args, **kwargs)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing review instances.
    - Only the user who wrote the review or an admin can edit/delete it.
    - The user must have attended the quiz and the quiz must have ended before creating a review.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        quiz = serializer.validated_data.get('quiz')

        attended = Team.objects.filter(quiz=quiz, registered_by=user).exists()
        if not attended:
            raise ValidationError("You cannot review a quiz you did not attend.")

        quiz_end_time = quiz.start_time + timedelta(minutes=quiz.duration)
        if timezone.now() < quiz_end_time:
            raise ValidationError("You can only leave a review after the quiz has ended.")

        serializer.save(user=user)

    def perform_update(self, serializer):
        review = self.get_object()
        if self.request.user.role != User.ADMIN and review.user != self.request.user:
            raise ValidationError("You do not have permission to edit this review.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if request.user.role != User.ADMIN and review.user != request.user:
            raise ValidationError("You do not have permission to delete this review.")
        return super().destroy(request, *args, **kwargs)


class FavoriteOrganizerViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing favorite organizer instances.
    """
    queryset = FavoriteOrganizer.objects.all()
    serializer_class = FavoriteOrganizerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing notification instances.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    """
    API view to register a new user.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response_data = {
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'access_token': access_token,
            'refresh_token': refresh_token,
        }
        return Response(response_data, status=201)


class ChangePasswordView(APIView):
    """
    API view to change password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q
import math
from datetime import timedelta

from .models import Quiz, User, Location
from .serializers import QuizSerializer


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # 0. (Optional) Decide if you want *all* quizzes (past + future) or only future.
        #    If you truly want ALL quizzes, comment out the line with start_time__gt=now
        #    If you only want upcoming, keep it or make it conditional on a query param.
        
        # Example: We'll retrieve ALL quizzes for now:
        quizzes_qs = Quiz.objects.all()
        
        # 1. Get parameters
        q = request.query_params.get('q', '').strip()
        lat_param = request.query_params.get('lat', None)
        lng_param = request.query_params.get('lng', None)
        distance_param = request.query_params.get('distance', None)
        category_param = request.query_params.get('category', None)
        difficulty_param = request.query_params.get('difficulty', None)
        fee_min_param = request.query_params.get('fee_min', None)
        fee_max_param = request.query_params.get('fee_max', None)
        is_league_param = request.query_params.get('is_league', None)
        max_team_members_param = request.query_params.get('max_team_members', None)
        prizes_param = request.query_params.get('prizes', None)
        show_full_param = request.query_params.get('show_full', 'true')

        # 2. Apply the same filters you have (category, difficulty, fee, etc.)
        #    We'll do them step-by-step, same as before:

        # Category
        if category_param:
            quizzes_qs = quizzes_qs.filter(category=category_param)

        # Difficulty
        if difficulty_param:
            quizzes_qs = quizzes_qs.filter(difficulty__iexact=difficulty_param)

        # Fee range
        if fee_min_param:
            try:
                fee_min_value = float(fee_min_param)
                quizzes_qs = quizzes_qs.filter(fee__gte=fee_min_value)
            except ValueError:
                pass
        if fee_max_param:
            try:
                fee_max_value = float(fee_max_param)
                quizzes_qs = quizzes_qs.filter(fee__lte=fee_max_value)
            except ValueError:
                pass

        # is_league
        if is_league_param is not None:
            if is_league_param.lower() == 'true':
                quizzes_qs = quizzes_qs.filter(is_league=True)
            elif is_league_param.lower() == 'false':
                quizzes_qs = quizzes_qs.filter(is_league=False)

        # max_team_members
        if max_team_members_param:
            try:
                mtm_value = int(max_team_members_param)
                quizzes_qs = quizzes_qs.filter(max_team_members__gte=mtm_value)
            except ValueError:
                pass

        # prizes
        if prizes_param is not None:
            if prizes_param.lower() == 'true':
                quizzes_qs = quizzes_qs.exclude(prizes__exact='')
            elif prizes_param.lower() == 'false':
                quizzes_qs = quizzes_qs.filter(prizes__exact='')

        # show_full (exclude filled quizzes)
        if show_full_param.lower() == 'false':
            not_filled_ids = []
            for quiz in quizzes_qs:
                if quiz.teams.count() < quiz.max_teams:
                    not_filled_ids.append(quiz.id)
            quizzes_qs = quizzes_qs.filter(id__in=not_filled_ids)

        # Distance filter
        if lat_param and lng_param and distance_param:
            try:
                user_lat = float(lat_param)
                user_lng = float(lng_param)
                max_distance = float(distance_param)

                within_distance_ids = []
                for quiz in quizzes_qs:
                    loc = quiz.location
                    if loc.latitude and loc.longitude:
                        dist = self.calculate_distance(user_lat, user_lng, loc.latitude, loc.longitude)
                        if dist <= max_distance:
                            within_distance_ids.append(quiz.id)

                quizzes_qs = quizzes_qs.filter(id__in=within_distance_ids)
            except ValueError:
                pass

        # 3. Filter by 'q' if not empty
        #    We'll do a separate "full text" filter on the final quizzes_qs for 'title' or 'organizer.username'.
        #    For location, we handle it in location_quizzes as well, but let's see if you want to apply it here too.
        if q:
            quizzes_qs = quizzes_qs.filter(
                Q(title__icontains=q) |
                Q(organizer__username__icontains=q)
                # We *could* include Q(location__name__icontains=q) here,
                # but we'll also do a separate location_quizzes below.
            )

        # 4. Build final "quizzes" array
        quizzes_data = []
        for quiz in quizzes_qs:
            quizzes_data.append({
                "id": quiz.id,
                "title": quiz.title,
                "location": quiz.location.name,
                "start_time": quiz.start_time,
                "organizer": quiz.organizer.username,
                "category": quiz.category,
                "difficulty": quiz.difficulty,
                "fee": str(quiz.fee),
                "is_league": quiz.is_league,
                "prizes": quiz.prizes,
                "teams_registered": quiz.teams.count(),
                "max_teams": quiz.max_teams,
                "max_team_members": quiz.max_team_members
            })

        # 5. LOCATION QUIZZES
        #    We'll always build a location-based array. If q is empty, we return *all quizzes* again, or
        #    if you only want location matches on `q`, we'll filter that. Let's do both:
        location_quizzes_qs = quizzes_qs
        if q:
            location_quizzes_qs = location_quizzes_qs.filter(location__name__icontains=q)

        location_quizzes_data = []
        for quiz in location_quizzes_qs:
            location_quizzes_data.append({
                "id": quiz.id,
                "title": quiz.title,
                "location": quiz.location.name,
                "start_time": quiz.start_time,
                "organizer": quiz.organizer.username,
                "category": quiz.category,
                "difficulty": quiz.difficulty,
                "fee": str(quiz.fee),
                "is_league": quiz.is_league,
                "prizes": quiz.prizes,
                "teams_registered": quiz.teams.count(),
                "max_teams": quiz.max_teams,
                "max_team_members": quiz.max_team_members
            })

        # 6. QUIZMAKERS
        #    If q is empty, return ALL quizmakers. If q is not empty, filter by `username__icontains=q`.
        if q:
            quizmakers_qs = User.objects.filter(
                role=User.QUIZMAKER,
                username__icontains=q
            )
        else:
            quizmakers_qs = User.objects.filter(role=User.QUIZMAKER)

        quizmakers_data = []
        for user in quizmakers_qs:
            quizmakers_data.append({
                "id": user.id,
                "username": user.username,
                "role": user.role,
                # Add more fields if needed
            })

        # 7. Return the three arrays
        return Response({
            "quizzes": quizzes_data,
            "location_quizzes": location_quizzes_data,
            "quizmakers": quizmakers_data
        }, status=200)

    def calculate_distance(self, lat1, lng1, lat2, lng2):
        """
        Haversine or similar formula to get distance in km.
        """
        R = 6371.0
        lat1_radians = math.radians(lat1)
        lng1_radians = math.radians(lng1)
        lat2_radians = math.radians(lat2)
        lng2_radians = math.radians(lng2)

        dlat = lat2_radians - lat1_radians
        dlng = lng2_radians - lng1_radians

        a = (math.sin(dlat / 2) ** 2 +
             math.cos(lat1_radians) * math.cos(lat2_radians) * math.sin(dlng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        return distance

class LocationViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing location instances.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def get_permissions(self):
        # Example: only admin can delete
        if self.action == 'destroy':
            self.permission_classes = [permissions.IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(LocationViewSet, self).get_permissions()
