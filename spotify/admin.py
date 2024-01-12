from django.contrib import admin
from .models import SpotifyToken

class TokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'refresh_token', 'access_token', 'expires_in')

admin.site.register(SpotifyToken, TokenAdmin)