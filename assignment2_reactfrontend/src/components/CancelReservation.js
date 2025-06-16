import React, { useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../constants';

function CancelReservation({ reservationId }) {
  const [message, setMessage] = useState('');

  const handleCancel = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BaseUrl}/cancel-reservation/${reservationId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      setMessage('Reservation cancelled.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error cancelling reservation.');
    }
  };

  return (
    <div>
      <h2>Cancel Reservation</h2>
      <button onClick={handleCancel}>Cancel</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CancelReservation;