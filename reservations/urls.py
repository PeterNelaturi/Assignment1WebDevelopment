from django.urls import path
from . import views

app_name = 'reservations'

urlpatterns = [
    path('', views.home, name='home'),
    path('rooms/', views.room_list, name='room_list'),
    path('reservations/<int:room_id>/make/', views.make_reservation, name='make_reservation'),
    path('reservations/', views.reservation_list, name='reservation_list'),
    path('reservations/<int:reservation_id>/edit/', views.edit_reservation, name='edit_reservation'),
    path('reservations/<int:reservation_id>/cancel/', views.cancel_reservation, name='cancel_reservation'),
    path('login/', views.user_login, name='login'),
    path('admin-login/', views.admin_login, name='admin_login'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('user-management/', views.user_management, name='user_management'),
    path('admin-panel/', views.admin_panel, name='admin_panel'),

    path('admin-panel/make-reservation/', views.admin_panel_reservation, name='admin_panel_make_reservation'),
    path('admin-panel/add-room/', views.add_room, name='add_room'),
    path('admin-panel/edit-room/<int:room_id>/', views.edit_room, name='edit_room'),
    path('admin-panel/delete-room/<int:room_id>/', views.delete_room, name='delete_room'),
    path('create-user/', views.create_user, name='create_user'),
    path('edit-user/<int:user_id>/', views.edit_user, name='edit_user'),
]