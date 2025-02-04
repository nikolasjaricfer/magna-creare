# Generated by Django 5.1.4 on 2024-12-12 17:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_quiz_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='max_team_members',
            field=models.IntegerField(default=4),
        ),
        migrations.AddField(
            model_name='team',
            name='members_count',
            field=models.IntegerField(default=1),
        ),
    ]
