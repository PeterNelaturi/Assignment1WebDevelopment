from django.contrib.auth import authenticate
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.timezone import now, localtime
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token


from assignment2_backendrestframework import settings
from .models import ConferenceRoom, Reservation
from .serializers import ConferenceRoomSerializer, ReservationSerializer, UserSerializer


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def room_list_api(request):
    rooms = ConferenceRoom.objects.all()
    serializer = ConferenceRoomSerializer(rooms, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def make_reservation_api(request):
    data = request.data.copy()


    if not request.user.is_superuser:
        data['user_id'] = request.user.id

    serializer = ReservationSerializer(data=data)
    if serializer.is_valid():
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        room = serializer.validated_data['room']

        overlapping = Reservation.objects.filter(
            room=room,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        if overlapping.exists():
            return Response({'error': 'This time slot is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        reservation = serializer.save()


        if reservation.user.email:
            send_mail(
                subject='Conference Room Reservation Confirmed',
                message=f'Your reservation for room {reservation.room.name} from '
                        f'{localtime(reservation.start_time).strftime("%Y-%m-%d %H:%M")} to '
                        f'{localtime(reservation.end_time).strftime("%Y-%m-%d %H:%M")} is confirmed.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[reservation.user.email],
                fail_silently=True,
            )

        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


    print(serializer.errors)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def reservation_list_api(request):
    if request.user.is_superuser:
        reservations = Reservation.objects.all()
    else:
        reservations = Reservation.objects.filter(user=request.user)
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.AllowAny])
def edit_reservation_api(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)

    if not (request.user.is_superuser or reservation.user == request.user):
        return Response({'error': 'Not authorized to edit this reservation.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    if not request.user.is_superuser:
        data['user_id'] = reservation.user.id

    serializer = ReservationSerializer(reservation, data=data, partial=True)
    if serializer.is_valid():
        start_time = serializer.validated_data.get('start_time', reservation.start_time)
        end_time = serializer.validated_data.get('end_time', reservation.end_time)
        room = serializer.validated_data.get('room', reservation.room)


        overlapping = Reservation.objects.filter(
            room=room,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exclude(id=reservation.id)

        if overlapping.exists():
            return Response({'error': 'This time slot is already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def cancel_reservation_api(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)

    if not (request.user.is_superuser or reservation.user == request.user):
        return Response({'error': 'Not authorized to cancel this reservation.'}, status=status.HTTP_403_FORBIDDEN)

    reservation.delete()
    return Response({'message': 'Reservation cancelled successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def upcoming_reservations_api(request):
    reservations = Reservation.objects.filter(
        user=request.user,
        start_time__gte=now()
    ).order_by('start_time')[:5]
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def user_management_api(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def create_user_api(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data.get('email', ''),
            password=request.data.get('password')
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAdminUser])
def edit_user_api(request, user_id):
    user = get_object_or_404(User, id=user_id)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_user_api(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_panel_api(request):
    rooms = ConferenceRoom.objects.all()
    users = User.objects.all()
    rooms_data = ConferenceRoomSerializer(rooms, many=True).data
    users_data = UserSerializer(users, many=True).data
    return Response({'rooms': rooms_data, 'users': users_data})


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def add_room_api(request):
    serializer = ConferenceRoomSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAdminUser])
def edit_room_api(request, room_id):
    room = get_object_or_404(ConferenceRoom, id=room_id)
    serializer = ConferenceRoomSerializer(room, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_room_api(request, room_id):
    room = get_object_or_404(ConferenceRoom, id=room_id)
    room.delete()
    return Response({'message': f'Room {room.name} deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide username and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    token, created = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
         'username': user.username,
        'is_superuser': user.is_superuser
    })