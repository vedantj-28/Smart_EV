import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import LoginForm from './components/Auth/LoginForm';
import DashboardHome from './components/Dashboard/DashboardHome';
import ChargingInterface from './components/Charging/ChargingInterface';
import WalletInterface from './components/Wallet/WalletInterface';
import HistoryInterface from './components/History/HistoryInterface';
import AdminDashboard from './components/Admin/AdminDashboard';
import NotificationCenter from './components/Notifications/NotificationCenter';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  console.log('App - isAuthenticated:', isAuthenticated);
  console.log('App - currentUser:', currentUser);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        <div></div>
        <NotificationCenter />
      </div>
      <Navbar />
      <div className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={
            currentUser?.isAdmin ? 
              <Navigate to="/admin" replace /> : 
              <DashboardHome />
          } />
          <Route path="/charging" element={<ChargingInterface />} />
          <Route path="/wallet" element={<WalletInterface />} />
          <Route path="/history" element={<HistoryInterface />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;