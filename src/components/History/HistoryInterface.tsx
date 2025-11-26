import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, Download, Mail, Calendar, Zap, Clock, MapPin, 
  Filter, Search, TrendingUp, Battery, DollarSign, 
  ChevronDown, ChevronUp, Star, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatEnergy, formatDuration } from '../../lib/utils';
import { invoiceService } from '../../services/invoiceService';
import InvoiceModal from '../Invoice/InvoiceModal';
import { Invoice } from '../../types';

const HistoryInterface: React.FC = () => {
  const { currentUser, sessions, stations } = useApp();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'energy' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'stopped'>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  if (!currentUser) return null;

  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'stopped');

  // Filter and search sessions
  const filteredSessions = completedSessions.filter(session => {
    const matchesSearch = session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'date':
        aValue = a.startTime.getTime();
        bValue = b.startTime.getTime();
        break;
      case 'cost':
        aValue = a.totalCost;
        bValue = b.totalCost;
        break;
      case 'energy':
        aValue = a.energyConsumed;
        bValue = b.energyConsumed;
        break;
      case 'duration':
        aValue = a.endTime ? (a.endTime.getTime() - a.startTime.getTime()) : 0;
        bValue = b.endTime ? (b.endTime.getTime() - b.startTime.getTime()) : 0;
        break;
      default:
        aValue = a.startTime.getTime();
        bValue = b.startTime.getTime();
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleDownloadInvoice = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const invoice = invoiceService.generateInvoice(session, currentUser);
    invoiceService.downloadInvoicePDF(invoice, currentUser);
  };

  const handleEmailInvoice = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const invoice = invoiceService.generateInvoice(session, currentUser);
    const success = await invoiceService.emailInvoice(invoice, currentUser);
    
    if (success) {
      alert(`Invoice emailed to ${currentUser.email} successfully!`);
    } else {
      alert('Failed to send email. Please try again.');
    }
  };

  const handleViewInvoice = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const invoice = invoiceService.generateInvoice(session, currentUser);
    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const getSessionRating = (session: any) => {
    const duration = session.endTime ? (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0;
    const efficiency = session.energyConsumed / (duration / 3600); // kWh per hour
    
    if (efficiency > 20) return 5;
    if (efficiency > 15) return 4;
    if (efficiency > 10) return 3;
    if (efficiency > 5) return 2;
    return 1;
  };

  const totalStats = {
    sessions: completedSessions.length,
    totalEnergy: completedSessions.reduce((sum, s) => sum + s.energyConsumed, 0),
    totalCost: completedSessions.reduce((sum, s) => sum + s.totalCost, 0),
    avgDuration: completedSessions.length > 0 ? 
      completedSessions.reduce((sum, s) => {
        const duration = s.endTime ? (s.endTime.getTime() - s.startTime.getTime()) / 1000 : 0;
        return sum + duration;
      }, 0) / completedSessions.length : 0,
    avgCost: completedSessions.length > 0 ? 
      completedSessions.reduce((sum, s) => sum + s.totalCost, 0) / completedSessions.length : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Charging History</h1>
        <p className="text-gray-600 mt-2">View your past charging sessions, analytics, and download invoices</p>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.sessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <Battery className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Energy</p>
              <p className="text-2xl font-bold text-gray-900">{formatEnergy(totalStats.totalEnergy)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalCost)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(totalStats.avgDuration)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Cost</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.avgCost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="cost">Cost</option>
              <option value="energy">Energy</option>
              <option value="duration">Duration</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Charging Sessions ({sortedSessions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => {
              const duration = session.endTime ? 
                (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0;
              const station = stations.find(s => s.id === session.stationId);
              const rating = getSessionRating(session);
              const isExpanded = expandedSession === session.id;

              return (
                <div key={session.id} className="hover:bg-gray-50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          session.status === 'completed' ? 'bg-success-100' : 'bg-warning-100'
                        }`}>
                          <Zap className={`w-6 h-6 ${
                            session.status === 'completed' ? 'text-success-600' : 'text-warning-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">Session #{session.id.slice(-6)}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{session.startTime.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{session.startTime.toLocaleTimeString()}</span>
                            </div>
                            {station && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{station.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(session.totalCost)}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Energy</p>
                        <p className="font-semibold text-gray-900">{formatEnergy(session.energyConsumed)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="font-semibold text-gray-900">{formatDuration(duration)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Battery Gain</p>
                        <p className="font-semibold text-gray-900">
                          +{((session.batteryEnd || 0) - (session.batteryStart || 0))}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Efficiency</p>
                        <p className="font-semibold text-gray-900">
                          {(session.energyConsumed / (duration / 3600)).toFixed(1)} kW
                        </p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h5 className="font-semibold text-gray-900">Session Details</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Start Time:</span>
                                <span className="font-medium">{session.startTime.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">End Time:</span>
                                <span className="font-medium">{session.endTime?.toLocaleString() || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Station:</span>
                                <span className="font-medium">{station?.name || 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Power Output:</span>
                                <span className="font-medium">{station?.powerOutput || 0} kW</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="font-semibold text-gray-900">Billing Breakdown</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Energy Cost:</span>
                                <span className="font-medium">{formatCurrency(session.totalCost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rate per kWh:</span>
                                <span className="font-medium">{formatCurrency(session.costPerKwh)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">GST (18%):</span>
                                <span className="font-medium">{formatCurrency(session.totalCost * 0.18)}</span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 pt-2">
                                <span className="font-semibold text-gray-900">Total with Tax:</span>
                                <span className="font-bold text-primary-600">{formatCurrency(session.totalCost * 1.18)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Battery Progress Visualization */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-semibold text-gray-900 mb-3">Battery Progress</h5>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Start: {session.batteryStart}%</span>
                                <span>End: {session.batteryEnd}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-error-400 via-warning-400 to-success-400 h-3 rounded-full"
                                  style={{ width: `${session.batteryEnd}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-success-600">
                                +{((session.batteryEnd || 0) - (session.batteryStart || 0))}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => handleViewInvoice(session.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Invoice</span>
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(session.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleEmailInvoice(session.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg font-medium hover:bg-success-700 transition-colors text-sm"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' ? 'No sessions match your filters' : 'No charging sessions yet'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Start your first charging session to see history here'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && currentInvoice && (
        <InvoiceModal
          invoice={currentInvoice}
          onClose={() => setShowInvoiceModal(false)}
          onDownload={() => {
            invoiceService.downloadInvoicePDF(currentInvoice, currentUser);
            setShowInvoiceModal(false);
          }}
          onEmail={async () => {
            const success = await invoiceService.emailInvoice(currentInvoice, currentUser);
            if (success) {
              alert(`Invoice emailed to ${currentUser.email} successfully!`);
            } else {
              alert('Failed to send email. Please try again.');
            }
            setShowInvoiceModal(false);
          }}
        />
      )}
    </div>
  );
};

export default HistoryInterface;