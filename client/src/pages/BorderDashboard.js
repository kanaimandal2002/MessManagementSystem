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

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestStatus, setGuestStatus] = useState('ON');
  const [selectedGuest, setSelectedGuest] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ON');

  const [updateMessage, setUpdateMessage] = useState('');
  const [showUpdateError, setShowUpdateError] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    phone: '',
    room: '',
    username: '',
  });

  const [guestHistory, setGuestHistory] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!currentUsername) {
      navigate('/login');
      return;
    }

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

    axios.get(`http://localhost:5000/api/meal-history?username=${currentUsername}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error("Error fetching history:", err));

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

    axios.get(`http://localhost:5000/api/guest-meal-history?username=${currentUsername}`)
      .then(res => setGuestHistory(res.data))
      .catch(err => console.error("Error fetching guest history:", err));
  }, [currentUsername, navigate, today]);

  const handleToggle = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    const newStatus = status === "ON" ? "OFF" : "ON";

    if (currentHour >= 18) {
      setUpdateMessage("❌ Unable to update, please try again after 12:00 AM");
      setShowUpdateError(true);
      setTimeout(() => setShowUpdateError(false), 4000);
      return;
    }

    axios.post('http://localhost:5000/api/meal', {
      username: currentUsername,
      status: newStatus,
      date: today,
      time: currentTime
    })
      .then(() => {
        axios.get(`http://localhost:5000/api/meal-status?username=${currentUsername}&date=${today}`)
          .then(res => setStatus(res.data.status || "OFF"))
          .catch(err => console.error("Error re-fetching status:", err));
      })
      .catch(err => console.error('Error updating status:', err));
  };

  const handleGuestMealSubmit = () => {
    if (!guestName.trim()) {
      alert("Please enter guest name");
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    axios.post('http://localhost:5000/api/guest-meal', {
      username: currentUsername,
      guest_name: guestName,
      status: guestStatus,
      date,
      time
    })
      .then(() => {
        alert("Guest meal added!");
        setShowGuestForm(false);
        setGuestName('');
        setGuestStatus('ON');
      })
      .catch(err => {
        console.error("Error adding guest meal:", err);
        alert("Failed to add guest meal");
      });
  };

  const handleGuestStatusUpdate = async (e) => {
    e.preventDefault();
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    try {
      await axios.post('http://localhost:5000/api/guest-meal', {
        username: currentUsername,
        guest_name: selectedGuest,
        status: selectedStatus,
        date,
        time
      });
      alert(`Meal status for ${selectedGuest} set to ${selectedStatus}`);
      const response = await axios.get(`http://localhost:5000/api/guest-meal-history?username=${currentUsername}`);
      setGuestHistory(response.data);
    } catch (err) {
      console.error("Error updating guest status:", err);
      alert("Failed to update guest meal status.");
    }
  };

  return (
    <div className="border-dashboard">
      <div className="dashboard-container">
        <h2 className="welcome">👋 Welcome, {userInfo.name || currentUsername}</h2>

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
          {showUpdateError && (
            <p className="update-message">{updateMessage}</p>
          )}
        </div>

        <div className="guest-add-section">
          <button className="add-guest-btn" onClick={() => setShowGuestForm(true)}>➕ Add Guest Meal</button>
        </div>

        {showGuestForm && (
          <div className="guest-form-popup">
            <div className="guest-form-content">
              <h4>🍽️ Add Guest Meal</h4>
              <label>Guest Name:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
              />
              <label>Meal Status:</label>
              <select
                value={guestStatus}
                onChange={(e) => setGuestStatus(e.target.value)}
              >
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
              <div className="guest-form-buttons">
                <button onClick={handleGuestMealSubmit}>Submit</button>
                <button onClick={() => setShowGuestForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Set Guest Meal Status */}
        <div className="guest-status-card">
          <h3>🍽️ Set Guest Meal Status</h3>
          <form onSubmit={handleGuestStatusUpdate}>
            <div className="form-group">
              <label>Guest Name:</label>
              <select
                value={selectedGuest}
                onChange={(e) => setSelectedGuest(e.target.value)}
                required
              >
                <option value="">-- Select Guest --</option>
                {guestHistory.map((guest, idx) => (
                  <option key={idx} value={guest.guest_name}>
                    {guest.guest_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                required
              >
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
            </div>

            <button type="submit">Set Status</button>
          </form>
        </div>

        {/* Your Info Section */}
        <div className="edit-card">
          <h3>📝 Your Info</h3>
          <div className="info-grid">
            <div><label>Name:</label><input type="text" value={userInfo.name} readOnly /></div>
            <div><label>Address:</label><input type="text" value={userInfo.address} readOnly /></div>
            <div><label>Phone:</label><input type="text" value={userInfo.phone} readOnly /></div>
            <div><label>Room:</label><input type="text" value={userInfo.room} readOnly /></div>
            <div><label>Username:</label><input type="text" value={userInfo.username} readOnly /></div>
          </div>
          <button className="update-button" onClick={() => navigate('/edit-info')}>
            Edit Info
          </button>
        </div>

        {/* Guest Meal History */}
        <div className="guest-history-card">
          <h3>🧑‍🤝‍🧑 Guest Meal History</h3>
          <ul className="history-list">
            {guestHistory.length > 0 ? guestHistory.map((entry, index) => (
              <li key={index} className="history-item">
                <div>
                  <strong>{entry.guest_name || 'Unnamed Guest'}</strong><br />
                  <small>{entry.date} <span style={{ color: '#777' }}>{entry.time}</span></small>
                </div>
                <span className={`status ${entry.status === 'ON' ? 'on' : 'off'}`}>
                  {entry.status}
                </span>
              </li>
            )) : <p>No guest history found.</p>}
          </ul>
        </div>

        {/* Meal History */}
        <div className="history-card">
          <h3>📖 Meal History</h3>
          <ul className="history-list">
            {history.length > 0 ? history.map((entry, index) => (
              <li key={index} className="history-item">
                <span>{entry.date} <small style={{ color: '#777' }}>{entry.time}</small></span>
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
