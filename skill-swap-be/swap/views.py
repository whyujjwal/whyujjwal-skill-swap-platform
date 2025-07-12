from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from .models import Skill, Swap, Rating
from .serializers import SwapSerializer
from django.shortcuts import get_object_or_404
from rest_framework import serializers

class SwapListCreateView(generics.ListCreateAPIView):
    serializer_class = SwapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Swap.objects.filter(requester=user) | Swap.objects.filter(receiver=user)

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

class SwapAcceptView(generics.UpdateAPIView):
    serializer_class = SwapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        swap = get_object_or_404(Swap, pk=pk)
        swap.status = 'accepted'
        swap.save()
        return Response({'message': 'Swap accepted.'})

class SwapRejectView(generics.UpdateAPIView):
    serializer_class = SwapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        swap = get_object_or_404(Swap, pk=pk)
        swap.status = 'rejected'
        swap.save()
        return Response({'message': 'Swap rejected.'})

class SwapCompleteView(generics.UpdateAPIView):
    serializer_class = SwapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        swap = get_object_or_404(Swap, pk=pk)
        swap.status = 'completed'
        swap.save()
        return Response({'message': 'Swap marked as completed.'})


# Rating APIs
class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Rating.objects.all()

# Skill APIs
class SkillSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Skill
        fields = '__all__'

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    queryset = Skill.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
