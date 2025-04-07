import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditInfo.css'; // Optional styling

function EditInfo() {
  const navigate = useNavigate();
  const oldUsername = localStorage.getItem("username");

  const [newUsername, setNewUsername] = useState(oldUsername || '');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = () => {
    if (!newUsername || !newPassword) {
      alert("Please fill in both fields.");
      return;
    }

    axios.post('http://localhost:5000/api/update-user-info', {
      oldUsername,
      newUsername,
      newPassword,
    })
      .then(() => {
        alert("Info updated successfully!");
        localStorage.setItem("username", newUsername);
        navigate('/border'); // Navigate to BorderDashboard
      })
      .catch((err) => {
        console.error(err);
        alert("Update failed!");
      });
  };

  return (
    <div className="edit-info-container">
      <h2>🔒 Edit Username & Password</h2>

      <div className="form-group">
        <label>New Username</label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Enter new username"
        />
      </div>

      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
      </div>

      <div className="button-group">
        <button onClick={handleUpdate} className="update-button">Update</button>
        <button onClick={() => navigate('/border')} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditInfo;
