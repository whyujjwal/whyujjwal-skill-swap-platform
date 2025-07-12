from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Swap
from .serializers import SwapSerializer

class SwapCreateView(generics.CreateAPIView):
    serializer_class = SwapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        swap = serializer.save()
        return swap
from django.shortcuts import render

# Create your views here.
