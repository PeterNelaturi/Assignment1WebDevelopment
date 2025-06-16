import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../constants';

function MyReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BaseUrl}/reservation-list/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(res => setReservations(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>My Reservations</h2>
      <ul>
        {reservations.map(res => (
          <li key={res.id}>
            Room: {res.room.name} <br />
            From: {res.start_time} <br />
            To: {res.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyReservations;