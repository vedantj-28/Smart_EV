// Charging Service - Business logic for EV charging operations
import { mockStations } from './mockData';
import { Station, ChargingSession } from '../types';

export interface ChargingStatus {
  charging: boolean;
  elapsed_min: number;
  estimated_cost: number;
  currentPower?: number; // kW
  energyConsumed?: number; // kWh
  batteryLevel?: number; // percentage
  estimatedTimeToFull?: number; // minutes
  last_session?: {
    duration_min: number;
    cost: number;
    timestamp: string;
    energyConsumed?: number;
  } | null;
}

class ChargingService {
  private static instance: ChargingService;
  private currentSession: ChargingSession | null = null;
  private sessionStartTime: Date | null = null;
  private readonly PRICE_PER_KWH = 12; // ₹12 per kWh
  private readonly AVERAGE_POWER = 7.2; // kW average charging power

  static getInstance(): ChargingService {
    if (!ChargingService.instance) {
      ChargingService.instance = new ChargingService();
    }
    return ChargingService.instance;
  }

  // Get all available charging stations
  getChargingStations(): Station[] {
    return mockStations;
  }

  // Get station by ID
  getStationById(stationId: string): Station | null {
    return mockStations.find(station => station.id === stationId) || null;
  }

  // Get current charging status
  getChargingStatus(): ChargingStatus {
    if (!this.currentSession || !this.sessionStartTime) {
      return {
        charging: false,
        elapsed_min: 0,
        estimated_cost: 0,
        currentPower: 0,
        energyConsumed: 0,
        last_session: this.getLastSession()
      };
    }

    const elapsedMs = Date.now() - this.sessionStartTime.getTime();
    const elapsedMin = elapsedMs / (1000 * 60);
    const elapsedHours = elapsedMin / 60;
    const energyConsumed = elapsedHours * this.AVERAGE_POWER;
    const estimatedCost = energyConsumed * this.PRICE_PER_KWH;
    
    // Simulate battery level increase (assuming 60kWh battery, starting at 20%)
    const batteryLevel = Math.min(95, 20 + (energyConsumed / 60) * 100);
    const estimatedTimeToFull = batteryLevel >= 95 ? 0 : ((60 * 0.75) - energyConsumed) / this.AVERAGE_POWER * 60;

    return {
      charging: true,
      elapsed_min: elapsedMin,
      estimated_cost: estimatedCost,
      currentPower: this.AVERAGE_POWER,
      energyConsumed,
      batteryLevel,
      estimatedTimeToFull,
      last_session: this.getLastSession()
    };
  }

  // Start charging session
  async startCharging(userId: string, stationId: string, vehicleId: string = 'DEFAULT'): Promise<ChargingSession> {
    if (this.currentSession) {
      throw new Error('Charging session already in progress');
    }

    const station = this.getStationById(stationId);
    if (!station || station.status !== 'idle') {
      throw new Error('Station not available for charging');
    }

    this.sessionStartTime = new Date();
    this.currentSession = {
      id: `session_${Date.now()}`,
      userId,
      vehicleId,
      stationId,
      startTime: this.sessionStartTime,
      energyConsumed: 0,
      costPerKwh: this.PRICE_PER_KWH,
      totalCost: 0,
      batteryStart: 20,
      status: 'active',
      chargingMode: 'normal',
      targetBattery: 80
    };

    // Update station status
    station.status = 'charging';
    if (station.currentSession !== undefined) {
      station.currentSession = this.currentSession.id;
    }

    return this.currentSession;
  }

  // Stop charging session
  async stopCharging(): Promise<{ session: ChargingSession; invoice: any }> {
    if (!this.currentSession || !this.sessionStartTime) {
      throw new Error('No active charging session');
    }

    const status = this.getChargingStatus();
    const endTime = new Date();
    
    // Complete the session
    this.currentSession.endTime = endTime;
    this.currentSession.energyConsumed = status.energyConsumed || 0;
    this.currentSession.totalCost = status.estimated_cost;
    this.currentSession.status = 'completed';
    this.currentSession.batteryEnd = status.batteryLevel || 80;

    // Update station status
    const station = this.getStationById(this.currentSession.stationId);
    if (station) {
      station.status = 'idle';
      station.currentSession = undefined;
    }

    // Create invoice
    const invoice = this.generateInvoice(this.currentSession);

    // Save to history (in real app, this would be saved to database)
    this.saveSessionToHistory(this.currentSession);

    const completedSession = { ...this.currentSession };
    
    // Reset current session
    this.currentSession = null;
    this.sessionStartTime = null;

    return { session: completedSession, invoice };
  }

  // Generate invoice for completed session
  private generateInvoice(session: ChargingSession) {
    const station = this.getStationById(session.stationId);
    const duration = session.endTime && session.startTime ? 
      (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60) : 0;

    return {
      invoiceId: `INV_${Date.now()}`,
      sessionId: session.id,
      userId: session.userId,
      vehicleId: session.vehicleId,
      stationName: station?.name || 'Unknown Station',
      stationLocation: station?.location || 'Unknown Location',
      startTime: session.startTime,
      endTime: session.endTime,
      duration: Math.round(duration),
      energyConsumed: session.energyConsumed,
      pricePerKWh: this.PRICE_PER_KWH,
      subtotal: session.totalCost,
      tax: session.totalCost * 0.18, // 18% GST
      total: session.totalCost * 1.18,
      paymentMethod: 'Wallet',
      generatedAt: new Date()
    };
  }

  // Get user's charging history
  getChargingHistory(userId: string): ChargingSession[] {
    // In real app, this would fetch from database
    const history = localStorage.getItem(`charging_history_${userId}`);
    return history ? JSON.parse(history) : [];
  }

  // Save session to history
  private saveSessionToHistory(session: ChargingSession) {
    const history = this.getChargingHistory(session.userId);
    history.push(session);
    localStorage.setItem(`charging_history_${session.userId}`, JSON.stringify(history));
  }

  // Get last completed session
  private getLastSession() {
    const mockLastSession = {
      duration_min: 45,
      cost: 85.50,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      energyConsumed: 12.5
    };
    return mockLastSession;
  }

  // Calculate estimated charging time
  calculateEstimatedTime(currentBattery: number, targetBattery: number, batteryCapacity: number = 60): number {
    const energyNeeded = ((targetBattery - currentBattery) / 100) * batteryCapacity;
    return (energyNeeded / this.AVERAGE_POWER) * 60; // minutes
  }

  // Calculate estimated cost for charging
  calculateEstimatedCost(currentBattery: number, targetBattery: number, batteryCapacity: number = 60): number {
    const energyNeeded = ((targetBattery - currentBattery) / 100) * batteryCapacity;
    return energyNeeded * this.PRICE_PER_KWH;
  }

  // Check if station is available for booking
  isStationAvailable(stationId: string): boolean {
    const station = this.getStationById(stationId);
    return station ? station.status === 'idle' : false;
  }

  // Get available stations
  getAvailableStations(): Station[] {
    return mockStations.filter(station => station.status === 'idle');
  }

  // Get station statistics
  getStationStats(stationId: string) {
    const station = this.getStationById(stationId);
    if (!station) return null;

    return {
      stationId,
      name: station.name,
      location: station.location,
      status: station.status,
      powerOutput: station.powerOutput,
      maxPowerOutput: station.maxPowerOutput,
      efficiency: station.efficiency,
      utilizationRate: station.utilizationRate,
      totalEnergyDispensed: station.totalEnergyDispensed,
      totalRevenue: station.totalRevenue
    };
  }
}

// Export singleton instance
export const chargingService = ChargingService.getInstance();

// Export utility functions
export const formatChargingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatEnergy = (kWh: number): string => {
  return `${kWh.toFixed(2)} kWh`;
};

export const formatChargingCost = (cost: number): string => {
  return `₹${cost.toFixed(2)}`;
};