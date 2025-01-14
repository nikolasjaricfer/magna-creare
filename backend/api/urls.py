



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
    ChangeUsernameView,
    CustomTokenObtainPairView,
    CustomMicrosoftLoginView,
    SearchView,
    LocationViewSet,
    LogoutView
)


router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'favorites', FavoriteOrganizerViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'locations', LocationViewSet)


urlpatterns = [
    path('', include(router.urls)),  # Include the router's URLs
    path('register/', RegisterView.as_view(), name='register'),
    path('accountManager/changePassword/', ChangePasswordView.as_view(), name='change_password'),
    path('accountManager/changeUsername/', ChangeUsernameView.as_view(), name='change_username'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), ####
    path('auth/', include('dj_rest_auth.urls')),  
    path('auth/registration/', include('dj_rest_auth.registration.urls')), 
    path('auth/social/login/microsoft/', CustomMicrosoftLoginView.as_view(), name='microsoft_login'),
    #path('auth/microsoft/login/', CustomMicrosoftLoginView.as_view(), name='microsoft_login'),## moje
    path('auth/social/callback/microsoft/', CustomMicrosoftLoginView.as_view(), name='microsoft_callback'),##
    path('search/', SearchView.as_view(), name='search'),
]