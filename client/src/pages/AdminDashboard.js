import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [borders, setBorders] = useState([]);
  const [guestMeals, setGuestMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guestLoading, setGuestLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);
  const [mealTakenMap, setMealTakenMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [guestMealCount, setGuestMealCount] = useState(0);
  const [monthlyGuestMealsData, setMonthlyGuestMealsData] = useState([]);
  const [showGuestTable, setShowGuestTable] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  const [monthlyGuestMealSummary, setMonthlyGuestMealSummary] = useState([]);
  const [showMonthlyGuestSummary, setShowMonthlyGuestSummary] = useState(false);

  useEffect(() => {
    fetchBorderStatus();
    fetchGuestMeals();
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
    } finally {
      setGuestLoading(false);
    }
  };

  const fetchMonthlyGuestMealsData = async (month) => {
    if (!month) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/monthly-guest-meals`, {
        params: { month }
      });
      setMonthlyGuestMealsData(res.data);
      setShowGuestTable(true);
      fetchMonthlyGuestMealSummary(month); // fetch summary also
    } catch (err) {
      console.error('Error fetching monthly guest meal data:', err);
      setMonthlyGuestMealsData([]);
      setShowGuestTable(false);
    }
  };

  const fetchMonthlyGuestMealSummary = async (month) => {
    if (!month) return;
  
    // Split '2025-04' into year and month
    const [year, monthNumber] = month.split('-'); // '2025-04' → ['2025', '04']
  
    try {
      const res = await axios.get('http://localhost:5000/api/admin/monthly-guest-meals-summary', {
        params: { month: parseInt(monthNumber, 10), year: parseInt(year, 10) }
      });
      setMonthlyGuestMealSummary(res.data);
      setShowMonthlyGuestSummary(true);
    } catch (err) {
      console.error('Error fetching monthly guest meal summary:', err);
      setMonthlyGuestMealSummary([]);
      setShowMonthlyGuestSummary(false);
    }
  };
  

  // Removed unused fetchMonthlyGuestMealSummaryDefault function

  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setSelectedMonth(selected);
    fetchMonthlyGuestMealsData(selected);
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
        <p><strong>{totalMeals}</strong> meals</p>
        <p className="snapshot-label">(Live Meal Status)</p>
      </div>

      <div className="total-meals-card" style={{ backgroundColor: '#fff7e6' }}>
        <h4>🧑‍🍳 Today's Guest Meals (ON)</h4>
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
        <p>Loading Boarders...</p>
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
        <button onClick={downloadExcel} disabled={loading || guestLoading}>
          📥 Download as Excel
        </button>
      </div>

      <h3>🧑‍🤝‍🧑 Guest Meal Status</h3>
      {guestLoading ? (
        <p>Loading Guests...</p>
      ) : guestMeals.length === 0 ? (
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
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {guestMeals.map((guest, index) => (
                <tr key={index}>
                  <td>{guest.border_name}</td>
                  <td>{guest.room}</td>
                  <td>{guest.guest_name}</td>
                  <td>{new Date(guest.date).toLocaleDateString('en-GB')}</td>
                  <td>{guest.time || 'N/A'}</td>
                  <td className={guest.status === 'ON' ? 'on' : 'off'}>
                    {guest.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    

      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="monthPicker">📅 Select Month for Records:&nbsp;</label>
        <input
          id="monthPicker"
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          style={{ padding: '6px', borderRadius: '4px' }}
        />
      </div>

      {showGuestTable && (
        <div>
          <h3>🧑‍🤝‍🧑 Monthly Guest Meal Records (Status = ON)</h3>
          {monthlyGuestMealsData.length === 0 ? (
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#777' }}>
              No guest meals for the selected month
            </p>
          ) : (
            <div className="table-container">
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
      )}

      {showMonthlyGuestSummary && (
        <div>
          <h3>📊 Guest Meal Summary for {selectedMonth}</h3>
          {monthlyGuestMealsData.length === 0 ? (
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#777' }}>
              No guest meals summary for the selected month
            </p>
          ) : (
            <div className="table-container">
              <table className="borders-table">
                <thead>
                  <tr>
                    <th>Border Name</th>
                    <th>Room</th>
                    <th>Total Guest Meals</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyGuestMealSummary.map((item, index) => (
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
