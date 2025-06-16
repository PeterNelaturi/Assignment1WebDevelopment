  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import { BaseUrl } from '../constants';

  export default function UserControlPanel() {
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [userForm, setUserForm] = useState({ username : '', email: '', password: '' });
    const [editingUserId, setEditingUserId] = useState(null);


    const [reservationForm, setReservationForm] = useState({ user_id: '', room_id: '', start_time: '', end_time: '' });

    useEffect(() => {
      checkAdminAndFetch();
    }, []);

    const checkAdminAndFetch = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not logged in.');
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Token ${token}` };
        await axios.get(`${BaseUrl}/admin-panel/`, { headers });
        const [usersRes, roomsRes, reservationsRes] = await Promise.all([
          axios.get(`${BaseUrl}/users/`, { headers }),
          axios.get(`${BaseUrl}/rooms/`, { headers }),
          axios.get(`${BaseUrl}/reservations/`, { headers })
        ]);
        setUsers(usersRes.data);
        setRooms(roomsRes.data);
        setReservations(reservationsRes.data);
      } catch (err) {
        setError('Access denied or failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    const handleUserFormChange = e => {
      setUserForm({ ...userForm, [e.target.name]: e.target.value });
    };

    const handleAddOrUpdateUser = async e => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      try {
        if (editingUserId) {
          await axios.put(`${BaseUrl}/users/${editingUserId}/edit/`, userForm, { headers });
        } else {
          await axios.post(`${BaseUrl}/users/create/`, userForm, { headers });
        }
        setUserForm({ username: '', email: '', password: '' });
        setEditingUserId(null);
        checkAdminAndFetch();
      } catch (err) {
        alert('Error saving user: ' + (err.response?.data?.error || err.message));
      }
    };

    const handleEditUser = user => {
      setUserForm({ username: user.username, email: user.email, password: '' }); // password not shown
      setEditingUserId(user.id);
    };

    const handleDeleteUser = async userId => {
      if (!window.confirm('Are you sure to delete this user?')) return;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      try {
        await axios.delete(`${BaseUrl}/users/${userId}/delete/`, { headers });
        checkAdminAndFetch();
      } catch (err) {
        alert('Error deleting user: ' + (err.response?.data?.error || err.message));
      }
    };

    const handleReservationFormChange = e => {
      setReservationForm({ ...reservationForm, [e.target.name]: e.target.value });
    };

    const handleAddReservation = async e => {
      e.preventDefault();
      const { user_id, room_id, start_time, end_time } = reservationForm;
      if (!user_id || !room_id || !start_time || !end_time) {
        alert('Fill all reservation fields.');
        return;
      }
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      try {
        await axios.post(`${BaseUrl}/reservations/make/`, reservationForm, { headers });
        setReservationForm({ user_id: '', room: '', start_time: '', end_time: '' });
        setSuccessMessage('Reservation made successfully! Email confirmation sent.');
        checkAdminAndFetch();
      } catch (err) {
        alert('Error making reservation: ' + (err.response?.data?.error || err.message));
      }
    };

    const handleCancelReservation = async reservationId => {
      if (!window.confirm('Cancel this reservation?')) return;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      try {
        await axios.delete(`${BaseUrl}/reservations/${reservationId}/cancel/`, { headers });
        checkAdminAndFetch();
      } catch (err) {
        alert('Error cancelling reservation: ' + (err.response?.data?.error || err.message));
      }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
      <div style={{ padding: '1rem' }}>
        <h2>Admin Control Panel</h2>

        {/* User Management */}
        <section style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
          <h3>{editingUserId ? 'Edit User' : 'Add User'}</h3>
          <form onSubmit={handleAddOrUpdateUser}>
            <input name="username" placeholder="Username" value={userForm.username} onChange={handleUserFormChange} required />
            <input name="email" placeholder="Email" value={userForm.email} onChange={handleUserFormChange} required />
            <input name="password" placeholder="Password" type="password" value={userForm.password} onChange={handleUserFormChange} required={!editingUserId} />
            <button type="submit">{editingUserId ? 'Update' : 'Add'} User</button>
            {editingUserId && <button onClick={() => { setEditingUserId(null); setUserForm({ username: '', email: '', password: '' }); }}>Cancel Edit</button>}
          </form>
          <h4>Existing Users:</h4>
          <ul>
            {users.map(user => (
              <li key={user.id}>
                {user.username} ({user.email})
                <button onClick={() => handleEditUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Reservation Management */}
        <section style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Make Reservation on Behalf of User</h3>
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          <form onSubmit={handleAddReservation}>
            <select name="user_id" value={reservationForm.user_id} onChange={handleReservationFormChange} required>
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <select name="room_id" value={reservationForm.room_id} onChange={handleReservationFormChange} required>
              <option value="">Select Room</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input type="datetime-local" name="start_time" value={reservationForm.start_time} onChange={handleReservationFormChange} required />
            <input type="datetime-local" name="end_time" value={reservationForm.end_time} onChange={handleReservationFormChange} required />
            <button type="submit">Make Reservation</button>
          </form>

          <h4>Existing Reservations:</h4>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>User</th>
                <th>Room</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id}>
                  <td>{res.user.username}</td>
                  <td>{res.room.name}</td>
                  <td>{new Date(res.start_time).toLocaleString()}</td>
                  <td>{new Date(res.end_time).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleCancelReservation(res.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }