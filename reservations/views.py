from django.utils.timezone import localtime

from django.core.mail import send_mail
from django.shortcuts import render, redirect, get_object_or_404

from Assignment1WebDevelopment import settings
from .models import ConferenceRoom, Reservation
from .forms import ReservationForm
from django.contrib.auth.decorators import login_required
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
    return render(request, 'reservations/reservations_list.html', {'reservations': reservations})


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


from django.shortcuts import render

# Create your views here.
