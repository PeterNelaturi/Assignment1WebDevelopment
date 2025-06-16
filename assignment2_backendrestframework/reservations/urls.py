from django.urls import path, include


from . import views

urlpatterns = [

    path('rooms/', views.room_list_api, name='room-list'),
    path('rooms/add/', views.add_room_api, name='add-room'),
    path('rooms/<int:room_id>/edit/', views.edit_room_api, name='edit-room'),
    path('rooms/<int:room_id>/delete/', views.delete_room_api, name='delete-room'),

    # Reservation APIs
    path('reservations/', views.reservation_list_api, name='reservation-list'),
    path('reservations/make/', views.make_reservation_api, name='make-reservation'),
    path('reservations/<int:reservation_id>/edit/', views.edit_reservation_api, name='edit-reservation'),
    path('reservations/<int:reservation_id>/cancel/', views.cancel_reservation_api, name='cancel-reservation'),
    path('reservations/upcoming/', views.upcoming_reservations_api, name='upcoming-reservations'),


    path('users/', views.user_management_api, name='user-management'),
    path('users/create/', views.create_user_api, name='create-user'),
    path('users/<int:user_id>/edit/', views.edit_user_api, name='edit-user'),
    path('users/<int:user_id>/delete/', views.delete_user_api, name='delete-user'),


    path('admin-panel/', views.admin_panel_api, name='admin-panel'),

]