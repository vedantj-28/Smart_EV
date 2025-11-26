import { Transaction, User } from '../types';

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'netbanking';
  name: string;
  icon: string;
  isDefault: boolean;
}

export interface TopUpOption {
  amount: number;
  bonus: number;
  popular?: boolean;
}

export class WalletService {
  private static instance: WalletService;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  getTopUpOptions(): TopUpOption[] {
    return [
      { amount: 100, bonus: 0 },
      { amount: 500, bonus: 25, popular: true },
      { amount: 1000, bonus: 75 },
      { amount: 2000, bonus: 200 },
      { amount: 5000, bonus: 750 },
    ];
  }

  getPaymentMethods(): PaymentMethod[] {
    return [
      { id: 'upi', type: 'upi', name: 'UPI Payment', icon: '📱', isDefault: true },
      { id: 'card', type: 'card', name: 'Credit/Debit Card', icon: '💳', isDefault: false },
      { id: 'netbanking', type: 'netbanking', name: 'Net Banking', icon: '🏦', isDefault: false },
    ];
  }

  validateTopUpAmount(amount: number): { valid: boolean; message?: string } {
    if (amount < 50) {
      return { valid: false, message: 'Minimum top-up amount is ₹50' };
    }
    if (amount > 10000) {
      return { valid: false, message: 'Maximum top-up amount is ₹10,000' };
    }
    return { valid: true };
  }

  calculateTransactionFee(amount: number, paymentMethod: string): number {
    switch (paymentMethod) {
      case 'upi':
        return 0; // No fee for UPI
      case 'card':
        return Math.max(amount * 0.02, 2); // 2% or min ₹2
      case 'netbanking':
        return Math.max(amount * 0.015, 5); // 1.5% or min ₹5
      default:
        return 0;
    }
  }

  processTopUp(amount: number, paymentMethod: string, user: User): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    return new Promise((resolve) => {
      // Simulate payment processing delay
      setTimeout(() => {
        const fee = this.calculateTransactionFee(amount, paymentMethod);
        const netAmount = amount - fee;

        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          });
        } else {
          resolve({
            success: false,
            error: 'Payment failed. Please try again.',
          });
        }
      }, 2000);
    });
  }

  generateTransactionReference(): string {
    return `REF${Date.now().toString(36).toUpperCase()}`;
  }

  categorizeTransactions(transactions: Transaction[]) {
    const categories = {
      charging: transactions.filter(t => t.type === 'charge'),
      topups: transactions.filter(t => t.type === 'wallet_topup'),
      refunds: transactions.filter(t => t.type === 'refund'),
    };

    return {
      ...categories,
      totalSpent: Math.abs(categories.charging.reduce((sum, t) => sum + t.amount, 0)),
      totalTopups: categories.topups.reduce((sum, t) => sum + t.amount, 0),
      totalRefunds: categories.refunds.reduce((sum, t) => sum + t.amount, 0),
    };
  }

  getSpendingInsights(transactions: Transaction[]) {
    const last30Days = transactions.filter(t => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return t.timestamp >= thirtyDaysAgo;
    });

    const chargingTransactions = last30Days.filter(t => t.type === 'charge');
    const avgSessionCost = chargingTransactions.length > 0 ? 
      Math.abs(chargingTransactions.reduce((sum, t) => sum + t.amount, 0)) / chargingTransactions.length : 0;

    return {
      last30DaysSpent: Math.abs(chargingTransactions.reduce((sum, t) => sum + t.amount, 0)),
      sessionsCount: chargingTransactions.length,
      avgSessionCost,
      mostExpensiveSession: Math.max(...chargingTransactions.map(t => Math.abs(t.amount)), 0),
    };
  }
}

export const walletService = WalletService.getInstance();