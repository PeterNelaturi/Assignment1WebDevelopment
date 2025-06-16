import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul style={{ display: 'flex', gap: '15px', listStyle: 'none' }}>
        <li><Link to="/">Rooms</Link></li>
        <li><Link to="/reservations">Reservations</Link></li>
        <li><Link to="/make-reservation">Make Reservation</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;