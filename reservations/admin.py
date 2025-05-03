from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from .models import ConferenceRoom, Reservation
from django import forms
from django.utils import timezone
from django.contrib import messages


class ReservationForm(forms.ModelForm):
    class Meta:
        model = Reservation
        fields = ['room', 'user', 'start_time', 'end_time']

    def clean(self):
        cleaned_data = super().clean()
        room = cleaned_data.get('room')
        start_time = cleaned_data.get('start_time')
        end_time = cleaned_data.get('end_time')

        if room and start_time and end_time:
            overlapping_reservations = Reservation.objects.filter(
                room=room,
                start_time__lt=end_time,
                end_time__gt=start_time
            )

            if overlapping_reservations.exists():
                raise forms.ValidationError("This time slot is already taken. Conflicting reservation(s):")

        return cleaned_data


class ReservationAdmin(admin.ModelAdmin):
    form = ReservationForm
    list_display = ('room', 'user', 'start_time', 'end_time')
    search_fields = ('room__name', 'user__username')

    def save_model(self, request, obj, form, change):
        if request.user.is_superuser and not obj.user:
            obj.user = request.user
        super().save_model(request, obj, form, change)


def room_list_admin_view(request):
    rooms = ConferenceRoom.objects.all()
    return render(request, 'admin/room_list.html', {'rooms': rooms})


class ConferenceRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity', 'location')
    search_fields = ('name', 'location')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('room_list/', self.admin_site.admin_view(room_list_admin_view), name='room_list_admin'),
        ]
        return custom_urls + urls


admin.site.register(ConferenceRoom, ConferenceRoomAdmin)
admin.site.register(Reservation, ReservationAdmin)
from django.contrib import admin

# Register your models here.
