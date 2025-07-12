from django.contrib import admin
# Register your models here.
from .models import Skill, Swap, Rating, AdminAction

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'category', 'level', 'type', 'status')
    search_fields = ('name', 'category', 'level', 'type', 'status')
    list_filter = ('category', 'level', 'type', 'status')
    ordering = ('-id',)
    readonly_fields = ('id',)

@admin.register(Swap)
class SwapAdmin(admin.ModelAdmin):
    list_display = ('id', 'requester', 'receiver', 'status')
    search_fields = ('status',)
    list_filter = ('status',)
    ordering = ('-id',)
    readonly_fields = ('id',)

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('id', 'swap', 'rater', 'rated', 'rating')
    search_fields = ('comment',)
    list_filter = ('rating',)
    ordering = ('-id',)
    readonly_fields = ('id',)

@admin.register(AdminAction)
class AdminActionAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin', 'action_type', 'target_id', 'reason')
    search_fields = ('action_type', 'reason')
    list_filter = ('action_type',)
    ordering = ('-id',)
    readonly_fields = ('id',)
from django.contrib import admin

# Register your models here.
