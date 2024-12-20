
from rest_framework import serializers
from .models import User, Quiz, Team, Review, FavoriteOrganizer, Notification
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

##
from dj_rest_auth.registration.serializers import SocialLoginSerializer

class CustomMicrosoftLoginSerializer(SocialLoginSerializer):
    username = serializers.CharField(required=True)
    role = serializers.ChoiceField(choices=[
        ('user', 'User'),
        ('quizmaker', 'Quiz Maker'),
    ], required=True)

    def validate(self, attrs):
        data = super().validate(attrs)
        return data

    def save(self, request):
        return super().save(request)

##


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, label='Confirm Password')

    class Meta:
        model = User
        fields = ['username', 'email', 'role', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords must match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class FavoriteOrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteOrganizer
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({'old_password': 'Old password is incorrect'})
        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()

