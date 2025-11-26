export interface User {
  id: string;
  vehicleId: string;
  rfidId: string;
  email: string;
  name: string;
  phone?: string;
  walletBalance: number;
  isAdmin: boolean;
  memberSince: Date;
  totalSessions: number;
  totalEnergyConsumed: number;
  preferredChargingMode: 'fast' | 'normal' | 'eco';
}

export interface ChargingSession {
  id: string;
  userId: string;
  vehicleId: string;
  startTime: Date;
  endTime?: Date;
  energyConsumed: number; // kWh
  costPerKwh: number;
  totalCost: number;
  batteryStart: number; // percentage
  batteryEnd?: number; // percentage
  status: 'active' | 'completed' | 'stopped' | 'paused';
  stationId: string;
  chargingMode: 'fast' | 'normal' | 'eco';
  targetBattery: number;
  weatherCondition?: string;
  temperature?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'charge' | 'wallet_topup' | 'refund' | 'bonus';
  amount: number;
  description: string;
  timestamp: Date;
  sessionId?: string;
  paymentMethod?: string;
  transactionFee?: number;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

export interface Station {
  id: string;
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  status: 'idle' | 'charging' | 'fault' | 'maintenance' | 'offline';
  powerOutput: number; // kW
  maxPowerOutput: number; // kW
  totalEnergyDispensed: number; // kWh
  totalRevenue: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
  efficiency: number; // percentage
  temperature: number; // celsius
  connectorType: 'CCS' | 'CHAdeMO' | 'Type2';
  currentSession?: string;
  utilizationRate: number; // percentage
}

export interface Invoice {
  id: string;
  sessionId: string;
  userId: string;
  vehicleId: string;
  invoiceNumber: string;
  date: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  gstNumber?: string;
  customerEmail?: string;
  dueDate?: Date;
  paidDate?: Date;
  status: 'paid' | 'pending' | 'overdue';
}

export interface InvoiceItem {
  description: string;
  units: number;
  rate: number;
  amount: number;
  taxRate?: number;
  category?: 'charging' | 'service' | 'penalty';
}

export interface MaintenanceRecord {
  id: string;
  stationId: string;
  type: 'routine' | 'repair' | 'upgrade' | 'emergency';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  technician: string;
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'maintenance';
  title: string;
  message: string;
  stationId?: string;
  timestamp: Date;
  acknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChargingRate {
  id: string;
  name: string;
  baseRate: number; // ₹/kWh
  peakMultiplier: number;
  offPeakMultiplier: number;
  fastChargingMultiplier: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface EnergyConsumption {
  timestamp: Date;
  stationId: string;
  powerDraw: number; // kW
  voltage: number; // V
  current: number; // A
  temperature: number; // °C
  efficiency: number; // %
}