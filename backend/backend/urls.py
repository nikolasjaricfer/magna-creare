<<<<<<< HEAD
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls')), 
    path('accounts/', include('django.contrib.auth.urls')),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # For obtaining JWT
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # For refreshing JWT
    path("api-auth/", include("rest_framework.urls"))
]
=======


from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), 
    path('auth/', include('allauth.urls')), 
]
>>>>>>> testing/testing/feature/Backend/OAuth2
