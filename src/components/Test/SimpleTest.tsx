import React from 'react';
import { useApp } from '../../context/AppContext';

const SimpleTest: React.FC = () => {
  const { currentUser, isAuthenticated } = useApp();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Component</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Current User:</strong> {currentUser ? currentUser.name : 'None'}</p>
        <p><strong>Is Admin:</strong> {currentUser?.isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Vehicle ID:</strong> {currentUser?.vehicleId || 'None'}</p>
        <p><strong>Wallet Balance:</strong> ₹{currentUser?.walletBalance || 0}</p>
      </div>
    </div>
  );
};

export default SimpleTest;
