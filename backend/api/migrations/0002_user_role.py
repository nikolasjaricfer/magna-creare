# Generated by Django 5.1.3 on 2024-11-09 16:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('user', 'User'), ('quizmaker', 'Quiz Maker'), ('admin', 'Admin')], default='user', max_length=10),
        ),
    ]
