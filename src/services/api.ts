// API Service - Frontend to Backend communication
import { chargingService, ChargingStatus } from './chargingService';

export const API_BASE = "http://10.23.104.60:5000/api";  // Raspberry Pi backend API

// For demo purposes, we'll use the local chargingService
// In production, these would make actual HTTP requests to your backend

// Fetch current charging status (updates dashboard + UI)
export async function getStatus(): Promise<ChargingStatus> {
  try {
    // Try to fetch from actual backend first
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    // Fallback to local service for demo
    console.log('Backend not available, using local service');
  }
  
  // Use local charging service as fallback
  return chargingService.getChargingStatus();
}

// Start charging session (turn relay ON)
export async function startCharging(userId: string = 'demo-user', stationId: string = 'station-1') {
  try {
    // Try to use actual backend first
    const res = await fetch(`${API_BASE}/charging/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, stationId })
    });
    
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    // Fallback to local service for demo
    console.log('Backend not available, using local service');
  }
  
  // Use local charging service as fallback
  const session = await chargingService.startCharging(userId, stationId);
  return { success: true, session };
}

// Stop charging session (turn relay OFF + generate invoice)
export async function stopCharging() {
  try {
    // Try to use actual backend first
    const res = await fetch(`${API_BASE}/charging/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    // Fallback to local service for demo
    console.log('Backend not available, using local service');
  }
  
  // Use local charging service as fallback
  const result = await chargingService.stopCharging();
  return { success: true, ...result };
}

// Additional API functions for the EV charging system

// Get all charging stations
export async function getStations() {
  try {
    const res = await fetch(`${API_BASE}/stations`);
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    console.log('Backend not available, using local service');
  }
  
  return { stations: chargingService.getChargingStations() };
}

// Get station by ID
export async function getStation(stationId: string) {
  try {
    const res = await fetch(`${API_BASE}/stations/${stationId}`);
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    console.log('Backend not available, using local service');
  }
  
  const station = chargingService.getStationById(stationId);
  return { station };
}

// Get charging history for user
export async function getChargingHistory(userId: string) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/history`);
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    console.log('Backend not available, using local service');
  }
  
  const history = chargingService.getChargingHistory(userId);
  return { history };
}

// Update user wallet balance
export async function updateWalletBalance(userId: string, amount: number) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    
    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    console.log('Backend not available, using local service');
  }
  
  // For demo, we'll just return success
  return { success: true, newBalance: amount };
}