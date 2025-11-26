import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, Plus, TrendingDown, Calendar, Clock, 
  Smartphone, Gift, Target, PieChart,
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { walletService } from '../../services/walletService';
import PaymentModal from './PaymentModal';

const WalletInterface: React.FC = () => {
  const { currentUser, transactions, updateWalletBalance } = useApp();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'charge' | 'topup' | 'refund'>('all');
  const [showInsights, setShowInsights] = useState(false);
  const [quickAmounts] = useState([100, 500, 1000, 2000, 5000]);

  if (!currentUser) return null;


  const transactionCategories = walletService.categorizeTransactions(transactions);
  const spendingInsights = walletService.getSpendingInsights(transactions);

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const handleQuickTopUp = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    const { amount } = paymentDetails;
    updateWalletBalance(amount);
    
    alert(`₹${amount} added successfully to your wallet!`);
    setShowPaymentModal(false);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Balance After'],
      ...filteredTransactions.map(t => [
        t.timestamp.toLocaleDateString(),
        t.type,
        t.description,
        t.amount.toString(),
        // This would need to be calculated based on transaction order
        '0' // Placeholder
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your charging wallet and view transaction history</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium hover:bg-primary-200 transition-colors"
            >
              <PieChart className="w-4 h-4" />
              <span>Insights</span>
            </button>
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 px-4 py-2 bg-success-100 text-success-700 rounded-lg font-medium hover:bg-success-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-primary-100 text-sm">Current Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(currentUser.walletBalance)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-primary-100">
              <span>Vehicle: {currentUser.vehicleId}</span>
              <span>•</span>
              <span>RFID: {currentUser.rfidId}</span>
            </div>
          </div>
          
          <div className="text-right">
            <button
              onClick={() => {
                setSelectedAmount(500); // Default amount
                setShowPaymentModal(true);
              }}
              className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center space-x-2 mb-3"
            >
              <Plus className="w-5 h-5" />
              <span>Add Money</span>
            </button>
            <div className="text-xs text-primary-100">
              <p>Last top-up: {transactions.find(t => t.type === 'wallet_topup')?.timestamp.toLocaleDateString() || 'Never'}</p>
            </div>
          </div>
        </div>

        {/* Quick Balance Indicator */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span>Balance Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentUser.walletBalance > 500 ? 'bg-success-500/20 text-success-100' :
              currentUser.walletBalance > 100 ? 'bg-warning-500/20 text-warning-100' :
              'bg-error-500/20 text-error-100'
            }`}>
              {currentUser.walletBalance > 500 ? 'Excellent' :
               currentUser.walletBalance > 100 ? 'Good' : 'Low'}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((currentUser.walletBalance / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spending Insights */}
      {showInsights && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Spending Insights (Last 30 Days)</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="w-6 h-6 text-error-600" />
                </div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(spendingInsights.last30DaysSpent)}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">Avg. Session Cost</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(spendingInsights.avgSessionCost)}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-warning-600" />
                </div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-xl font-bold text-gray-900">{spendingInsights.sessionsCount}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ArrowUpRight className="w-6 h-6 text-success-600" />
                </div>
                <p className="text-sm text-gray-600">Highest Session</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(spendingInsights.mostExpensiveSession)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(transactionCategories.totalSpent)}</p>
              <p className="text-xs text-gray-500">{transactionCategories.charging.length} sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Added</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(transactionCategories.totalTopups)}</p>
              <p className="text-xs text-gray-500">{transactionCategories.topups.length} top-ups</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Refunds</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(transactionCategories.totalRefunds)}</p>
              <p className="text-xs text-gray-500">{transactionCategories.refunds.length} refunds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Top-up Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Add Money</h2>
            <p className="text-gray-600">Choose an amount to add to your wallet</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Smartphone className="w-4 h-4" />
            <span>UPI • Cards • Net Banking</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {quickAmounts.map((amount, index) => (
            <button
              key={amount}
              onClick={() => handleQuickTopUp(amount)}
              className={`relative p-4 border-2 rounded-xl text-center transition-all hover:border-primary-500 hover:shadow-md ${
                index === 1 ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="text-lg font-bold text-gray-900">₹{amount}</div>
              {index === 1 && (
                <div className="text-xs text-success-600 font-medium">+₹25 Bonus</div>
              )}
              {index === 2 && (
                <div className="text-xs text-success-600 font-medium">+₹75 Bonus</div>
              )}
              {index === 1 && (
                <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Gift className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Special Offers</p>
              <p className="text-blue-700">Get bonus money on top-ups of ₹500 and above!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Transactions</option>
                  <option value="charge">Charging</option>
                  <option value="wallet_topup">Top-ups</option>
                  <option value="refund">Refunds</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      transaction.type === 'charge' ? 'bg-error-100' :
                      transaction.type === 'wallet_topup' ? 'bg-success-100' :
                      'bg-warning-100'
                    }`}>
                      {transaction.type === 'charge' ? (
                        <ArrowDownRight className="w-6 h-6 text-error-600" />
                      ) : transaction.type === 'wallet_topup' ? (
                        <ArrowUpRight className="w-6 h-6 text-success-600" />
                      ) : (
                        <Gift className="w-6 h-6 text-warning-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{transaction.timestamp.toLocaleString()}</span>
                        </div>
                        {transaction.sessionId && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            Session #{transaction.sessionId.slice(-4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.amount >= 0 ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                      {transaction.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No {filterType === 'all' ? '' : filterType + ' '}transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                {filterType === 'charge' ? 'Start charging to see transactions' : 'Add money to your wallet to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletInterface;