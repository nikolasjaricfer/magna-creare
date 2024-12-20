
# api/urls.py


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
    ChangePasswordView,
    CustomTokenObtainPairView,
    CustomMicrosoftLoginView
)

# Create a router and register viewsets with it
router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'favorites', FavoriteOrganizerViewSet)
router.register(r'notifications', NotificationViewSet)

# Define URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Include the router's URLs
    path('register/', RegisterView.as_view(), name='register'),
    path('accountManager/changePassword/', ChangePasswordView.as_view(), name='change_password'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), ####
    path('auth/', include('dj_rest_auth.urls')),  
    path('auth/registration/', include('dj_rest_auth.registration.urls')), 
    path('auth/social/login/microsoft/', CustomMicrosoftLoginView.as_view(), name='microsoft_login'),
    #path('auth/microsoft/login/', CustomMicrosoftLoginView.as_view(), name='microsoft_login'),## moje
    path('auth/social/callback/microsoft/', CustomMicrosoftLoginView.as_view(), name='microsoft_callback'),##

]