

from django.urls import path
from django.contrib.auth.views import LogoutView
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    #log in i log out implementirani preko djanga

    path('accountManager/', views.account_page, name='account_page'),
    path('accountManager/password_change/', views.change_password, name='password_change')
]
