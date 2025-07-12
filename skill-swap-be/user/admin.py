from django.contrib import admin
# Register your models here.
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'name', 'is_active', 'is_banned', 'role', 'email_verified')
    search_fields = ('email', 'name')
    list_filter = ('is_active', 'is_banned', 'role', 'email_verified')
    ordering = ('-id',)
    readonly_fields = ('id',)
from django.contrib import admin

# Register your models here.
