from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.crypto import get_random_string



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
    


class Guest(models.Model):
    username = models.CharField(max_length=150, unique=True, blank=True)  # Allow blank for auto-generation
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=10, default='guest', editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = f"guest_{get_random_string(8)}"  # Generate a random username
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username



class Role(models.Model):
    role_name = models.CharField(max_length=50)

    def __str__(self):
        return self.role_name

class Quiz(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50)
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

    def __str__(self):
        return self.title

class Team(models.Model):
    name = models.CharField(max_length=100)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='teams')
    registered_by = models.ForeignKey('User', on_delete=models.CASCADE, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)

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
