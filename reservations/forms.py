from django import forms
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Reservation
from .models import ConferenceRoom

class ReservationForm(forms.ModelForm):
    class Meta:
        model = Reservation
        fields = ['room', 'start_time', 'end_time', 'user']
        widgets = {
            'start_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'end_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)


        now = timezone.now()
        self.fields['start_time'].initial = now
        self.fields['end_time'].initial = now + timedelta(hours=1)


        self.fields['user'] = forms.ModelChoiceField(
            queryset=User.objects.all(),
            required=False,
            label='Reserve for User'
        )

        if user and not user.is_superuser:
            self.fields['user'].initial = user
            self.fields['user'].widget = forms.HiddenInput()

    def clean(self):
        cleaned_data = super().clean()
        start_time = cleaned_data.get('start_time')
        end_time = cleaned_data.get('end_time')

        if start_time and end_time and start_time >= end_time:
            raise forms.ValidationError("End time must be after start time.")

        return cleaned_data

    def clean_start_time(self):
        start_time = self.cleaned_data.get('start_time')
        if start_time and start_time < timezone.now():
            raise forms.ValidationError("Start time cannot be in the past.")
        return start_time

    def clean_end_time(self):
        end_time = self.cleaned_data.get('end_time')
        if end_time and end_time < timezone.now():
            raise forms.ValidationError("End time cannot be in the past.")
        return end_time

class RoomForm(forms.ModelForm):
        class Meta:
            model = ConferenceRoom
            fields = ['name', 'capacity', 'location']