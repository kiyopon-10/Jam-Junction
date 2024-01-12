from django.contrib import admin
from .models import Room

class RoomAdmin(admin.ModelAdmin):
    list_display = ('code', 'host', 'guest_can_pause', 'votes_to_skip', 'created_at')

admin.site.register(Room, RoomAdmin)
