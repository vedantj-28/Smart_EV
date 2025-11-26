import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ChargingSession, Transaction, Station } from '../types';
import { mockUser, mockAdmin, mockSessions, mockTransactions, mockStations } from '../services/mockData';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isCharging: boolean;
  currentSession: ChargingSession | null;
  stations: Station[];
  transactions: Transaction[];
  sessions: ChargingSession[];
  login: (vehicleId: string, rfidId: string) => Promise<boolean>;
  logout: () => void;
  startCharging: (stationId: string) => void;
  stopCharging: () => void;
  updateWalletBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(null);
  const [stations, setStations] = useState<Station[]>(mockStations);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [sessions, setSessions] = useState<ChargingSession[]>(mockSessions);

  const login = async (vehicleId: string, rfidId: string): Promise<boolean> => {
    // Mock authentication logic
    if ((vehicleId === 'MH01AB1234' && rfidId === 'RFID123456789') || 
        (vehicleId === mockUser.vehicleId && rfidId === mockUser.rfidId)) {
      setCurrentUser(mockUser);
      return true;
    } else if ((vehicleId === 'ADMIN001' && rfidId === 'ADMIN123456789') || 
               (vehicleId === mockAdmin.vehicleId && rfidId === mockAdmin.rfidId)) {
      setCurrentUser(mockAdmin);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsCharging(false);
    setCurrentSession(null);
  };

  const startCharging = (stationId: string) => {
    if (!currentUser) return;

    const station = stations.find(s => s.id === stationId);
    if (!station) return;

    const newSession: ChargingSession = {
      id: `session-${Date.now()}`,
      userId: currentUser.id,
      vehicleId: currentUser.vehicleId,
      startTime: new Date(),
      energyConsumed: 0,
      costPerKwh: 8.00,
      totalCost: 0,
      batteryStart: 45, // Mock starting battery level
      status: 'active',
      stationId,
    };

    setCurrentSession(newSession);
    setIsCharging(true);

    // Update station status
    setStations(prev => prev.map(s => 
      s.id === stationId ? { ...s, status: 'charging' } : s
    ));
  };

  const stopCharging = () => {
    if (!currentSession || !currentUser) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - currentSession.startTime.getTime()) / 1000; // seconds
    const energyConsumed = (duration / 3600) * 22; // Mock 22kW charging rate
    const totalCost = energyConsumed * currentSession.costPerKwh;

    const completedSession: ChargingSession = {
      ...currentSession,
      endTime,
      energyConsumed,
      totalCost,
      batteryEnd: Math.min(currentSession.batteryStart! + Math.floor(energyConsumed * 2), 100),
      status: 'completed',
    };

    // Update sessions and transactions
    setSessions(prev => [...prev, completedSession]);
    setCurrentSession(null);
    setIsCharging(false);

    // Add transaction
    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser.id,
      type: 'charge',
      amount: -totalCost,
      description: `EV Charging - Session #${completedSession.id.slice(-4)}`,
      timestamp: endTime,
      sessionId: completedSession.id,
    };

    setTransactions(prev => [transaction, ...prev]);

    // Update user wallet balance
    setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance - totalCost } : null);

    // Update station status
    setStations(prev => prev.map(s => 
      s.id === completedSession.stationId ? { 
        ...s, 
        status: 'idle',
        totalEnergyDispensed: s.totalEnergyDispensed + energyConsumed,
        totalRevenue: s.totalRevenue + totalCost
      } : s
    ));
  };

  const updateWalletBalance = (amount: number) => {
    if (!currentUser) return;

    setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null);

    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser.id,
      type: 'wallet_topup',
      amount,
      description: amount > 0 ? 'Wallet Top-up via UPI' : 'Wallet Debit',
      timestamp: new Date(),
    };

    setTransactions(prev => [transaction, ...prev]);
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: `txn-${Date.now()}`,
      timestamp: new Date(),
    };

    setTransactions(prev => [transaction, ...prev]);
  };

  // Simulate real-time charging updates
  useEffect(() => {
    if (!isCharging || !currentSession) return;

    const interval = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev) return null;

        const duration = (Date.now() - prev.startTime.getTime()) / 1000; // seconds
        const energyConsumed = (duration / 3600) * 22; // 22kW charging rate
        const totalCost = energyConsumed * prev.costPerKwh;

        return {
          ...prev,
          energyConsumed,
          totalCost,
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isCharging, currentSession]);

  const value: AppContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isCharging,
    currentSession,
    stations,
    transactions: transactions.filter(t => !currentUser?.isAdmin ? t.userId === currentUser?.id : true),
    sessions: sessions.filter(s => !currentUser?.isAdmin ? s.userId === currentUser?.id : true),
    login,
    logout,
    startCharging,
    stopCharging,
    updateWalletBalance,
    addTransaction,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};