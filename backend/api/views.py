
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
##
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.microsoft.views import MicrosoftGraphOAuth2Adapter
from .serializers import CustomMicrosoftLoginSerializer
from django.http import HttpResponseRedirect
##
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.contrib.auth import logout



from .models import (
    Quiz,
    Team,
    Review,
    FavoriteOrganizer,
    Notification,
    Location
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
    ChangeUsernameSerializer,
    LocationSerializer
)
###
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role  # Dodaj korisničku ulogu u odgovor
        data['id'] = self.user.id  ##
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
###
User = get_user_model()


##
class CustomMicrosoftLoginView(SocialLoginView):
    adapter_class = MicrosoftGraphOAuth2Adapter
    serializer_class = CustomMicrosoftLoginSerializer

    def get_response(self):
        response = super().get_response()
        user = self.request.user
        access_token = response.data.get('access_token')
        refresh_token = response.data.get('refresh_token')

        # Customize redirect URL to include token  
        frontend_url = f"https://quiz-finder.onrender.com/login?access_token={access_token}&refresh_token={refresh_token}" 
        # tu treba umjesto register stavit neku drugu stranicu koja ce primit tokene, provjerit jesu li postavljeni username i uloga i onda ce se otic na /quiz
        #frontend_url = f"http://localhost:8000/auth/social/callback/microsoft/?access_token={access_token}&refresh_token={refresh_token}"
        return HttpResponseRedirect(frontend_url)
##


class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class QuizViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing quiz instances.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def perform_create(self, serializer):
        # Automatically set the quiz organizer to the current user
        # Make sure the logged-in user is a quizmaker if required
        
        if self.request.user.role != User.QUIZMAKER:
            raise ValidationError("Only quizmakers can create quizzes.")
        
        serializer.save(organizer=self.request.user)


class TeamViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing team instances.
    """
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]
    

    def perform_create(self, serializer):
        user = self.request.user
        quiz = serializer.validated_data.get('quiz')
        members_count = serializer.validated_data.get('members_count')
        # Check if the user is a quizmaker and if they are trying to sign up to their own quiz
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
        # If above condition not met, proceed with creation
        serializer.save(registered_by=user)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        quiz = serializer.validated_data.get('quiz')

        # Check attendance
        attended = Team.objects.filter(quiz=quiz, registered_by=user).exists()
        if not attended:
            raise ValidationError("You cannot review a quiz you did not attend.")

        # Check if quiz ended
        quiz_end_time = quiz.start_time + timedelta(minutes=quiz.duration)
        if timezone.now() < quiz_end_time:
            raise ValidationError("You can only leave a review after the quiz has ended.")

        serializer.save(user=user)


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

        # Generate JWT token manually
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Prepare response data
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



class ChangeUsernameView(APIView):
    """
    API view to change username.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        print(user.username)
        serializer = ChangeUsernameSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            print(user.username)
            return Response({"success": "Username updated successfully"}, status=status.HTTP_200_OK)

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

        # Quizzes that match title and are in the future
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

        # Organizers with quizmaker role
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

        # Quizzes by location name (future)
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
    
    # api/views.py (continued)

class LocationViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing location instances.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]  # Allows any authenticated user

    # Optional: Customize permissions for specific actions
    # For example, allow only admin users to delete locations
    def get_permissions(self):
        if self.action == 'destroy':
            self.permission_classes = [permissions.IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(LocationViewSet, self).get_permissions()
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"success": "Logged out successfully"}, status=status.HTTP_200_OK)