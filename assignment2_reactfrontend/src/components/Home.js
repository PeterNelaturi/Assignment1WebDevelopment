import React, { useState, useEffect } from 'react';
import Login from './Login';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import RoomList from './RoomList';
import ReservationList from './ReservationList';
import ReservationForm from './ReservationForm';
import AdminPanel from './AdminPanel';
import UserControlPanel from './UserControlPanel'; // Import UserControlPanel

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminFlag = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(adminFlag);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const adminFlag = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminFlag);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setIsAdmin(false);
  };



  if (!isLoggedIn) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1>Welcome to Conference Room Reservation System</h1>
      <div style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

  return (
    <Router>
      <nav>
        <ul style={{ display: 'flex', gap: '15px', listStyle: 'none' }}>
          <li><Link to="/">Rooms</Link></li>
          {!isAdmin &&<li><Link to="/reservations">My Reservations</Link></li>}
          {isAdmin &&<li><Link to="/reservations">All Reservations</Link></li>}
          {!isAdmin && <li><Link to="/make-reservation">Make Reservation</Link></li>}
          {isAdmin && <li><Link to="/admin-panel">Admin Panel</Link></li>}
          {isAdmin && <li><Link to="/user-control-panel">User Control Panel</Link></li>}
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>

     <Routes>
  <Route path="/" element={<RoomList />} />
  <Route path="/reservations" element={<ReservationList />} />
  <Route path="/make-reservation" element={<ReservationForm />} />
  <Route path="/admin-panel" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
  <Route path="/user-control-panel" element={isAdmin ? <UserControlPanel /> : <Navigate to="/" />} />
     </Routes>
    </Router>
  );
}

export default Home;