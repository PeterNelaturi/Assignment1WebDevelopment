import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../constants'; // Your Django API URL base

function MakeReservation() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${BaseUrl}/room-list/`)
      .then(res => setRooms(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
     const token = localStorage.getItem('token');

    const startLocal = startTime;
    const endLocal = endTime;

    try {
      await axios.post(`${BaseUrl}/make-reservation/`, {
        room: roomId,
        start_time: startLocal,
        end_time: endLocal,
      }, {
        headers: { 'Authorization': `Token ${token}` }
      });
      setMessage('Reservation made successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error making reservation.');
    }
  };

  return (
    <div>
      <h2>Make Reservation</h2>
      <form onSubmit={handleSubmit}>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          <option value="">Select Room</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        <button type="submit">Reserve</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default MakeReservation;