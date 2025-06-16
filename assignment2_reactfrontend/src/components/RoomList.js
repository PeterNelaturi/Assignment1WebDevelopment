import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await axios.get('http://localhost:8000/api/rooms/');
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms', error);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div>
      <h2>Conference Rooms</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rooms.map((room) => (
          <li
            key={room.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#f5f5f5',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <strong>{room.name}</strong> <br />
            Capacity: {room.capacity} <br />
            Location: {room.location}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;