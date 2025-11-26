import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Battery, Zap, DollarSign, Clock, TrendingUp, MapPin, 
  AlertCircle, CheckCircle, Play, Square, Thermometer,
  Gauge, Calendar, Target, Award, FileText
} from 'lucide-react';
import { formatCurrency, formatEnergy, formatDuration } from '../../lib/utils';
import { chargingService } from '../../services/chargingService';

const DashboardHome: React.FC = () => {
  const { currentUser, isCharging, currentSession, stations, sessions } = useApp();
  const [weatherData, setWeatherData] = useState({ temp: 28, condition: 'Sunny' });
  const [chargingGoal, setChargingGoal] = useState(80);
  const [showGoalSetter, setShowGoalSetter] = useState(false);

  console.log('DashboardHome - Rendering for user:', currentUser?.name);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  const currentBattery = currentSession?.batteryStart || 65;
  const batteryProgress = currentSession ? 
    chargingService.calculateBatteryLevel(
      currentSession.batteryStart!,
      currentSession.energyConsumed,
      50 // Assume 50kWh battery capacity
    ) : currentBattery;

  const activeStation = stations.find(s => s.status === 'charging');
  const recentSessions = sessions.filter(s => s.userId === currentUser.id).slice(0, 3);
  
  // Calculate user statistics
  const userStats = {
    totalSessions: sessions.filter(s => s.userId === currentUser.id).length,
    totalEnergy: sessions.filter(s => s.userId === currentUser.id).reduce((sum, s) => sum + s.energyConsumed, 0),
    totalSpent: sessions.filter(s => s.userId === currentUser.id).reduce((sum, s) => sum + s.totalCost, 0),
    avgSessionCost: 0,
  };
  userStats.avgSessionCost = userStats.totalSessions > 0 ? userStats.totalSpent / userStats.totalSessions : 0;

  // Charging efficiency calculation
  const chargingEfficiency = currentSession ? 
    (currentSession.energyConsumed / ((Date.now() - currentSession.startTime.getTime()) / 3600000)) : 0;

  // Estimated time to goal
  const timeToGoal = currentSession && activeStation ? 
    chargingService.estimateChargingTime(batteryProgress, chargingGoal, activeStation.powerOutput, 50) : 0;

  const chargingDuration = currentSession ? 
    Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000) : 0;

  // Simulate weather updates
  useEffect(() => {
    const updateWeather = () => {
      const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Clear'];
      setWeatherData({
        temp: Math.floor(Math.random() * 15) + 20, // 20-35°C
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      });
    };

    const interval = setInterval(updateWeather, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {isCharging ? 'Your vehicle is currently charging' : 'Ready to charge your vehicle'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Thermometer className="w-4 h-4" />
              <span>{weatherData.temp}°C • {weatherData.condition}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Mumbai, India</p>
          </div>
        </div>
      </div>

      {/* Enhanced Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Battery Level</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(batteryProgress)}%</p>
              <p className="text-xs text-gray-500 mt-1">
                Goal: {chargingGoal}% 
                <button 
                  onClick={() => setShowGoalSetter(true)}
                  className="ml-2 text-primary-600 hover:text-primary-700"
                >
                  (change)
                </button>
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Battery className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  batteryProgress >= chargingGoal ? 'bg-success-500' : 'bg-gradient-to-r from-error-400 via-warning-400 to-success-400'
                }`}
                style={{ width: `${batteryProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-primary-600">{chargingGoal}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentUser.walletBalance)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Est. {Math.floor(currentUser.walletBalance / 8)} kWh available
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              currentUser.walletBalance > 500 ? 'bg-success-100 text-success-800' :
              currentUser.walletBalance > 100 ? 'bg-warning-100 text-warning-800' :
              'bg-error-100 text-error-800'
            }`}>
              {currentUser.walletBalance > 500 ? 'Excellent Balance' :
               currentUser.walletBalance > 100 ? 'Good Balance' : 'Low Balance'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatEnergy(currentSession?.energyConsumed || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Efficiency: {chargingEfficiency.toFixed(1)} kW
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Session Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentSession?.totalCost || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {timeToGoal > 0 ? `${formatDuration(timeToGoal)} to goal` : 'Goal reached!'}
              </p>
            </div>
            <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Setter Modal */}
      {showGoalSetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Set Charging Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Battery Level: {chargingGoal}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={chargingGoal}
                  onChange={(e) => setChargingGoal(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-primary-700">
                  Estimated cost to reach {chargingGoal}%: {formatCurrency((chargingGoal - batteryProgress) * 0.4)}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowGoalSetter(false)}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Set Goal
              </button>
              <button
                onClick={() => setShowGoalSetter(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Charging Session */}
      {isCharging && currentSession && (
        <div className="bg-gradient-to-r from-primary-500 to-success-500 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Active Charging Session</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm">Live Updates</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-primary-100 text-sm">Energy</p>
              <p className="text-2xl font-bold">{formatEnergy(currentSession.energyConsumed)}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(currentSession.totalCost)}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Duration</p>
              <p className="text-2xl font-bold">{formatDuration(chargingDuration)}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Efficiency</p>
              <p className="text-2xl font-bold">{chargingEfficiency.toFixed(1)} kW</p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Battery: {currentSession.batteryStart}%</span>
              <span>Goal: {chargingGoal}%</span>
              <span>Current: {Math.floor(batteryProgress)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${batteryProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span>Start</span>
              <span className="text-yellow-200">Target: {timeToGoal > 0 ? formatDuration(timeToGoal) : 'Reached!'}</span>
              <span>Full</span>
            </div>
          </div>
        </div>
      )}

      {/* Station Information & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Available Stations */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCharging ? 'Current Station' : 'Available Stations'}
          </h3>
          
          {isCharging && activeStation ? (
            <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{activeStation.name}</h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-1 animate-pulse"></div>
                  Charging
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{activeStation.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>{activeStation.powerOutput} kW Output</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(currentSession!.costPerKwh)}/kWh</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {stations.filter(s => s.status === 'idle').map((station) => (
                <div key={station.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{station.name}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{station.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{station.powerOutput} kW</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Charging Stats</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">Total Sessions</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{userStats.totalSessions}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <Battery className="w-4 h-4 text-success-600" />
                </div>
                <span className="font-medium text-gray-900">Total Energy</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{formatEnergy(userStats.totalEnergy)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-error-600" />
                </div>
                <span className="font-medium text-gray-900">Avg. Session Cost</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(userStats.avgSessionCost)}</span>
            </div>

            {userStats.totalSessions >= 10 && (
              <div className="flex items-center justify-center p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Frequent Charger Badge!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
            <a 
              href="/history" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </a>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentSessions.length > 0 ? (
            recentSessions.map((session) => {
              const duration = session.endTime ? 
                (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0;
              const station = stations.find(s => s.id === session.stationId);

              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">#{session.id.slice(-6)}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{session.startTime.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{station?.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(session.totalCost)}</p>
                      <p className="text-sm text-gray-500">{formatEnergy(session.energyConsumed)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No charging sessions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start your first charging session to see history here</p>
            </div>
          )}
        </div>
      </div>

      {/* System Alerts */}
      {currentUser.walletBalance <= 100 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-warning-600" />
            <div>
              <p className="font-medium text-warning-800">Low Wallet Balance</p>
              <p className="text-sm text-warning-700">
                Your balance is running low. Consider topping up to avoid charging interruptions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;