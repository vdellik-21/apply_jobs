import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Settings from './pages/Settings';
import Extension from './pages/Extension';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="applications" element={<Applications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="extension" element={<Extension />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors />
      </div>
    </Router>
  );
}

export default App;
