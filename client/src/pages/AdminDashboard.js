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
  const [monthlyGuestMealsData, setMonthlyGuestMealsData] = useState([]);
  const [showGuestTable, setShowGuestTable] = useState(true);
  const [guestMealSummary, setGuestMealSummary] = useState([]);
  const [showGuestSummary, setShowGuestSummary] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  

  useEffect(() => {
    fetchBorderStatus();
    fetchGuestMeals();
    fetchMonthlyGuestMealSummary();
  }, []);

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
      const guestData = response.data;
      setGuestMeals(guestData);

      const count = guestData.filter(g => g.status === 'ON').length;
      setGuestMealCount(count);
    } catch (error) {
      console.error('Error fetching guest meals:', error);
    }
  };

  const fetchMonthlyGuestMealsData = async (month) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/monthly-guest-meals`, {
        params: { month }
      });
      setMonthlyGuestMealsData(res.data);
      setShowGuestTable(true);
    } catch (err) {
      console.error('Error fetching monthly guest meal data:', err);
    }
  };
  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setSelectedMonth(selected);
    fetchMonthlyGuestMealsData(selected);
  };
  
  
  

  const fetchMonthlyGuestMealSummary = async () => {
    if (showGuestSummary) {
      setShowGuestSummary(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/admin/monthly-guest-meals-summary');
      setGuestMealSummary(res.data);
      setShowGuestSummary(true);
    } catch (err) {
      console.error('Error fetching guest meal summary:', err);
    }
  };

  const toggleMealTaken = (id) => {
    setMealTakenMap(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const downloadExcel = () => {
    const borderSheetData = borders.map(b => ({
      ID: b.id,
      Name: b.name || 'N/A',
      Room: b.room || 'N/A',
      'Meal Status': b.status || 'OFF',
      Date: b.date || 'N/A',
      Time: b.time ? b.time.slice(0, 5) : 'N/A',
    }));

    const guestSheetData = guestMeals.length > 0
      ? guestMeals.map(g => ({
          'Border Name': g.border_name || 'N/A',
          Room: g.room || 'N/A',
          'Guest Name': g.guest_name || 'N/A',
          Status: g.status || 'OFF',
          Date: g.date || 'N/A',
          Time: g.time ? g.time.slice(0, 5) : 'N/A',
        }))
      : [{ Message: 'No guest meals for today.' }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(borderSheetData), 'Border Meal Status');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(guestSheetData), 'Guest Meal Status');
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

      <div className="total-meals-card" style={{ backgroundColor: '#fff7e6' }}>
        <h3>🧑‍🍳 Today's Guest Meals (ON)</h3>
        <p><strong>{guestMealCount}</strong> guest meals</p>
        <p className="snapshot-label">(Currently ON)</p>
      </div>

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
                <th>Meal Taken</th>
              </tr>
            </thead>
            <tbody>
              {borders
                .filter(border =>
                  border.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(border => (
                  <tr key={border.id}>
                    <td>{border.id}</td>
                    <td>{border.name || 'N/A'}</td>
                    <td>{border.room || 'N/A'}</td>
                    <td className={border.status === 'ON' ? 'on' : 'off'}>
                      {border.status || 'OFF'}
                    </td>
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

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={downloadExcel}>📥 Download as Excel</button>
      </div>

      <h3>🧑‍🤝‍🧑 Guest Meal Status</h3>
      {guestMeals.length === 0 ? (
        <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#777' }}>
          No guest meals for today
        </p>
      ) : (
        <div className="table-container">
          <table className="borders-table">
            <thead>
              <tr>
                <th>Boarder Name</th>
                <th>Room</th>
                <th>Guest Name</th>
                <th>Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/*monthly guest meal count summary*/}
      {showGuestSummary && (
        <div className="table-container">
          <h3>📆 This Month Guest Meals</h3>
          <table className="borders-table">
            <thead>
              <tr>
                <th>Border Name</th>
                <th>Room</th>
                <th>Total Guest Meals</th>
              </tr>
            </thead>
            <tbody>
              {guestMealSummary.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.room}</td>
                  <td>{item.total_guest_meals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {/* Month Selector for Guest Meals */}
<div style={{ marginBottom: '1rem' }}>
  <label htmlFor="monthPicker">📅 Select Month:&nbsp;</label>
  <input
    id="monthPicker"
    type="month"
    value={selectedMonth}
    onChange={handleMonthChange}
    style={{ padding: '6px', borderRadius: '4px' }}
  />
</div>


      {showGuestTable && (
        <div className="table-container">
          <h3>🧑‍🤝‍🧑 Monthly Guest Meal Records</h3>
          <h5>(Status = ON)</h5>
          <table className="borders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Boarder Name</th>
                <th>Guest Name</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {monthlyGuestMealsData.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.border_name}</td>
                  <td>{record.guest_name}</td>
                  <td>{new Date(record.date).toLocaleDateString('en-GB')}</td>
                  <td>{record.time || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
