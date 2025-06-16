import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../constants';


function AddRoom({ onRoomAdded }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BaseUrl}/rooms/add/`, { name, capacity, location }, {
        headers: { Authorization: `Token ${token}` },
      });
      setName('');
      setCapacity('');
      setLocation('');
      onRoomAdded();
    } catch (err) {
      setError('Failed to add room: ' + (err.response?.data?.error || JSON.stringify(err.response?.data) || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>Add New Room</h3>
      <input
        type="text"
        placeholder="Room Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={e => setCapacity(e.target.value)}
        required
        min={1}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Room'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}


function EditRoom({ room, onRoomUpdated }) {
  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(room.capacity);
  const [location, setLocation] = useState(room.location);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BaseUrl}/rooms/${room.id}/edit/`, { name, capacity, location }, {
        headers: { Authorization: `Token ${token}` },
      });
      setEditing(false);
      onRoomUpdated();
    } catch (err) {
      setError('Failed to update room: ' + (err.response?.data?.error || JSON.stringify(err.response?.data) || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div>
        <button onClick={() => setEditing(true)}>Edit</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <input
        type="text"
        placeholder="Room Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={e => setCapacity(e.target.value)}
        required
        min={1}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
      <button type="button" onClick={() => setEditing(false)} disabled={loading} style={{ marginLeft: '0.5rem' }}>
        Cancel
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}


async function deleteRoom(roomId, onDeleted) {
  if (!window.confirm('Are you sure you want to delete this room?')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${BaseUrl}/rooms/${roomId}/delete/`, {
      headers: { Authorization: `Token ${token}` },
    });
    onDeleted();
  } catch (err) {
    alert('Failed to delete room: ' + (err.response?.data?.error || err.message));
  }
}


export default function AdminPanel() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BaseUrl}/rooms/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setRooms(response.data);
    } catch (err) {
      setError('Failed to load rooms: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Admin Panel - Manage Conference Rooms</h2>

      <AddRoom onRoomAdded={fetchRooms} />

      {loading ? (
        <p>Loading rooms...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : rooms.length === 0 ? (
        <p>No conference rooms available.</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {rooms.map(room => (
            <li key={room.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
              <strong>{room.name}</strong> (Capacity: {room.capacity}) - Location: {room.location}
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  <EditRoom room={room} onRoomUpdated={fetchRooms} />
  <button
    onClick={() => deleteRoom(room.id, fetchRooms)}
    style={{
      marginTop: '0.4rem',
      color: 'white',
      backgroundColor: 'red',
      border: 'none',
      padding: '0.3rem 0.7rem',
      cursor: 'pointer',
      alignSelf: 'flex-start'  // ensures button aligns with Edit button's start
    }}
  >
    Delete
  </button>
</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}