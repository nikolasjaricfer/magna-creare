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

]