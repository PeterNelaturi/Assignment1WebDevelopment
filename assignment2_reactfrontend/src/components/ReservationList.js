  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import EditReservationForm from './EditReservation';

  function ReservationList() {
    const [reservations, setReservations] = useState([]);
    const [editingReservation, setEditingReservation] = useState(null);

    useEffect(() => {
      fetchReservations();
    }, []);

    async function fetchReservations() {
      try {
        const token = localStorage.getItem('token');
        const url = 'http://localhost:8000/api/reservations/'.trim();

        const response = await axios.get(url, {
          headers: { Authorization: `Token ${token}` },
        });
        setReservations(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    async function handleCancel(reservationId) {
      if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
      try {
        const token = localStorage.getItem('token');
        const cleanId = reservationId.toString().trim();
        const url = `http://localhost:8000/api/reservations/${cleanId}/cancel/`.trim();

        await axios.delete(url, {
          headers: { Authorization: `Token ${token}` },
        });
        setReservations(reservations.filter(r => r.id !== reservationId));
      } catch (error) {
        alert('Failed to cancel reservation: ' + (error.response?.data?.error || error.message));
      }
    }

    return (
      <div>
        <h2>Your Reservations</h2>

        {editingReservation ? (
          <EditReservationForm
            reservation={editingReservation}
            onCancel={() => setEditingReservation(null)}
            onSave={() => {
              setEditingReservation(null);
              fetchReservations();
            }}
          />
        ) : (

            <ul style={{ listStyle: 'none', padding: 0 }}>
    {reservations.map((reservation) => (
      <li
        key={reservation.id}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9f9f9'
        }}
      >
        <div>
          <div><strong>User:</strong> {reservation.user.username}</div>
          <div><strong>Room:</strong> {reservation.room.name}</div>
          <div>

            <strong>From:</strong> {new Date(reservation.start_time).toLocaleString('en-US', { hour12: true })}
          </div>
          <div>

            <strong>To:</strong> {new Date(reservation.end_time).toLocaleString('en-US', { hour12: true })}
          </div>
        </div>

        <div>
          <button
            onClick={() => setEditingReservation(reservation)}
            style={{ marginRight: '8px', padding: '6px 12px', cursor: 'pointer' }}
          >
            Edit
          </button>
          <button
            onClick={() => handleCancel(reservation.id)}
            style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Cancel
          </button>
        </div>
      </li>
    ))}
  </ul>
        )}
      </div>
    );
  }

  export default ReservationList;