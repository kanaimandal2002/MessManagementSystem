import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // optional styling

const AdminDashboard = () => {
  const [borders, setBorders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorderStatus();
  }, []);

  const fetchBorderStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/border-meal-status');
      setBorders(response.data);
    } catch (error) {
      console.error('Error fetching border status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>All Borders' Meal Status</h2>

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
                  <td>{border.name}</td>
                  <td>{border.room}</td>
                  <td className={border.status === 'ON' ? 'on' : 'off'}>
                    {border.status}
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
