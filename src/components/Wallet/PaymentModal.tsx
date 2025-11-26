import React, { useState } from 'react';
import { 
  X, CreditCard, Smartphone, Building, QrCode, 
  CheckCircle, ArrowRight, Shield, Copy
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: (paymentDetails: PaymentResult) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  icon: React.ReactNode;
  fee: number;
  processingTime: string;
  popular?: boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  method: string;
  amount: number;
  timestamp: Date;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [currentStep, setCurrentStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    bankAccount: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      type: 'upi',
      icon: <Smartphone className="w-6 h-6" />,
      fee: 0,
      processingTime: 'Instant',
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: <CreditCard className="w-6 h-6" />,
      fee: Math.max(amount * 0.02, 2),
      processingTime: '2-3 minutes'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      type: 'netbanking',
      icon: <Building className="w-6 h-6" />,
      fee: Math.max(amount * 0.015, 5),
      processingTime: '3-5 minutes'
    }
  ];

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const totalAmount = amount + (selectedPaymentMethod?.fee || 0);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setCurrentStep('details');
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setCurrentStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        const result: PaymentResult = {
          success: true,
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          method: selectedMethod,
          amount: totalAmount,
          timestamp: new Date()
        };
        
        setCurrentStep('success');
        setTimeout(() => {
          onPaymentSuccess(result);
          onClose();
          resetModal();
        }, 2000);
      } else {
        alert('Payment failed. Please try again.');
        setCurrentStep('details');
      }
      
      setIsProcessing(false);
    }, 3000);
  };

  const resetModal = () => {
    setCurrentStep('method');
    setSelectedMethod('upi');
    setPaymentDetails({
      upiId: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
      bankAccount: ''
    });
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          onClick={() => handleMethodSelect(method.id)}
          className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-primary-600">{method.icon}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{method.name}</span>
                  {method.popular && (
                    <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Processing: {method.processingTime}</p>
              </div>
            </div>
            <div className="text-right">
              {method.fee > 0 ? (
                <p className="text-sm text-gray-600">Fee: ₹{method.fee.toFixed(2)}</p>
              ) : (
                <p className="text-sm text-success-600 font-medium">No Fee</p>
              )}
              <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Amount to add:</span>
          <span className="font-semibold">₹{amount}</span>
        </div>
        {selectedPaymentMethod?.fee && selectedPaymentMethod.fee > 0 && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-700">Processing fee:</span>
            <span className="text-gray-600">₹{selectedPaymentMethod.fee.toFixed(2)}</span>
          </div>
        )}
        <hr className="my-2" />
        <div className="flex justify-between items-center font-semibold">
          <span>Total to pay:</span>
          <span className="text-lg">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const renderUPIDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <QrCode className="w-24 h-24 mx-auto text-primary-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">UPI Payment</h3>
        <p className="text-gray-600">Scan QR code or pay to UPI ID</p>
      </div>
      
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
        <p className="text-sm text-primary-700 font-medium mb-3">
          Scan this QR code with any UPI app
        </p>
        <div className="bg-white p-4 rounded-lg inline-block border-2 border-dashed border-primary-300">
          <QrCode className="w-20 h-20 text-primary-600" />
        </div>
        <div className="mt-3 text-xs text-primary-600">
          Amount: ₹{totalAmount} | Merchant: EV Smart Charging
        </div>
      </div>
      
      <div className="text-center text-gray-500">
        <span>or</span>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-2">Pay directly to UPI ID</p>
          <div className="bg-white border border-gray-300 rounded-lg p-3 font-mono text-lg text-primary-600 font-semibold">
            vedantvjadhav@okhdfc
          </div>
          <p className="text-xs text-gray-500 mt-2">Copy this UPI ID and pay ₹{totalAmount}</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or enter your UPI ID for verification
        </label>
        <input
          type="text"
          placeholder="yourname@paytm"
          value={paymentDetails.upiId}
          onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText('vedantvjadhav@okhdfc');
            alert('UPI ID copied to clipboard!');
          }}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy UPI ID</span>
        </button>
        <button
          onClick={processPayment}
          disabled={!paymentDetails.upiId}
          className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Verify & Pay ₹{totalAmount}
        </button>
      </div>
    </div>
  );

  const renderCardDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={paymentDetails.cardHolderName}
          onChange={(e) => setPaymentDetails({...paymentDetails, cardHolderName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          value={paymentDetails.cardNumber}
          onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            value={paymentDetails.expiryDate}
            onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            type="text"
            placeholder="123"
            value={paymentDetails.cvv}
            onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Shield className="w-4 h-4" />
        <span>Your card details are secure and encrypted</span>
      </div>
      
      <button
        onClick={processPayment}
        disabled={!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardHolderName}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Pay ₹{totalAmount}
      </button>
    </div>
  );

  const renderNetBankingDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Net Banking</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Bank
        </label>
        <select
          value={paymentDetails.bankAccount}
          onChange={(e) => setPaymentDetails({...paymentDetails, bankAccount: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Choose your bank</option>
          <option value="sbi">State Bank of India</option>
          <option value="hdfc">HDFC Bank</option>
          <option value="icici">ICICI Bank</option>
          <option value="axis">Axis Bank</option>
          <option value="pnb">Punjab National Bank</option>
          <option value="kotak">Kotak Mahindra Bank</option>
        </select>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          You will be redirected to your bank's secure login page to complete the payment.
        </p>
      </div>
      
      <button
        onClick={processPayment}
        disabled={!paymentDetails.bankAccount}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue to {paymentDetails.bankAccount.toUpperCase()} Bank
      </button>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
      <p className="text-gray-600">Please don't close this window</p>
      <p className="text-sm text-gray-500 mt-4">
        Processing ₹{totalAmount} via {selectedPaymentMethod?.name}
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
      <p className="text-gray-600">₹{amount} has been added to your wallet</p>
      <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
        <p className="text-sm text-success-700">
          Transaction ID: TXN{Date.now().toString().slice(-8)}
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Money to Wallet</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentStep === 'method' && renderMethodSelection()}
          {currentStep === 'details' && selectedMethod === 'upi' && renderUPIDetails()}
          {currentStep === 'details' && selectedMethod === 'card' && renderCardDetails()}
          {currentStep === 'details' && selectedMethod === 'netbanking' && renderNetBankingDetails()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'success' && renderSuccess()}

          {currentStep === 'details' && (
            <button
              onClick={() => setCurrentStep('method')}
              className="w-full mt-4 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Payment Methods
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
