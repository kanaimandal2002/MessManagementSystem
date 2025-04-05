import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BorderDashboard() {
  const username = localStorage.getItem("username");
  localStorage.setItem("username", "border")

  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // ✅ Manage meal status

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username, navigate]);

  const handleToggle = (newStatus) => {
    const today = new Date().toISOString().split('T')[0];
    console.log('Sending to API:', { username, status: newStatus, date: today });

    axios.post('http://localhost:5000/api/meal', {
      username,
      status: newStatus,
      date: today
    })
    .then((res) => {
      console.log('API response:', res.data);
      setStatus(newStatus);
    })
    .catch((err) => {
      console.error('Error sending meal status:', err);
    });
  };

  return (
    <div className="container">
      <h2>Welcome, {username}</h2>
      <p>Mark your meal status for today:</p>
      <button onClick={() => handleToggle('ON')}>Meal ON</button>
      <button onClick={() => handleToggle('OFF')}>Meal OFF</button>
      {status && (
        <p>
          <span role="img" aria-label="check">✅</span> Status set to: {status}
        </p>
      )}
    </div>
  );
}

export default BorderDashboard;
