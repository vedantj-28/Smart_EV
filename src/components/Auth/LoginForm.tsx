import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, Car, CreditCard, AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login } = useApp();
  const [vehicleId, setVehicleId] = useState('');
  const [rfidId, setRfidId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(vehicleId, rfidId);
      if (!success) {
        setError('Invalid credentials. Please check your Vehicle ID and RFID.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoUser = () => {
    setVehicleId('MH01AB1234');
    setRfidId('RFID123456789');
  };

  const fillDemoAdmin = () => {
    setVehicleId('ADMIN001');
    setRfidId('ADMIN123456789');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EV Smart Charger</h1>
            <p className="text-gray-600 mt-2">Authenticate to start charging</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="vehicleId"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value.toUpperCase())}
                  placeholder="MH01AB1234"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="rfidId" className="block text-sm font-medium text-gray-700 mb-2">
                RFID Card ID
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="rfidId"
                  value={rfidId}
                  onChange={(e) => setRfidId(e.target.value)}
                  placeholder="RFID123456789"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Demo Accounts:</p>
            <div className="space-y-2">
              <button
                onClick={fillDemoUser}
                className="w-full text-sm text-primary-600 hover:text-primary-700 py-2 px-4 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Fill User Demo (MH01AB1234)
              </button>
              <button
                onClick={fillDemoAdmin}
                className="w-full text-sm text-success-600 hover:text-success-700 py-2 px-4 border border-success-200 rounded-lg hover:bg-success-50 transition-colors"
              >
                Fill Admin Demo (ADMIN001)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;