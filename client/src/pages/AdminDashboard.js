import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [borders, setBorders] = useState([]);
  const [guestMeals, setGuestMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);
  const [mealTakenMap, setMealTakenMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [guestMealCount, setGuestMealCount] = useState(0);
  const [monthlyGuestMeals, setMonthlyGuestMeals] = useState(0);
  const [monthlyGuestMealsData, setMonthlyGuestMealsData] = useState([]);
const [showGuestTable, setShowGuestTable] = useState(false);


  useEffect(() => {
    fetchBorderStatus();
    fetchGuestMeals();
    fetchGuestMealCount();
    fetchMonthlyGuestMeals();
  }, []);

  const fetchMonthlyGuestMealsData = async () => {
    if (showGuestTable) {
      setShowGuestTable(false); // Hide the table if already showing
      return;
    }
  
    try {
      const res = await axios.get('http://localhost:5000/api/admin/monthly-guest-meals');
      setMonthlyGuestMealsData(res.data);
      setShowGuestTable(true); // Show the table
    } catch (err) {
      console.error('Error fetching monthly guest meal data:', err);
    }
  };
  

  const fetchBorderStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/border-meal-status');
      const bordersData = response.data;

      setBorders(bordersData);

      const mealsCount = bordersData.filter(b => b.status === 'ON').length;
      setTotalMeals(mealsCount);

      setMealTakenMap(
        bordersData.reduce((acc, border) => {
          acc[border.id] = false;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error('Error fetching border status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestMeals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/guest-meal-status');
      setGuestMeals(response.data);
    } catch (error) {
      console.error('Error fetching guest meals:', error);
    }
  };

  const fetchGuestMealCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/guest-meals-count');
      setGuestMealCount(response.data.count);
    } catch (error) {
      console.error('Error fetching guest meal count:', error);
    }
  };

  const fetchMonthlyGuestMeals = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/guest-meals-monthly-count');
      setMonthlyGuestMeals(res.data.total);
    } catch (err) {
      console.error('Error fetching monthly guest meals:', err);
    }
  };

  const toggleMealTaken = (id) => {
    setMealTakenMap(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const downloadExcel = () => {
    const worksheetData = borders.map(b => ({
      ID: b.id,
      Name: b.name || 'N/A',
      Room: b.room || 'N/A',
      'Meal Status': b.status || 'OFF',
      Date: b.date || 'N/A',
      Time: b.time ? b.time.slice(0, 5) : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meal Status');

    XLSX.writeFile(workbook, 'Admin_Meal_Status_Report.xlsx');
  };

  return (
    <div className="admin-dashboard">
      <h2>👨‍💼 Admin Dashboard</h2>

      <div className="total-meals-card">
        <h3>🍽️ Total Meals Today</h3>
        <p><strong>{totalMeals}</strong> meals taken</p>
        <p className="snapshot-label">(Live Meal Status)</p>
      </div>

      {/* Total Guest Meals */}
<div className="total-meals-card" style={{ backgroundColor: '#fff7e6' }}>
  <h3>🧑‍🍳 Today's Guest Meals (ON)</h3>
  <p><strong>{guestMealCount}</strong> guest meals</p>
  <p className="snapshot-label">(Currently ON)</p>
</div>

      {/* Total Guest Meals This Month */}
<div className="total-guest-meals-card">
  <h3>🧑‍🤝‍🧑 Total Guest Meals (This Month)</h3>
  <p><strong>{monthlyGuestMeals}</strong> guest meals</p>
</div>


    {/*hide/show monthly guest meals table*/}
    <div style={{ marginBottom: '1rem' }}>
  <button onClick={fetchMonthlyGuestMealsData}>
    {showGuestTable ? '❌ Hide Monthly Guest Meal Records' : '📋 Show Monthly Guest Meal Records'}
  </button>
</div>


{showGuestTable && (
  <div className="table-container">
    <h3>🧑‍🤝‍🧑 Monthly Guest Meal Records</h3>
    <table className="borders-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Boarder Name</th>
          <th>Guest Name</th>
          <th>Status</th>
          <th>Date</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {monthlyGuestMealsData.map((record) => (
          <tr key={record.id}>
            <td>{record.id}</td>
            <td>{record.border_name}</td>
            <td>{record.guest_name}</td>
            <td>{record.status}</td>
            <td>{new Date(record.date).toLocaleDateString('en-GB')}</td>
            <td>{record.time ? new Date(`1970-01-01T${record.time}Z`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }) : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

  


      {/*search bar*/}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px',
            width: '250px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
      </div>

      <h3>🏠 All Boarders' Meal Status</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table className="borders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Room</th>
                <th>Meal Status</th>
                <th>Date</th>
                <th>Time</th>
                <th>Meal Taken</th>
              </tr>
            </thead>
            <tbody>
              {borders
                .filter((border) =>
                  border.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((border) => (
                  <tr key={border.id}>
                    <td>{border.id}</td>
                    <td>{border.name || 'N/A'}</td>
                    <td>{border.room || 'N/A'}</td>
                    <td className={border.status === 'ON' ? 'on' : 'off'}>
                      {border.status ? border.status.toUpperCase() : 'OFF'}
                    </td>
                    <td>
                      {border.date
                        ? new Date(border.date).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </td>
                    <td>{border.time || 'N/A'}</td>
                    <td>
                      <button
                        className={`mark-meal-btn ${mealTakenMap[border.id] ? 'taken' : 'not-taken'}`}
                        onClick={() => toggleMealTaken(border.id)}
                      >
                        {mealTakenMap[border.id] ? '✅' : '❌'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Download Excel Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={downloadExcel}>📥 Download as Excel</button>
      </div>

      {/* Guest Meals Section */}
      <h3>👥 Guest Meal Status</h3>
      <div className="table-container">
        <table className="borders-table">
          <thead>
            <tr>
              <th>Boarder Name</th>
              <th>Room</th>
              <th>Guest Name</th>
              <th>Status</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {guestMeals.map((guest, index) => (
              <tr key={index}>
                <td>{guest.border_name}</td>
                <td>{guest.room}</td>
                <td>{guest.guest_name}</td>
                <td className={guest.status === 'ON' ? 'on' : 'off'}>
                  {guest.status}
                </td>
                <td>{guest.date}</td>
                <td>{guest.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;