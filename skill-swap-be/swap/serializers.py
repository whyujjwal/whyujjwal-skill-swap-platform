from rest_framework import serializers
from .models import Swap

class SwapSerializer(serializers.ModelSerializer):
    proposed_time_slots = serializers.ListField(child=serializers.DictField(), required=False)

    class Meta:
        model = Swap
        fields = ['id', 'requester', 'receiver', 'requester_skill', 'receiver_skill', 'status', 'proposed_time_slots', 'actual_time']
