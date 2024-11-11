

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    role = forms.ChoiceField(
        choices=[(User.USER, 'User'), (User.QUIZMAKER, 'Quiz Maker')],
        required=True,
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'password1', 'password2']
