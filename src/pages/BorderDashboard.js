import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BorderDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);


  useEffect(() => {
    if (!username) {
      navigate('/login');
    } else {
      const today = new Date().toISOString().split('T')[0];
  
      axios.get(`http://localhost:5000/api/meal-status?username=${username}&date=${today}`)
        .then(res => {
          if (res.data && res.data.status) {
            setStatus(res.data.status); // This should trigger re-render
          } else {
            setStatus("OFF"); // Default to OFF if no status found
          }
        })
        .catch(err => {
          console.error("Error fetching today’s status:", err);
          setStatus("OFF");
        });
  
      axios.get(`http://localhost:5000/api/meal-history?username=${username}`)
        .then(res => setHistory(res.data))
        .catch(err => console.error("Error fetching history:", err));
    }
  }, [username, navigate]);
  
  

  const fetchTodayStatus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(`http://localhost:5000/api/meal-status?username=${username}&date=${today}`);
      if (res.data && res.data.status) {
        setStatus(res.data.status);
      }
    } catch (err) {
      console.error("Error fetching meal status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentStatus = status?.toLowerCase() === 'on' ? 'OFF' : 'ON';
  
    axios.post('http://localhost:5000/api/meal', {
      username,
      status: currentStatus,
      date: today,
    })
    .then((res) => {
      console.log('Status updated:', res.data);
      setStatus(currentStatus);
    })
    .catch((err) => {
      console.error('Error updating status:', err);
    });
  };
  

  return (
    <div className="container">
      <h2>Welcome, {username}</h2>
  
      {status === null ? (
        <p>Loading your meal status...</p>
      ) : (
        <>
          <p>Today's status: <strong>{status}</strong></p>
          <button onClick={() => handleToggle()}>Toggle Meal</button>
  
          <h3>Meal History</h3>
          <ul>
          {history.map((entry, index) => (
           <li key={index} style={{ color: entry.status === 'ON' ? 'green' : 'red' }}>
              <strong>{entry.date}</strong>: {entry.status}
            </li>
            ))}
           </ul>
       </>
      )}
    </div>
  );
  
}

export default BorderDashboard;
