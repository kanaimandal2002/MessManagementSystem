// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import {
//   PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
// } from 'recharts';


// function BorderDashboard() {
//   const navigate = useNavigate();
//   const username = localStorage.getItem("username");
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [history, setHistory] = useState([]);
//   const COLORS = ['#00C49F', '#FF8042']; // ON = green, OFF = orange
//   const [userInfo, setUserInfo] = useState({});
//   const [editMode, setEditMode] = useState(false);
//   const [newPhone, setNewPhone] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [monthlyMeals, setMonthlyMeals] = useState(0);



//   useEffect(() => {
//     if (!username) {
//       navigate('/login');
//     } else {
//       const today = new Date().toISOString().split('T')[0];
//       // Fetch user info
//       axios.get(`http://localhost:5000/api/user-info?username=${username}`)
//       .then(res => {
//         setUserInfo(res.data);
//         setNewPhone(res.data.phone); // for editing
//       })
//       .catch(err => console.error("Error fetching user info:", err));
    
//       //veiw monthly meal
//       if (username) {
//         axios.get(`http://localhost:5000/api/monthly-meals?username=${username}`)
//           .then(res => setMonthlyMeals(res.data.mealCount))
//           .catch(err => console.error('Error fetching monthly meal count:', err));
//       }


//       axios.get(`http://localhost:5000/api/meal-status?username=${username}&date=${today}`)
//         .then(res => {
//           if (res.data && res.data.status) {
//             setStatus(res.data.status); // This should trigger re-render
//           } else {
//             setStatus("OFF"); // Default to OFF if no status found
//           }
//         })
//         .catch(err => {
//           console.error("Error fetching today’s status:", err);
//           setStatus("OFF");
//         });
  
//       axios.get(`http://localhost:5000/api/meal-history?username=${username}`)
//         .then(res => setHistory(res.data))
//         .catch(err => console.error("Error fetching history:", err));
//     }
//   }, [username, navigate]);
  
//   const getMealSummary = () => {
//     const summary = { ON: 0, OFF: 0 };
  
//     history.forEach(entry => {
//       if (entry.status === 'ON') summary.ON++;
//       else if (entry.status === 'OFF') summary.OFF++;
//     });
  
//     return [
//       { name: 'Meal ON', value: summary.ON },
//       { name: 'Meal OFF', value: summary.OFF }
//     ];
//   };
  

//   const fetchTodayStatus = async () => {
//     try {
//       const today = new Date().toISOString().split('T')[0];
//       const res = await axios.get(`http://localhost:5000/api/meal-status?username=${username}&date=${today}`);
//       if (res.data && res.data.status) {
//         setStatus(res.data.status);
//       }
//     } catch (err) {
//       console.error("Error fetching meal status:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggle = () => {
//     const today = new Date().toISOString().split('T')[0];
//     const currentStatus = status?.toLowerCase() === 'on' ? 'OFF' : 'ON';
  
//     axios.post('http://localhost:5000/api/meal', {
//       username,
//       status: currentStatus,
//       date: today,
//     })
//     .then((res) => {
//       console.log('Status updated:', res.data);
//       setStatus(currentStatus);
//     })
//     .catch((err) => {
//       console.error('Error updating status:', err);
//     });
//   };
  

//   return (
//     <div className="container">
//       <h2>Welcome, {username}</h2>
  
//       {status === null ? (
//         <p>Loading your meal status...</p>
//       ) : (
//         <>
//           <p>Today's status: <strong>{status}</strong></p>
//           <button onClick={() => handleToggle()}>Toggle Meal</button>
          
//           <h3>Your Info</h3>
// {!editMode ? (
//   <div>
//     <p><strong>Name:</strong> {userInfo.name}</p>
//     <p><strong>Username:</strong> {userInfo.username}</p>
//     <p><strong>Room:</strong> {userInfo.room}</p>
//     <p><strong>Phone:</strong> {userInfo.phone}</p>
//     <button onClick={() => setEditMode(true)}>Edit Info</button>
//   </div>
// ) : (
//   <div>
//     <label>
//       New Phone:
//       <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
//     </label>
//     <br />
//     <label>
//       New Password:
//       <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
//     </label>
//     <br />
//     <button onClick={() => {
//       axios.post('http://localhost:5000/api/user-info', {
//         username,
//         phone: newPhone,
//         password: newPassword
//       }).then(() => {
//         alert('Info updated!');
//         setEditMode(false);
//         setUserInfo({ ...userInfo, phone: newPhone });
//       }).catch(err => {
//         console.error("Update failed:", err);
//         alert('Update failed!');
//       });
//     }}>Save</button>

//     <button onClick={() => setEditMode(false)}>Cancel</button>
//   </div>
// )}

//           <h3>Meal History</h3>
//           <ul>
//           {history.map((entry, index) => (
//            <li key={index} style={{ color: entry.status === 'ON' ? 'green' : 'red' }}>
//               <strong>{entry.date}</strong>: {entry.status}
//             </li>
//             ))}
//            </ul>

//            <h3>📅 This Month</h3>
// <p>Total Meals Taken: {monthlyMeals}</p>


//            <h3>Meal Summary (Last 30 Days)</h3>
// <ResponsiveContainer width="100%" height={300}>
//   <PieChart>
//     <Pie
//       data={getMealSummary()}
//       dataKey="value"
//       nameKey="name"
//       cx="50%"
//       cy="50%"
//       outerRadius={100}
//       fill="#8884d8"
//       label
//     >
//       {getMealSummary().map((entry, index) => (
//         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//       ))}
//     </Pie>
//     <Tooltip />
//     <Legend />
//   </PieChart>
// </ResponsiveContainer>

//        </>
//       )}
//     </div>
//   );
  
// }

// export default BorderDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BorderDashboard.css'; // ✅ Import CSS

function BorderDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [monthlyMeals, setMonthlyMeals] = useState(0);

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

  return (
    <div className="border-dashboard">
      <div className="dashboard-container">
        <h2 className="welcome">👋 Welcome, {username}</h2>

        <div className="status-card">
          <p>
            Today's Meal Status:{" "}
            <span className={`status ${status === 'ON' ? 'on' : 'off'}`}>{status}</span>
          </p>
          <button className="toggle-button" onClick={handleToggle}>
            Toggle Meal
          </button>
        </div>

        <div className="monthly-card">
          <h3>📅 This Month</h3>
          <p>Total Meals Taken: <strong>{monthlyMeals}</strong></p>
        </div>

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

