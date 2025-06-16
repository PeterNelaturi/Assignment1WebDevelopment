import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ReservationForm() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await axios.get('http://localhost:8000/api/rooms/');
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      'http://localhost:8000/api/reservations/make/',
      {
        room_id: roomId,
        start_time: startTime,
        end_time: endTime,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      }
    );
    setMessage('Reservation created successfully! Email confirmation sent.');
  } catch (error) {
    setMessage('Failed to create reservation: ' + (error.response?.data?.error || error.message));
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Make a Reservation</h2>
      <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
        <option value="">Select a room</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />
      <button type="submit">Reserve</button>
      {message && (
      <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>
      {message}
      </p>
)}
    </form>
  );
}

export default ReservationForm;