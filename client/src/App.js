import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import BorderDashboard from './pages/BorderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EditInfo from './pages/EditInfo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/border" element={<BorderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/edit-info" element={<EditInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
