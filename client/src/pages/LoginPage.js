import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      localStorage.setItem('username', res.data.username);

      if (res.data.role === 'admin') {
        navigate('/admin');
      } else if (res.data.role === 'border') {
        navigate('/border');
      } else {
        setError('Unknown role');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password');
    }
  };

  const handleCancel = () => {
    navigate('/'); // 👈 Takes back to IndexPage
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow rounded-4 col-md-6 mx-auto">
        <h2 className="text-center mb-4">Mess Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username:</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button group: Login and Cancel */}
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">Login</button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
