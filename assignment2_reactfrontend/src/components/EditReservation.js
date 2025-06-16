import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../constants';

function EditReservationForm({ reservation, onCancel, onSave }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (reservation) {

      setStartTime(reservation.start_time.slice(0,16));
      setEndTime(reservation.end_time.slice(0,16));
    }
  }, [reservation]);

  const handleEdit = async () => {
      console.log('Sending startTime:', startTime, 'endTime:', endTime);
    const token = localStorage.getItem('token');
    try {
      const cleanBaseUrl = BaseUrl.trim();
      const cleanId = reservation.id.toString().trim();
      // const url = `${cleanBaseUrl}/edit-reservation/${cleanId}/`.trim();
        const url = `${cleanBaseUrl}/reservations/${cleanId}/edit/`;

      const startUTC = new Date(startTime).toISOString();
      const endUTC = new Date(endTime).toISOString();

    await axios.patch(url, {
    start_time: startUTC,
    end_time: endUTC,
    room_id: reservation.room.id,
}, {
  headers: { 'Authorization': `Token ${token}` },
});
      setMessage('Reservation updated.');
      onSave();  // Inform parent component to refresh
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating reservation.');
    }
  };

  return (
    <div>
      <h2>Edit Reservation</h2>
      <label>Start Time:</label>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <label>End Time:</label>
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <button onClick={handleEdit}>Update Reservation</button>
      <button onClick={onCancel}>Cancel</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditReservationForm;