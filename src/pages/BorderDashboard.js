import React, { useState } from 'react';

function BorderDashboard() {
  const [mealStatus, setMealStatus] = useState(true); // true = Meal ON

  const toggleMeal = () => {
    setMealStatus(!mealStatus);
    // You will update this on backend in future
    alert(`Meal has been turned ${!mealStatus ? 'ON' : 'OFF'}`);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 rounded-4">
        <h3 className="mb-4 text-center">Welcome, Border!</h3>

        <div className="mb-3">
          <strong>Your Name:</strong> John Doe <br />
          <strong>Room No:</strong> B-205 <br />
          <strong>Status:</strong> {mealStatus ? 'Meal ON' : 'Meal OFF'}
        </div>

        <button className={`btn ${mealStatus ? 'btn-danger' : 'btn-success'} w-100`} onClick={toggleMeal}>
          Turn Meal {mealStatus ? 'OFF' : 'ON'}
        </button>
      </div>
    </div>
  );
}

export default BorderDashboard;
