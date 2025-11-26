import React from 'react';
import { X, Download, Mail, Zap, MapPin, Calendar, Clock, Battery, Printer } from 'lucide-react';
import { Invoice } from '../../types';
import { formatCurrency, formatEnergy } from '../../lib/utils';

interface InvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
  onDownload: () => void;
  onEmail: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose, onDownload, onEmail }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-8 space-y-8" id="invoice-content">
          {/* Company Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EV Smart Charger Pvt. Ltd.</h1>
                <p className="text-gray-600">Smart Charging Solutions</p>
                <div className="text-sm text-gray-500 mt-2 space-y-1">
                  <p>Plot No. 123, Tech Park, Mumbai - 400001</p>
                  <p>Phone: +91 98765 43210 | Email: billing@evsmartcharger.com</p>
                  <p>GST: 27ABCDE1234F1Z5 | Website: www.evsmartcharger.com</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-primary-700">INVOICE</p>
                <p className="text-xl font-bold text-primary-900">#{invoice.invoiceNumber}</p>
                <p className="text-sm text-primary-600 mt-1">
                  Date: {invoice.date.toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Billing Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle Number:</span>
                  <span className="font-medium text-gray-900">{invoice.vehicleId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-medium text-gray-900">#{invoice.sessionId.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900">{invoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-gray-900 font-mono text-xs">{invoice.transactionId}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="font-semibold text-primary-900 mb-4">Session Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="text-primary-700">Date:</span>
                  </div>
                  <span className="font-medium text-primary-900">{invoice.date.toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-primary-700">Time:</span>
                  </div>
                  <span className="font-medium text-primary-900">{invoice.date.toLocaleTimeString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-primary-600" />
                    <span className="text-primary-700">Energy:</span>
                  </div>
                  <span className="font-medium text-primary-900">
                    {formatEnergy(invoice.items.find(item => item.description.includes('Charging'))?.units || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="text-primary-700">Location:</span>
                  </div>
                  <span className="font-medium text-primary-900">Mumbai Central</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Charging Details</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Units (kWh)</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Rate (₹/kWh)</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.units.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{formatCurrency(item.rate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-primary-600">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="bg-success-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-success-700">Payment Status:</span>
                  <span className="font-medium text-success-800">✓ Paid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-success-50 rounded-lg p-6">
            <h3 className="font-semibold text-success-900 mb-4">🌱 Environmental Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">
                  {(invoice.items.reduce((sum, item) => sum + item.units, 0) * 0.82).toFixed(1)} kg
                </p>
                <p className="text-success-700">CO₂ Emissions Saved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">
                  {(invoice.items.reduce((sum, item) => sum + item.units, 0) * 3.5).toFixed(1)} L
                </p>
                <p className="text-success-700">Fuel Equivalent Saved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">100%</p>
                <p className="text-success-700">Renewable Energy Used</p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-500 space-y-2">
            <h4 className="font-semibold text-gray-700">Terms & Conditions:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Payment is non-refundable except in case of technical faults</li>
              <li>• Charging rates may vary based on time of day and demand</li>
              <li>• Maximum charging session duration is 4 hours</li>
              <li>• Station usage is subject to availability and maintenance schedules</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p className="font-medium text-primary-600">Thank you for choosing EV Smart Charger ⚡</p>
            <p className="mt-2">Driving towards a sustainable future, one charge at a time.</p>
            <p className="mt-1">For support: support@evsmartcharger.com | +91 98765 43210</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={onDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onEmail}
            className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg font-medium hover:bg-success-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Email Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;