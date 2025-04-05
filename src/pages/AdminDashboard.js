import React from 'react';

function AdminDashboard() {
  const borders = [
    { id: 1, name: 'John Doe', room: 'A-101', mealStatus: 'ON' },
    { id: 2, name: 'Jane Smith', room: 'B-205', mealStatus: 'OFF' },
    { id: 3, name: 'Rahul Kumar', room: 'C-303', mealStatus: 'ON' },
  ];

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 rounded-4">
        <h3 className="mb-4 text-center">Admin Dashboard</h3>

        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Border ID</th>
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
                <td>{border.mealStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-end mt-4">
          <button className="btn btn-primary me-2">Add Border</button>
          <button className="btn btn-secondary">View Reports</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
