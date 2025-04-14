import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [borders, setBorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);
  const [mealTakenMap, setMealTakenMap] = useState({});
  // Add this line near the top with other useState imports:
  const [searchTerm, setSearchTerm] = useState('');



  useEffect(() => {
    fetchBorderStatus();
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
          acc[border.id] = false; // default all as not taken
          return acc;
        }, {})
      );
      

    } catch (error) {
      console.error('Error fetching border status:', error);
    } finally {
      setLoading(false);
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

      {/* Total Meals */}
      <div className="total-meals-card">
        <h3>🍽️ Total Meals Today</h3>
        <p><strong>{totalMeals}</strong> meals taken</p>
        <p className="snapshot-label">(Live Meal Status)</p>
      </div>

      {/* Download Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={downloadExcel}>📥 Download as Excel</button>
      </div>

      {/* Search Bar */}
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


      {/* Table */}
      <h3>🏠 All Borders' Meal Status</h3>

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
                    ? new Date(border.date).toLocaleDateString('en-GB') // DD/MM/YYYY
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
    </div>
  );
};

export default AdminDashboard;
