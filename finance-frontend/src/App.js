import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Profile from './Profile';
import History from './History'; // 1. Import the new component
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <div style={{ backgroundColor: '#0a0e17', minHeight: '100vh', width: '100%' }}>
      <Router>
        <Routes>
          {/* Public Only Routes */}
          <Route path="/login" element={<ProtectedRoute isPublicOnly><Login /></ProtectedRoute>} />
          <Route path="/signup" element={<ProtectedRoute isPublicOnly><Signup /></ProtectedRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} /> {/* 2. Register the route */}

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;