
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

from .models import (
    Quiz,
    Team,
    Review,
    FavoriteOrganizer,
    Notification,
)
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    QuizSerializer,
    TeamSerializer,
    ReviewSerializer,
    FavoriteOrganizerSerializer,
    NotificationSerializer,
    ChangePasswordSerializer
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

        # If above condition not met, proceed with creation
        serializer.save(registered_by=user)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing review instances.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
