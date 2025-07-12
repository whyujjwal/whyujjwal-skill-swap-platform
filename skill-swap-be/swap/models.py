from django.db import models
import uuid
from django.conf import settings
from django.utils import timezone

class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=100)
    level = models.CharField(max_length=50)
    type = models.CharField(max_length=20) # offer or request
    status = models.CharField(max_length=20, default='pending')

class Swap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requested_swaps')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_swaps')
    requester_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requester_swaps')
    receiver_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='receiver_swaps')
    status = models.CharField(max_length=20, default='pending')
    # Structured proposed time slots: list of time slots [{"day": "Saturday", "start": "10:00", "end": "12:00"}, ...]
    proposed_time_slots = models.JSONField(default=list, blank=True)
    actual_time = models.DateTimeField(null=True, blank=True)

class Rating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    swap = models.ForeignKey(Swap, on_delete=models.CASCADE, related_name='ratings')
    rater = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_ratings')
    rated = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_ratings')
    rating = models.IntegerField()
    comment = models.TextField()

class AdminAction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=50)
    target_id = models.UUIDField()
    reason = models.TextField()

# Create your models here.
