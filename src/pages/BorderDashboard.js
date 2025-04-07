import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BorderDashboard.css';

function BorderDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [monthlyMeals, setMonthlyMeals] = useState(0);

  const [userInfo, setUserInfo] = useState({ username: '', phone: '', room: '' });

  useEffect(() => {
    if (!username) {
      navigate('/login');
    } else {
      const today = new Date().toISOString().split('T')[0];

      axios.get(`http://localhost:5000/api/meal-status?username=${username}&date=${today}`)
        .then(res => setStatus(res.data.status || "OFF"))
        .catch(err => {
          console.error("Error fetching status:", err);
          setStatus("OFF");
        });

      axios.get(`http://localhost:5000/api/meal-history?username=${username}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error("Error fetching history:", err));

      axios.get(`http://localhost:5000/api/monthly-meals?username=${username}`)
        .then(res => setMonthlyMeals(res.data.mealCount))
        .catch(err => console.error("Error fetching monthly meals:", err));

      axios.get(`http://localhost:5000/api/user-info?username=${username}`)
        .then(res => setUserInfo(res.data))
        .catch(err => console.error("Error fetching user info:", err));
    }
  }, [username, navigate]);

  const handleToggle = () => {
    const today = new Date().toISOString().split('T')[0];
    const newStatus = status === "ON" ? "OFF" : "ON";

    axios.post('http://localhost:5000/api/meal', {
      username,
      status: newStatus,
      date: today,
    })
    .then(() => setStatus(newStatus))
    .catch(err => console.error('Error updating status:', err));
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = () => {
    axios.post('http://localhost:5000/api/update-user-info', {
      oldUsername: username,
      ...userInfo
    })
    .then(res => {
      alert("Update successful!");
      localStorage.setItem("username", userInfo.username);
    })
    .catch(err => {
      console.error(err);
      alert("Update failed!");
    });
  };

  return (
    <div className="border-dashboard">
      <div className="dashboard-container">
        <h2 className="welcome">👋 Welcome, {username}</h2>
  
        {/* Status and Toggle */}
        <div className="status-card">
          <p>
            Today's Meal Status:{" "}
            <span className={`status ${status === 'ON' ? 'on' : 'off'}`}>{status}</span>
          </p>
          <button className="toggle-button" onClick={handleToggle}>
            Toggle Meal
          </button>
        </div>
  
        {/* ✨ Edit User Info (moved here) */}
        <div className="edit-card">
          <h3>📝Your Info</h3>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={userInfo.username}
            onChange={handleInfoChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={userInfo.phone}
            onChange={handleInfoChange}
          />
          <input
            type="text"
            name="room"
            placeholder="Room"
            value={userInfo.room}
            onChange={handleInfoChange}
          />
          <button className="update-button" onClick={handleUpdateInfo}>
            Update Info
          </button>
        </div>
  
        {/* Monthly Meal Info */}
        <div className="monthly-card">
          <h3>📅 This Month</h3>
          <p>Total Meals Taken: <strong>{monthlyMeals}</strong></p>
        </div>
  
        {/* Meal History */}
        <div className="history-card">
          <h3>📖 Meal History</h3>
          <ul className="history-list">
            {history.length > 0 ? history.map((entry, index) => (
              <li key={index} className="history-item">
                <span>{entry.date}</span>
                <span className={`status ${entry.status === 'ON' ? 'on' : 'off'}`}>
                  {entry.status}
                </span>
              </li>
            )) : <p>No history found.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
  
}

export default BorderDashboard;
