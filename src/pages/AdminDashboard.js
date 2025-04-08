import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [borders, setBorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);

  useEffect(() => {
    fetchBorderStatus();
  }, []);

  const fetchBorderStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/border-meal-status');
      const bordersData = response.data;

      setBorders(bordersData);

      // Calculate total meals: Count how many have status === 'ON'
      const mealsCount = bordersData.filter(b => b.status === 'ON').length;
      setTotalMeals(mealsCount);

    } catch (error) {
      console.error('Error fetching border status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>👨‍💼 Admin Dashboard</h2>

      {/* Total Meals */}
      <div className="total-meals-card">
        <h3>🍽️ Total Meals Today</h3>
        <p><strong>{totalMeals}</strong> meals taken</p>
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
              </tr>
            </thead>
            <tbody>
              {borders.map((border) => (
                <tr key={border.id}>
                  <td>{border.id}</td>
                  <td>{border.name || 'N/A'}</td>
                  <td>{border.room || 'N/A'}</td>
                  <td className={border.status === 'ON' ? 'on' : 'off'}>
                    {border.status ? border.status.toUpperCase() : 'OFF'}
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
