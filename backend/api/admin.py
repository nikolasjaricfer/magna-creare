

from django.contrib import admin
from .models import User, Role, Quiz, Team, Review, FavoriteOrganizer, Notification

admin.site.register(User)
admin.site.register(Role)
admin.site.register(Quiz)
admin.site.register(Team)
admin.site.register(Review)
admin.site.register(FavoriteOrganizer)
admin.site.register(Notification)
