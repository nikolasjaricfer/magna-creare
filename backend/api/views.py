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


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        now = timezone.now()

        if not q:
            return Response({
                "quizzes": [],
                "organizers": [],
                "locations": []
            }, status=200)

        quizzes = Quiz.objects.filter(
            Q(title__icontains=q),
            start_time__gt=now
        )
        quizzes_data = [
            {
                "id": quiz.id,
                "title": quiz.title,
                "location": quiz.location.name,
                "start_time": quiz.start_time,
                "type": "quiz"
            }
            for quiz in quizzes
        ]

        organizers = User.objects.filter(
            role=User.QUIZMAKER,
            username__icontains=q
        )
        organizers_data = [
            {
                "id": organizer.id,
                "username": organizer.username,
                "role": organizer.role,
                "type": "organizer"
            }
            for organizer in organizers
        ]

        location_quizzes = Quiz.objects.filter(
            Q(location__name__icontains=q),
            start_time__gt=now
        )
        locations_data = [
            {
                "id": loc_quiz.id,
                "title": loc_quiz.title,
                "location": loc_quiz.location.name,
                "start_time": loc_quiz.start_time,
                "type": "location"
            }
            for loc_quiz in location_quizzes
        ]

        return Response({
            "quizzes": quizzes_data,
            "organizers": organizers_data,
            "locations": locations_data
        }, status=200)


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
