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
    CustomMicrosoftLoginView
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'favorites', FavoriteOrganizerViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),  
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/', include('dj_rest_auth.urls')),  
    path('auth/registration/', include('dj_rest_auth.registration.urls')), 
    path('auth/social/login/microsoft/', CustomMicrosoftLoginView.as_view(), name='microsoft_login'),
]
