

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    USER = 'user'
    QUIZMAKER = 'quizmaker'
    ADMIN = 'admin'

    ROLE_CHOICES = [
        (USER, 'User'),
        (QUIZMAKER, 'Quiz Maker'),
        (ADMIN, 'Admin'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=USER,
    )

    def __str__(self):
        return self.username

class Role(models.Model):
    role_name = models.CharField(max_length=50)

    def __str__(self):
        return self.role_name

class Quiz(models.Model):
    CATEGORY_CHOICES = [
        ('general_knowledge', 'General Knowledge'),
        ('music', 'Music'),
        ('sports', 'Sports'),
        ('other', 'Other'),
    ]
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general_knowledge')
    difficulty = models.CharField(max_length=20, choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')])
    location = models.CharField(max_length=255)
    max_teams = models.IntegerField()
    registration_deadline = models.DateTimeField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField()  # Duration in minutes
    organizer = models.ForeignKey('User', on_delete=models.CASCADE, related_name='organized_quizzes')
    is_league = models.BooleanField(default=False)
    prizes = models.TextField(blank=True)
    start_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    max_team_members = models.IntegerField(default=4)

    def __str__(self):
        return self.title

class Team(models.Model):
    name = models.CharField(max_length=100)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='teams')
    registered_by = models.ForeignKey('User', on_delete=models.CASCADE, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)
    members_count = models.IntegerField(default=1)

    def __str__(self):
        return self.name

class Review(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    rating = models.IntegerField()  # Rating from 1 to 5
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.quiz.title}"

class FavoriteOrganizer(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='favorites')
    organizer = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} favorites {self.organizer.username}"

class Notification(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.user.username}"
