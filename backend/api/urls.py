<<<<<<< HEAD
=======
# api/urls.py

>>>>>>> testing/testing/feature/Backend/OAuth2
from django.urls import path, include
from rest_framework import routers
from .views import (
    UserViewSet,
    QuizViewSet,
    TeamViewSet,
    ReviewViewSet,
    FavoriteOrganizerViewSet,
    NotificationViewSet,
    RegisterView,
<<<<<<< HEAD
    ChangePasswordView,
    CustomTokenObtainPairView
)

# Create a router and register viewsets with it
=======
    CustomMicrosoftLoginView
)

>>>>>>> testing/testing/feature/Backend/OAuth2
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'favorites', FavoriteOrganizerViewSet)
router.register(r'notifications', NotificationViewSet)

<<<<<<< HEAD
# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Include the router's URLs
    path('register/', RegisterView.as_view(), name='register'),
    path('accountManager/changePassword/', ChangePasswordView.as_view(), name='change_password'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair')####
]
=======
urlpatterns = [
    path('', include(router.urls)),  
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/', include('dj_rest_auth.urls')),  
    path('auth/registration/', include('dj_rest_auth.registration.urls')), 
    path('auth/social/login/microsoft/', CustomMicrosoftLoginView.as_view(), name='microsoft_login'),
]
>>>>>>> testing/testing/feature/Backend/OAuth2
