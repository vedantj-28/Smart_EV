import { clsx } from 'clsx';

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
}

export function formatPower(kw: number): string {
  return `${kw.toFixed(1)} kW`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function calculateChargingTime(currentBattery: number, targetBattery: number, powerOutput: number, batteryCapacity: number = 50): number {
  const energyNeeded = ((targetBattery - currentBattery) / 100) * batteryCapacity;
  return Math.ceil((energyNeeded / powerOutput) * 3600); // seconds
}

export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV${year}${month}${day}${random}`;
}

export function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

export function calculateCO2Saved(energyKwh: number): number {
  // Average CO2 emission factor for petrol vehicles: 0.82 kg CO2/kWh equivalent
  return energyKwh * 0.82;
}

export function calculateFuelSaved(energyKwh: number): number {
  // Average fuel efficiency: 1 kWh = 3.5 liters of petrol equivalent
  return energyKwh * 3.5;
}

export function getChargingEfficiency(energyConsumed: number, duration: number): number {
  if (duration === 0) return 0;
  return energyConsumed / (duration / 3600); // kWh per hour
}

export function getBatteryHealthStatus(batteryLevel: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
} {
  if (batteryLevel >= 80) {
    return { status: 'excellent', color: 'success', message: 'Excellent battery health' };
  } else if (batteryLevel >= 60) {
    return { status: 'good', color: 'primary', message: 'Good battery health' };
  } else if (batteryLevel >= 40) {
    return { status: 'fair', color: 'warning', message: 'Fair battery health' };
  } else {
    return { status: 'poor', color: 'error', message: 'Poor battery health - consider charging' };
  }
}

export function getTimeOfDayPricing(baseRate: number, hour: number): number {
  // Peak hours: 8-10 AM, 6-8 PM (20% increase)
  if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20)) {
    return baseRate * 1.2;
  }
  // Off-peak hours: 11 PM - 6 AM (20% decrease)
  else if (hour >= 23 || hour <= 6) {
    return baseRate * 0.8;
  }
  // Normal hours
  return baseRate;
}

export function validateVehicleId(vehicleId: string): boolean {
  // Indian vehicle number format: XX00XX0000
  const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
  return pattern.test(vehicleId);
}

export function validateRFID(rfidId: string): boolean {
  // RFID format: alphanumeric, 8-16 characters
  const pattern = /^[A-Z0-9]{8,16}$/;
  return pattern.test(rfidId);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}