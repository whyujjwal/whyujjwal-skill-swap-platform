# Admin API views stubs
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from user.models import User
from swap.models import Skill

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]
    # Add pagination and serializer

class UserBanView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]
    # Implement ban/unban logic

class PendingSkillsView(generics.ListAPIView):
    queryset = Skill.objects.filter(status='pending')
    permission_classes = [permissions.IsAdminUser]
    # Add serializer

class ApproveSkillView(generics.UpdateAPIView):
    queryset = Skill.objects.filter(status='pending')
    permission_classes = [permissions.IsAdminUser]
    # Implement approve logic

class RejectSkillView(generics.UpdateAPIView):
    queryset = Skill.objects.filter(status='pending')
    permission_classes = [permissions.IsAdminUser]
    # Implement reject logic

class BroadcastMessageView(generics.CreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    # Implement broadcast logic
from django.shortcuts import render

# Create your views here.
