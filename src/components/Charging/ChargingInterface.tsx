import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, Square, Battery, Zap, Clock, DollarSign, MapPin, 
  AlertTriangle, Thermometer, Gauge, Target, Settings,
  CheckCircle, XCircle, Pause, RotateCcw
} from 'lucide-react';
import { formatCurrency, formatEnergy, formatDuration } from '../../lib/utils';
import { chargingService } from '../../services/chargingService';

const ChargingInterface: React.FC = () => {
  const { currentUser, isCharging, currentSession, stations, startCharging, stopCharging } = useApp();
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [showConfirmStop, setShowConfirmStop] = useState(false);
  const [chargingMode, setChargingMode] = useState<'fast' | 'normal' | 'eco'>('normal');
  const [targetBattery, setTargetBattery] = useState(80);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [chargingAlerts, setChargingAlerts] = useState<string[]>([]);

  if (!currentUser) return null;

  const availableStations = stations.filter(s => s.status === 'idle');
  const activeStation = stations.find(s => s.id === currentSession?.stationId);

  const chargingDuration = currentSession ? 
    Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000) : 0;

  const batteryProgress = currentSession ? 
    chargingService.calculateBatteryLevel(
      currentSession.batteryStart!,
      currentSession.energyConsumed,
      50
    ) : 65;

  const estimatedTimeRemaining = currentSession && activeStation ? 
    chargingService.estimateChargingTime(batteryProgress, targetBattery, activeStation.powerOutput, 50) : 0;

  // Calculate dynamic pricing
  const currentRate = selectedStation ? 
    chargingService.calculateDynamicPricing(8.0, new Date(), 0.6) : 8.0;

  // Update estimated cost when station or target changes
  useEffect(() => {
    if (selectedStation && targetBattery) {
      const station = stations.find(s => s.id === selectedStation);
      if (station) {
        const energyNeeded = ((targetBattery - 65) / 100) * 50; // Assume 50kWh battery, 65% current
        const cost = energyNeeded * currentRate;
        setEstimatedCost(cost);
      }
    }
  }, [selectedStation, targetBattery, currentRate, stations]);

  // Monitor charging alerts
  useEffect(() => {
    if (!isCharging || !currentSession) return;

    const alerts: string[] = [];

    // Battery level alerts
    if (batteryProgress >= 90) {
      alerts.push('Battery nearly full - consider stopping soon');
    }
    
    // Cost alerts
    if (currentSession.totalCost > currentUser.walletBalance * 0.8) {
      alerts.push('High charging cost - monitor wallet balance');
    }

    // Duration alerts
    if (chargingDuration > 7200) { // 2 hours
      alerts.push('Long charging session - check if needed');
    }

    setChargingAlerts(alerts);
  }, [isCharging, currentSession, batteryProgress, chargingDuration, currentUser.walletBalance]);

  const handleStartCharging = () => {
    if (selectedStation && currentUser.walletBalance > estimatedCost) {
      startCharging(selectedStation);
    }
  };

  const handleStopCharging = () => {
    stopCharging();
    setShowConfirmStop(false);
  };

  const getChargingModeConfig = (mode: string) => {
    switch (mode) {
      case 'fast':
        return { power: '100%', time: 'Fastest', cost: 'Higher', color: 'error' };
      case 'normal':
        return { power: '75%', time: 'Balanced', cost: 'Standard', color: 'primary' };
      case 'eco':
        return { power: '50%', time: 'Slower', cost: 'Lower', color: 'success' };
      default:
        return { power: '75%', time: 'Balanced', cost: 'Standard', color: 'primary' };
    }
  };

  const modeConfig = getChargingModeConfig(chargingMode);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Charging Control</h1>
        <p className="text-gray-600 mt-2">
          {isCharging ? 'Monitor and control your active charging session' : 'Configure and start a new charging session'}
        </p>
      </div>

      {/* Charging Alerts */}
      {chargingAlerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {chargingAlerts.map((alert, index) => (
            <div key={index} className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <p className="text-warning-800">{alert}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isCharging ? (
        /* Enhanced Start Charging Interface */
        <div className="space-y-8">
          {/* Pre-flight Checks */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-flight Checks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                currentUser.walletBalance > 100 ? 'bg-success-50' : 'bg-error-50'
              }`}>
                {currentUser.walletBalance > 100 ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-error-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Wallet Balance</p>
                  <p className="text-sm text-gray-600">{formatCurrency(currentUser.walletBalance)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <div>
                  <p className="font-medium text-gray-900">Vehicle Connected</p>
                  <p className="text-sm text-gray-600">{currentUser.vehicleId}</p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                availableStations.length > 0 ? 'bg-success-50' : 'bg-warning-50'
              }`}>
                {availableStations.length > 0 ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">Stations Available</p>
                  <p className="text-sm text-gray-600">{availableStations.length} stations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charging Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Station Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Charging Station</h3>
              <div className="space-y-4">
                {availableStations.map((station) => (
                  <div
                    key={station.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStation === station.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedStation(station.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{station.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Available
                        </span>
                        <span className="text-sm font-medium text-primary-600">
                          {formatCurrency(currentRate)}/kWh
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{station.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>{station.powerOutput} kW Fast Charging</span>
                      </div>
                    </div>
                    
                    {selectedStation === station.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estimated time to {targetBattery}%:</span>
                          <span className="font-medium text-gray-900">
                            {formatDuration(chargingService.estimateChargingTime(65, targetBattery, station.powerOutput, 50))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Charging Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Charging Settings</h3>
              
              <div className="space-y-6">
                {/* Target Battery Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Target Battery Level: {targetBattery}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={targetBattery}
                    onChange={(e) => setTargetBattery(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Charging Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Charging Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['eco', 'normal', 'fast'].map((mode) => {
                      const config = getChargingModeConfig(mode);
                      return (
                        <button
                          key={mode}
                          onClick={() => setChargingMode(mode as any)}
                          className={`p-3 border-2 rounded-lg text-center transition-all ${
                            chargingMode === mode
                              ? `border-${config.color}-500 bg-${config.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-semibold text-gray-900 capitalize">{mode}</p>
                          <p className="text-xs text-gray-600">{config.time}</p>
                          <p className="text-xs text-gray-500">{config.cost} cost</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cost Estimation */}
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-primary-900">Estimated Cost</span>
                    <span className="text-xl font-bold text-primary-600">{formatCurrency(estimatedCost)}</span>
                  </div>
                  <div className="text-sm text-primary-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Energy needed:</span>
                      <span>{formatEnergy((targetBattery - 65) * 0.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current rate:</span>
                      <span>{formatCurrency(currentRate)}/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. time:</span>
                      <span>
                        {selectedStation ? 
                          formatDuration(chargingService.estimateChargingTime(
                            65, targetBattery, 
                            stations.find(s => s.id === selectedStation)?.powerOutput || 22, 
                            50
                          )) : 'Select station'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Settings</span>
                </button>

                {showAdvancedSettings && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-primary-600" />
                        <span className="text-sm text-gray-700">Auto-stop at target battery</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-primary-600" />
                        <span className="text-sm text-gray-700">Send notifications to phone</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                        <span className="text-sm text-gray-700">Optimize for cost efficiency</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Start Charging Button */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to Start</h3>
                <p className="text-sm text-gray-600">
                  {selectedStation ? 
                    `Charging to ${targetBattery}% using ${chargingMode} mode` : 
                    'Please select a station to continue'
                  }
                </p>
              </div>
              {selectedStation && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Estimated Total</p>
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(estimatedCost)}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleStartCharging}
              disabled={!selectedStation || currentUser.walletBalance <= estimatedCost}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              <Play className="w-6 h-6" />
              <span className="text-lg">Start Charging Session</span>
            </button>

            {(!selectedStation || currentUser.walletBalance <= estimatedCost) && (
              <div className="mt-3 text-center">
                <p className="text-sm text-error-600">
                  {!selectedStation ? 'Please select a charging station' : 'Insufficient wallet balance'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Enhanced Active Charging Interface */
        <div className="space-y-8">
          {/* Main Charging Display */}
          <div className="bg-gradient-to-r from-primary-500 to-success-500 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Charging in Progress</h3>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm">Live Session</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {chargingMode.toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
              <div>
                <p className="text-primary-100 text-sm">Energy</p>
                <p className="text-2xl font-bold">{formatEnergy(currentSession!.energyConsumed)}</p>
                <p className="text-xs text-primary-200">+{(currentSession!.energyConsumed * 60).toFixed(1)}L saved</p>
              </div>
              <div>
                <p className="text-primary-100 text-sm">Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(currentSession!.totalCost)}</p>
                <p className="text-xs text-primary-200">₹{(currentSession!.totalCost / chargingDuration * 3600).toFixed(2)}/hr</p>
              </div>
              <div>
                <p className="text-primary-100 text-sm">Duration</p>
                <p className="text-2xl font-bold">{formatDuration(chargingDuration)}</p>
                <p className="text-xs text-primary-200">Started {currentSession!.startTime.toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-primary-100 text-sm">Efficiency</p>
                <p className="text-2xl font-bold">{(currentSession!.energyConsumed / (chargingDuration / 3600)).toFixed(1)} kW</p>
                <p className="text-xs text-primary-200">Real-time rate</p>
              </div>
              <div>
                <p className="text-primary-100 text-sm">Time to Goal</p>
                <p className="text-2xl font-bold">{formatDuration(estimatedTimeRemaining)}</p>
                <p className="text-xs text-primary-200">To {targetBattery}%</p>
              </div>
            </div>

            {/* Enhanced Battery Progress */}
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-3">
                <span>Battery Progress</span>
                <span>{Math.floor(batteryProgress)}% of {targetBattery}% goal</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="bg-white h-6 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${batteryProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
                {/* Goal marker */}
                <div 
                  className="absolute top-0 w-1 h-6 bg-yellow-300"
                  style={{ left: `${targetBattery}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span>Start: {currentSession!.batteryStart}%</span>
                <span className="text-yellow-200">Goal: {targetBattery}%</span>
                <span>Full: 100%</span>
              </div>
            </div>
          </div>

          {/* Station Details & Environmental Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Station Info */}
            {activeStation && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activeStation.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{activeStation.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600">Power Output</p>
                      <p className="font-semibold text-gray-900">{activeStation.powerOutput} kW</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Rate</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(currentSession!.costPerKwh)}/kWh</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600">Station Health</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <span className="font-semibold text-success-600">Excellent</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600">Temperature</p>
                      <div className="flex items-center space-x-1">
                        <Thermometer className="w-3 h-3 text-gray-500" />
                        <span className="font-semibold text-gray-900">32°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Impact */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-success-600" />
                    </div>
                    <span className="font-medium text-success-900">CO₂ Saved</span>
                  </div>
                  <span className="font-bold text-success-600">
                    {(currentSession!.energyConsumed * 0.82).toFixed(1)} kg
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Gauge className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="font-medium text-primary-900">Fuel Equivalent</span>
                  </div>
                  <span className="font-bold text-primary-600">
                    {(currentSession!.energyConsumed * 3.5).toFixed(1)}L
                  </span>
                </div>

                <div className="text-xs text-gray-600 mt-3">
                  <p>* Based on average ICE vehicle emissions and fuel consumption</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charging Controls */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Controls</h3>
            
            {!showConfirmStop ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowConfirmStop(true)}
                  className="flex items-center justify-center space-x-2 bg-error-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-error-700 transition-colors"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop Charging</span>
                </button>
                
                <button
                  className="flex items-center justify-center space-x-2 bg-warning-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-warning-700 transition-colors"
                  onClick={() => alert('Pause feature coming soon!')}
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause Session</span>
                </button>

                <button
                  className="flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  onClick={() => setTargetBattery(Math.min(targetBattery + 10, 100))}
                >
                  <Target className="w-5 h-5" />
                  <span>Extend Goal</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-warning-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <div>
                    <p className="font-medium text-warning-800">Confirm Stop Charging</p>
                    <p className="text-sm text-warning-700">
                      Current cost: {formatCurrency(currentSession!.totalCost)} • 
                      Battery: {Math.floor(batteryProgress)}%
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleStopCharging}
                    className="flex-1 bg-error-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-error-700 transition-colors"
                  >
                    Yes, Stop Charging
                  </button>
                  <button
                    onClick={() => setShowConfirmStop(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Continue Charging
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargingInterface;