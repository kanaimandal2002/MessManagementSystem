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

  const [showSetGuestStatusForm, setShowSetGuestStatusForm] = useState(false);


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
    let dateForStatus = new Date(now); // start with today
  
    // If between 12AM and 6AM, set date to tomorrow
    if (currentHour >= 0 && currentHour < 6) {
      dateForStatus.setDate(dateForStatus.getDate() + 1);
    }
  
    const formattedDate = dateForStatus.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    const newStatus = status === "ON" ? "OFF" : "ON";
  
    // Prevent update after 6 PM
    if (currentHour >= 18) {
      setUpdateMessage("❌ Unable to update, please try again after 12:00 AM");
      setShowUpdateError(true);
      setTimeout(() => setShowUpdateError(false), 4000);
      return;
    }
  
    axios.post('http://localhost:5000/api/meal', {
      username: currentUsername,
      status: newStatus,
      date: formattedDate,
      time: currentTime
    })
      .then(() => {
        axios.get(`http://localhost:5000/api/meal-status?username=${currentUsername}&date=${formattedDate}`)
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
  const hour = now.getHours();

  if (hour >= 18) {
    alert("❌ Unable to update guest meal status after 6:00 PM. Try again after 12:00 AM.");
    return;
  }

  // Adjust date if between 12AM and 6AM
  let mealDate = new Date(now);
  if (hour >= 0 && hour < 6) {
    mealDate.setDate(mealDate.getDate() + 1);
  }

  const date = mealDate.toISOString().split('T')[0];
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

  if (!selectedGuest) {
    alert("Please select a guest to update.");
    return;
  }

  const now = new Date();

  // Format to local date and time
  const localDate = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const localTime = now.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS

  const hour = now.getHours();

  if (hour >= 18) {
    alert("❌ Unable to update guest meal status after 6:00 PM. Try again after 12:00 AM.");
    return;
  }

  try {
    await axios.post('http://localhost:5000/api/guest-meal', {
      username: currentUsername,
      guest_name: selectedGuest,
      status: selectedStatus,
      date: localDate,   // ✅ formatted YYYY-MM-DD
      time: localTime    // ✅ formatted HH:MM:SS
    });
    alert(`Meal status for ${selectedGuest} set to ${selectedStatus}`);
    setShowSetGuestStatusForm(false);
    setSelectedGuest('');
    setSelectedStatus('ON');
    setUpdateMessage("Guest meal status updated successfully!");

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
    
          {/* Today's Meal Status */}
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
    
          {/* Add Guest and set Meal Section on same line*/}
               <div className="guest-button-row">
                <button className="add-guest-btn" onClick={() => setShowGuestForm(true)}>➕ Add Guest Meal</button>
                <button className="set-guest-btn" onClick={() => setShowSetGuestStatusForm(true)}>🍽️ Set Guest Meal</button>
               </div>

    
          {/* Add Guest Meal Popup */}
          {showGuestForm && (
            <div className="guest-modal-overlay" onClick={() => setShowGuestForm(false)}>
              <div className="guest-modal-container" onClick={(e) => e.stopPropagation()}>
                <h4>🍽️ Add Guest Meal</h4>
                <label>Guest Name:</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className="guest-name-input"
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
                  <button className="cancel-btn" onClick={() => setShowGuestForm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
    
    
          {/* Set Guest Meal Status Popup */}
          {showSetGuestStatusForm && (
            <div className="guest-modal-overlay" onClick={() => setShowSetGuestStatusForm(false)}>
              <div className="guest-modal-container" onClick={(e) => e.stopPropagation()}>
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
                      {[...new Set(guestHistory.map(guest => guest.guest_name))].map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
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
    
                  <div className="guest-form-buttons">
                    <button type="submit">Set Status</button>
                    <button className="cancel-btn" onClick={() => setShowSetGuestStatusForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Today's Guest Meal Status */}
<div className="status-card">
  <h3>👥 Today's Guest Meals</h3>
  {guestHistory.filter(g => g.date === today).length === 0 ? (
    <p>No guest meals added for today.</p>
  ) : (
    <ul className="guest-list">
      {guestHistory
        .filter(g => g.date === today)
        .map((guest, idx) => (
          <li key={idx}>
            <strong>{guest.guest_name}</strong>:{" "}
            <span className={guest.status === 'ON' ? 'on' : 'off'}>
              {guest.status}
            </span>
          </li>
        ))}
    </ul>
  )}
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


          {/* Border Meal History */}
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
    
          
        </div>
      </div>
    );
    
}

export default BorderDashboard;
