
from rest_framework import serializers
from .models import User, Guest, Quiz, Team, Review, FavoriteOrganizer, Notification, Location
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from dj_rest_auth.registration.serializers import SocialLoginSerializer

User = get_user_model()


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
    
class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ['id', 'username', 'email', 'role']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'place_id']

class QuizSerializer(serializers.ModelSerializer):
    organizer = serializers.PrimaryKeyRelatedField(read_only=True)
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    class Meta:
        model = Quiz
        fields = '__all__'
        read_only_fields = ['organizer', 'created_at']

class TeamSerializer(serializers.ModelSerializer):
    registered_by = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['registered_by', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'user']


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


class ChangeUsernameSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value


