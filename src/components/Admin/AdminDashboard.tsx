import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, Zap, DollarSign, Users, MapPin, Activity, Settings, 
  AlertTriangle, Download, RefreshCw, Calendar, Battery, 
  Wrench, Shield, Clock, Target
} from 'lucide-react';
import { formatCurrency, formatEnergy, formatDuration } from '../../lib/utils';

const AdminDashboard: React.FC = () => {
  const { currentUser, stations, sessions, transactions } = useApp();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'energy' | 'sessions'>('revenue');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>('');

  console.log('AdminDashboard - Rendering for user:', currentUser?.name, 'isAdmin:', currentUser?.isAdmin);

  if (!currentUser?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <AlertTriangle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const totalRevenue = stations.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalEnergy = stations.reduce((sum, s) => sum + s.totalEnergyDispensed, 0);
  const totalSessions = sessions.length;
  const activeStations = stations.filter(s => s.status === 'charging').length;
  const faultyStations = stations.filter(s => s.status === 'fault').length;

  // Calculate additional metrics
  const avgSessionValue = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const avgEnergyPerSession = totalSessions > 0 ? totalEnergy / totalSessions : 0;
  const stationUtilization = stations.length > 0 ? (activeStations / stations.length) * 100 : 0;

  // Enhanced chart data with more realistic patterns
  const revenueData = [
    { month: 'Jan', revenue: 15000, energy: 187.5, sessions: 125 },
    { month: 'Feb', revenue: 18000, energy: 225.0, sessions: 150 },
    { month: 'Mar', revenue: 22000, energy: 275.0, sessions: 183 },
    { month: 'Apr', revenue: 19000, energy: 237.5, sessions: 158 },
    { month: 'May', revenue: 25000, energy: 312.5, sessions: 208 },
    { month: 'Jun', revenue: 28000, energy: 350.0, sessions: 233 },
    { month: 'Jul', revenue: 32000, energy: 400.0, sessions: 267 },
    { month: 'Aug', revenue: 29000, energy: 362.5, sessions: 242 },
  ];

  const stationPerformance = stations.map(station => ({
    name: station.name.split(' ').slice(-1)[0],
    sessions: Math.floor(station.totalEnergyDispensed / 15),
    revenue: station.totalRevenue,
    energy: station.totalEnergyDispensed,
    utilization: Math.random() * 100, // Mock utilization
    efficiency: 85 + Math.random() * 10, // Mock efficiency 85-95%
  }));

  const usageDistribution = [
    { name: 'Peak Hours', value: 45, color: '#EF4444' },
    { name: 'Normal Hours', value: 35, color: '#3B82F6' },
    { name: 'Off-Peak Hours', value: 20, color: '#10B981' },
  ];

  const handleMaintenanceSchedule = (stationId: string) => {
    setSelectedStation(stationId);
    setShowMaintenanceModal(true);
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
      summary: {
        totalRevenue,
        totalEnergy,
        totalSessions,
        avgSessionValue,
        stationUtilization,
      },
      stations: stationPerformance,
      revenueData,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-report-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor station performance, revenue, and system health</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
              +12.5% vs last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Energy</p>
              <p className="text-2xl font-bold text-gray-900">{formatEnergy(totalEnergy)}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">
              Avg: {formatEnergy(avgEnergyPerSession)}/session
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">
              Avg value: {formatCurrency(avgSessionValue)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Station Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{stationUtilization.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-error-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500">
              {activeStations} of {stations.length} active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {faultyStations === 0 ? '100%' : `${((stations.length - faultyStations) / stations.length * 100).toFixed(1)}%`}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              faultyStations === 0 ? 'bg-success-100' : 'bg-error-100'
            }`}>
              <Shield className={`w-6 h-6 ${
                faultyStations === 0 ? 'text-success-600' : 'text-error-600'
              }`} />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-xs ${faultyStations === 0 ? 'text-success-600' : 'text-error-600'}`}>
              {faultyStations === 0 ? 'All systems operational' : `${faultyStations} stations need attention`}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="revenue">Revenue</option>
                <option value="energy">Energy</option>
                <option value="sessions">Sessions</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => 
                  selectedMetric === 'revenue' ? formatCurrency(value as number) :
                  selectedMetric === 'energy' ? formatEnergy(value as number) :
                  `${value} sessions`
                } 
              />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Usage Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usageDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {usageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {usageDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Station Performance Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Station Performance</h3>
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-warning-600 text-white rounded-lg font-medium hover:bg-warning-700 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span>Schedule Maintenance</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Station</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Sessions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Energy</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Efficiency</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Last Maintenance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stationPerformance.map((station, index) => {
                const stationData = stations[index];
                const daysSinceMaintenace = Math.floor(
                  (Date.now() - stationData.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <tr key={stationData.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          stationData.status === 'idle' ? 'bg-success-100' :
                          stationData.status === 'charging' ? 'bg-primary-100' :
                          'bg-error-100'
                        }`}>
                          <Zap className={`w-4 h-4 ${
                            stationData.status === 'idle' ? 'text-success-600' :
                            stationData.status === 'charging' ? 'text-primary-600' :
                            'text-error-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stationData.name}</p>
                          <p className="text-sm text-gray-500">{stationData.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stationData.status === 'idle' ? 'bg-success-100 text-success-800' :
                        stationData.status === 'charging' ? 'bg-primary-100 text-primary-800' :
                        'bg-error-100 text-error-800'
                      }`}>
                        {stationData.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">{station.sessions}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{formatCurrency(station.revenue)}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{formatEnergy(station.energy)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              station.efficiency > 90 ? 'bg-success-500' :
                              station.efficiency > 80 ? 'bg-warning-500' : 'bg-error-500'
                            }`}
                            style={{ width: `${station.efficiency}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{station.efficiency.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{daysSinceMaintenace} days ago</p>
                        <p className={`text-xs ${
                          daysSinceMaintenace > 30 ? 'text-error-600' :
                          daysSinceMaintenace > 14 ? 'text-warning-600' : 'text-success-600'
                        }`}>
                          {daysSinceMaintenace > 30 ? 'Overdue' :
                           daysSinceMaintenace > 14 ? 'Due soon' : 'Good'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleMaintenanceSchedule(stationData.id)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Live Station Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Station Status</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            {stations.map((station) => (
              <div key={station.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    station.status === 'idle' ? 'bg-success-500' :
                    station.status === 'charging' ? 'bg-primary-500 animate-pulse' :
                    'bg-error-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{station.name}</p>
                    <p className="text-xs text-gray-500">{station.powerOutput} kW</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 capitalize">{station.status}</p>
                  <p className="text-xs text-gray-500">
                    {station.status === 'charging' ? 'Active session' : 'Ready'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          
          <div className="space-y-3">
            {faultyStations > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-error-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-error-600" />
                <div>
                  <p className="font-medium text-error-800">Station Fault</p>
                  <p className="text-sm text-error-700">{faultyStations} station(s) need attention</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 bg-warning-50 rounded-lg">
              <Clock className="w-5 h-5 text-warning-600" />
              <div>
                <p className="font-medium text-warning-800">Maintenance Due</p>
                <p className="text-sm text-warning-700">Station B maintenance overdue by 5 days</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
              <Target className="w-5 h-5 text-success-600" />
              <div>
                <p className="font-medium text-success-800">Revenue Target</p>
                <p className="text-sm text-success-700">85% of monthly target achieved</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
              <Battery className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-primary-800">Peak Usage</p>
                <p className="text-sm text-primary-700">High demand expected 6-8 PM today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Maintenance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Station</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose station...</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} - {station.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Routine Inspection</option>
                  <option>Deep Cleaning</option>
                  <option>Software Update</option>
                  <option>Hardware Repair</option>
                  <option>Emergency Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional maintenance notes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  alert('Maintenance scheduled successfully!');
                  setShowMaintenanceModal(false);
                }}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-primary-300 transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-xs text-gray-500">Download reports</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-success-300 transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">System Config</p>
              <p className="text-xs text-gray-500">Manage settings</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-warning-300 transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-xs text-gray-500">Manage accounts</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-error-300 transition-colors text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Emergency Stop</p>
              <p className="text-xs text-gray-500">Stop all stations</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;