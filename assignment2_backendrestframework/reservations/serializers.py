from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ConferenceRoom, Reservation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_superuser']

class ConferenceRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConferenceRoom
        fields = ['id', 'name', 'capacity', 'location']

class ReservationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    room = ConferenceRoomSerializer(read_only=True)
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=ConferenceRoom.objects.all(),
        source='room',
        write_only=True
    )

    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False
    )

    class Meta:
        model = Reservation
        fields = ['id', 'user', 'user_id', 'room', 'room_id', 'start_time', 'end_time']