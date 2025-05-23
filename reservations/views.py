from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.contrib.auth.models import User
from django.utils.timezone import localtime

from django.core.mail import send_mail
from django.shortcuts import render, redirect, get_object_or_404

from Assignment1WebDevelopment import settings
from .models import ConferenceRoom, Reservation
from .forms import ReservationForm, RoomForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.utils import timezone


@login_required
def room_list(request):
    rooms = ConferenceRoom.objects.all()
    return render(request, 'reservations/room_list.html', {'rooms': rooms})


@login_required
def make_reservation(request, room_id):
    room = get_object_or_404(ConferenceRoom, id=room_id)
    existing_reservations = Reservation.objects.filter(room=room, start_time__gt=timezone.now()).order_by('start_time')

    if request.method == 'POST':
        form = ReservationForm(request.POST, user=request.user)

        if form.is_valid():
            start_time = form.cleaned_data['start_time']
            end_time = form.cleaned_data['end_time']

            overlapping_reservations = Reservation.objects.filter(
                room=room,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

            if overlapping_reservations.exists():
                messages.error(request, "This time slot is already taken.")
            else:
                reservation = form.save(commit=False)

                if request.user.is_superuser and form.cleaned_data.get('user'):
                    reservation.user = form.cleaned_data['user']
                else:
                    reservation.user = request.user

                reservation.room = room
                reservation.save()

                start_time_local = localtime(start_time)
                end_time_local = localtime(end_time)

                subject = f"Reservation Confirmation for {room.name}"
                message = (
                    f"Dear {reservation.user.username},\n\n"
                    f"Your reservation for {room.name} has been confirmed.\n"
                    f"Start Time: {start_time_local.strftime('%Y-%m-%d %H:%M')}\n"
                    f"End Time: {end_time_local.strftime('%Y-%m-%d %H:%M')}\n\n"
                    f"Thank you for using our service!"
                )

                recipient_email = reservation.user.email
                if recipient_email:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [recipient_email]
                    )

                messages.success(request, "Reservation created successfully. A confirmation email has been sent.")
                return redirect('reservations:reservation_list')

    else:
        form = ReservationForm(user=request.user)

    return render(request, 'reservations/make_reservation.html', {
        'form': form,
        'room': room,
        'existing_reservations': existing_reservations
    })


@login_required
def reservation_list(request):
    if request.user.is_superuser:
        reservations = Reservation.objects.all()
    else:
        reservations = Reservation.objects.filter(user=request.user)


    if request.user.is_superuser:
        title = "All Reservations"
    else:
        title = "My Reservations"

    return render(request, 'reservations/reservations_list.html', {
        'reservations': reservations,
        'title': title,
    })


@login_required
def edit_reservation(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)

    if not request.user.is_superuser and reservation.user != request.user:
        messages.error(request, "You are not authorized to edit this reservation.")
        return redirect('reservations:reservation_list')

    if request.method == 'POST':
        form = ReservationForm(request.POST, instance=reservation, user=request.user)
        if form.is_valid():
            start_time = form.cleaned_data['start_time']
            end_time = form.cleaned_data['end_time']

            if start_time < timezone.now():
                messages.error(request, "Reservation cannot start in the past.")
            elif end_time <= start_time:
                messages.error(request, "End time must be after start time.")
            else:

                overlapping = Reservation.objects.filter(
                    room=reservation.room,
                    start_time__lt=end_time,
                    end_time__gt=start_time
                ).exclude(id=reservation.id).exists()

                if overlapping:
                    messages.error(request, "This time slot is already taken.")
                else:
                    # If no overlap, save the updated reservation
                    reservation_obj = form.save(commit=False)
                    if not request.user.is_superuser:
                        reservation_obj.user = reservation.user
                    reservation_obj.save()
                    messages.success(request, "Reservation updated successfully.")
                    return redirect('reservations:reservation_list')
    else:
        form = ReservationForm(instance=reservation, user=request.user)

    return render(request, 'reservations/edit_reservation.html', {'form': form})


@login_required
def cancel_reservation(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)

    if reservation.user == request.user or request.user.is_superuser:
        reservation.delete()
        messages.success(request, "Reservation cancelled successfully.")
    else:
        messages.error(request, "You are not authorized to cancel this reservation.")

    return redirect('reservations:reservation_list')


@login_required
def home(request):
    upcoming_reservations = Reservation.objects.filter(
        user=request.user,
        start_time__gte=timezone.now()
    ).order_by('start_time')[:5]

    return render(request, 'reservations/home.html', {
        'upcoming_reservations': upcoming_reservations
    })


def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('reservations:home')
        else:
            messages.error(request, 'Invalid username or password.')
    return render(request, 'reservations/login.html')

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_dashboard(request):
    return render(request, 'reservations/admin_dashboard.html')


def admin_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_superuser:
            login(request, user)
            return redirect('reservations:admin_dashboard')
        else:
            messages.error(request, 'Invalid username or password, or you are not an admin.')
    return render(request, 'admin_login.html')


@login_required
@user_passes_test(lambda u: u.is_superuser)
def user_management(request):
    users = User.objects.all()

    if request.method == 'POST':
        action = request.POST.get('action')
        user_id = request.POST.get('user_id')

        if action == 'delete' and user_id:
            user_to_delete = get_object_or_404(User, id=user_id)
            user_to_delete.delete()
            messages.success(request, f'User {user_to_delete.username} has been deleted.')
        elif action == 'create':
            return redirect('reservations:create_user')

    return render(request, 'reservations/admin_user_management.html', {'users': users})


# View to create a new user (admin only)
@login_required
@user_passes_test(lambda u: u.is_superuser)
def create_user(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'New user created successfully.')
            return redirect('reservations:user_management')
    else:
        form = UserCreationForm()

    return render(request, 'reservations/create_user.html', {'form': form})



@login_required
@user_passes_test(lambda u: u.is_superuser)
def edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = UserChangeForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, f'User {user.username} has been updated.')
            return redirect('reservations:user_management')
    else:
        form = UserChangeForm(instance=user)

    return render(request, 'reservations/edit_user.html', {'form': form, 'user': user})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_panel_reservation(request):
    if request.method == 'POST':
        form = ReservationForm(request.POST)
        if form.is_valid():
            reservation = form.save(commit=False)
            if not reservation.user:
                reservation.user = request.user  # fallback
            reservation.save()
            messages.success(request, 'Reservation created successfully.')
            return redirect('reservations:user_management')
    else:
        form = ReservationForm()

    return render(request, 'reservations/admin_make_reservation.html', {'form': form})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_panel(request):
    rooms = ConferenceRoom.objects.all()
    users = User.objects.all()
    return render(request, 'reservations/admin_panel.html', {
        'rooms': rooms,
        'users': users,
    })

@login_required
@user_passes_test(lambda u: u.is_superuser)
def add_room(request):
    if request.method == 'POST':
        form = RoomForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Room added successfully.")
            return redirect('reservations:admin_panel')
    else:
        form = RoomForm()
    return render(request, 'reservations/add_room.html', {'form': form})


@login_required
@user_passes_test(lambda u: u.is_superuser)
def edit_room(request, room_id):
    room = get_object_or_404(ConferenceRoom, id=room_id)
    if request.method == 'POST':
        form = RoomForm(request.POST, instance=room)
        if form.is_valid():
            form.save()
            messages.success(request, "Room updated successfully.")
            return redirect('reservations:admin_panel')
    else:
        form = RoomForm(instance=room)
    return render(request, 'reservations/edit_room.html', {'form': form, 'room': room})


@login_required
@user_passes_test(lambda u: u.is_superuser)
def delete_room(request, room_id):
    room = get_object_or_404(ConferenceRoom, id=room_id)
    if request.method == 'POST':
        room.delete()
        messages.success(request, f"Room {room.name} has been deleted.")
        return redirect('reservations:admin_panel')
    return render(request, 'reservations/confirm_delete_room.html', {'room': room})




