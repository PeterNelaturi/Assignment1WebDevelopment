import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {

      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password
      });


      const token = response.data.token;
      const isAdmin = response.data.is_superuser; // admin flag from Django backend


      localStorage.setItem('token', token);
      localStorage.setItem('isAdmin', isAdmin); // save the admin status

      setSuccessMessage('Login successful!');
      setUsername('');
      setPassword('');


      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (error) {
      setError('Login failed: ' + (error.response?.data?.detail || error.message));
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
      <input
  type="text"
  placeholder="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
  disabled={loading}
  style={{
    padding: '12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  }}
/>
    </div>
              <div style={{ marginBottom: '10px' }}>
      <input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  disabled={loading}
  style={{
    padding: '12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  }}
/>
    </div>
      <button
  type="submit"
  disabled={loading}
  style={{
    padding: '12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007BFF',
    color: 'white',
    cursor: 'pointer'
  }}
>
  {loading ? 'Logging in...' : 'Login'}
</button>

    {error && <p style={{ color: 'red', margin: '0' }}>{error}</p>}
    {successMessage && <p style={{ color: 'green', margin: '0' }}>{successMessage}</p>}
    </form>
  );
}

export default Login;