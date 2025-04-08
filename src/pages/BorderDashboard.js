import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BorderDashboard.css';

function BorderDashboard() {
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("username");
  const [currentUsername, setCurrentUsername] = useState(storedUsername);

  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [monthlyMeals, setMonthlyMeals] = useState(0);

  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    phone: '',
    room: '',
    username: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!currentUsername) {
      navigate('/login');
      return;
    }

    // Fetch today's meal status
    axios.get(`http://localhost:5000/api/meal-status?username=${currentUsername}&date=${today}`)
      .then(res => {
        if (res.data && res.data.status !== null) {
          setStatus(res.data.status);
        } else {
          setStatus("OFF");
        }
      })
      .catch(err => {
        console.error("Error fetching status:", err);
        setStatus("OFF");
      });

    // Fetch meal history
    axios.get(`http://localhost:5000/api/meal-history?username=${currentUsername}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error("Error fetching history:", err));

    // Fetch monthly meals
    axios.get(`http://localhost:5000/api/monthly-meals?username=${currentUsername}`)
      .then(res => setMonthlyMeals(res.data.mealCount))
      .catch(err => console.error("Error fetching monthly meals:", err));

    // Fetch user info
    axios.get(`http://localhost:5000/api/user-info?username=${currentUsername}`)
      .then(res => {
        if (res.data) {
          setUserInfo({
            name: res.data.name,
            address: res.data.address,
            phone: res.data.phone,
            room: res.data.room,
            username: res.data.username,
          });
        }
      })
      .catch(err => {
        console.error("Error fetching user info:", err);
      });
  }, [currentUsername, navigate, today]);

  const handleToggle = () => {
    const newStatus = status === "ON" ? "OFF" : "ON";

    axios.post('http://localhost:5000/api/meal', {
      username: currentUsername,
      status: newStatus,
      date: today,
    })
      .then(() => {
        // Re-fetch meal status after updating
        axios.get(`http://localhost:5000/api/meal-status?username=${currentUsername}&date=${today}`)
          .then(res => setStatus(res.data.status || "OFF"))
          .catch(err => console.error("Error re-fetching status:", err));
      })
      .catch(err => console.error('Error updating status:', err));
  };

  return (
    <div className="border-dashboard">
      <div className="dashboard-container">
        <h2 className="welcome">👋 Welcome, {userInfo.name || currentUsername}</h2>

        {/* Meal Status */}
        <div className="status-card">
          <p>
            Today's Meal Status:{" "}
            {status === null ? (
              <span className="status loading">Loading...</span>
            ) : (
              <span className={`status ${status === 'ON' ? 'on' : 'off'}`}>{status}</span>
            )}
          </p>
          <button className="toggle-button" onClick={handleToggle}>
            Toggle Meal
          </button>
        </div>

        {/* Your Info Section */}
        <div className="edit-card">
          <h3>📝 Your Info</h3>
          <div className="info-grid">
            <div>
              <label>Name:</label>
              <input type="text" value={userInfo.name} readOnly />
            </div>
            <div>
              <label>Address:</label>
              <input type="text" value={userInfo.address} readOnly />
            </div>
            <div>
              <label>Phone:</label>
              <input type="text" value={userInfo.phone} readOnly />
            </div>
            <div>
              <label>Room:</label>
              <input type="text" value={userInfo.room} readOnly />
            </div>
            <div>
              <label>Username:</label>
              <input type="text" value={userInfo.username} readOnly />
            </div>
          </div>
          <button
            className="update-button"
            onClick={() => navigate('/edit-info')}
          >
            Edit Info
          </button>
        </div>

        {/* Monthly Meals */}
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
