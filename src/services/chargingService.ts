import { ChargingSession, Station, User } from '../types';

export class ChargingService {
  private static instance: ChargingService;
  private chargingTimer: NodeJS.Timeout | null = null;

  static getInstance(): ChargingService {
    if (!ChargingService.instance) {
      ChargingService.instance = new ChargingService();
    }
    return ChargingService.instance;
  }

  calculateChargingCost(energyConsumed: number, ratePerKwh: number): number {
    return energyConsumed * ratePerKwh;
  }

  calculateBatteryLevel(startLevel: number, energyConsumed: number, batteryCapacity: number = 50): number {
    const batteryGain = (energyConsumed / batteryCapacity) * 100;
    return Math.min(startLevel + batteryGain, 100);
  }

  estimateChargingTime(currentBattery: number, targetBattery: number, powerOutput: number, batteryCapacity: number = 50): number {
    const energyNeeded = ((targetBattery - currentBattery) / 100) * batteryCapacity;
    return Math.ceil((energyNeeded / powerOutput) * 3600); // seconds
  }

  validateWalletBalance(user: User, estimatedCost: number): boolean {
    return user.walletBalance >= estimatedCost;
  }

  generateSessionId(): string {
    return `CS${Date.now().toString().slice(-8)}`;
  }

  calculateDynamicPricing(baseRate: number, timeOfDay: Date, stationLoad: number): number {
    const hour = timeOfDay.getHours();
    let multiplier = 1;

    // Peak hours (8-10 AM, 6-8 PM)
    if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20)) {
      multiplier = 1.2;
    }
    // Off-peak hours (11 PM - 6 AM)
    else if (hour >= 23 || hour <= 6) {
      multiplier = 0.8;
    }

    // Station load factor
    if (stationLoad > 0.8) {
      multiplier *= 1.1;
    }

    return Math.round(baseRate * multiplier * 100) / 100;
  }

  formatChargingData(session: ChargingSession) {
    const duration = session.endTime ? 
      (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0;
    
    return {
      sessionId: session.id,
      duration: Math.floor(duration),
      energyConsumed: session.energyConsumed,
      cost: session.totalCost,
      efficiency: session.energyConsumed > 0 ? (session.totalCost / session.energyConsumed) : 0,
      batteryGain: (session.batteryEnd || 0) - (session.batteryStart || 0),
    };
  }
}

export const chargingService = ChargingService.getInstance();