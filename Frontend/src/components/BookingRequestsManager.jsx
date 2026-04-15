import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function BookingRequestsManager() {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('PENDING');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAllBookings();
      setBookingRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast.error('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await bookingAPI.approveBooking(bookingId);
      toast.success('Booking approved!');
      await fetchBookingRequests();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await bookingAPI.rejectBooking(showRejectModal, rejectReason);
      toast.success('Booking rejected!');
      setShowRejectModal(null);
      setRejectReason('');
      await fetchBookingRequests();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  const filteredRequests = activeFilter === 'ALL'
    ? bookingRequests
    : bookingRequests.filter(req => req.status === activeFilter);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
      APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="h-12 w-12 animate-spin text-sky-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 text-lg">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b-2 border-slate-300">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => {
          const count = bookingRequests.filter(b => status === 'ALL' ? true : b.status === status).length;
          const statusIcons = { 
            PENDING: <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
            APPROVED: <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>, 
            REJECTED: <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>, 
            ALL: <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          };
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                isActive ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-700 border-2 border-slate-300 hover:border-sky-400 hover:bg-sky-50'
              }`}
            >
              {statusIcons[status]} {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <div className="mb-4 flex justify-center">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Booking Requests</h3>
          <p className="text-slate-600">
            There are no {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} booking requests to display
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-md">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Resource</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Purpose</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr
                  key={request.id}
                  className={`border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">{request.resourceId}</td>
                  <td className="px-6 py-4 text-slate-700">{request.userId}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm">
                    {new Date(request.startTime).toLocaleDateString()} {new Date(request.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-sm">
                    {Math.round((new Date(request.endTime) - new Date(request.startTime)) / (1000 * 60))} min
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-sm max-w-xs truncate" title={request.purpose}>
                    {request.purpose}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleApprove(request.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Approve
                        </button>
                        <button onClick={() => setShowRejectModal(request.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors duration-200 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                    {request.status === 'REJECTED' && (
                      <div className="text-xs text-red-700 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {request.rejectionReason}
                      </div>
                    )}
                    {request.status === 'APPROVED' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Approved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b-2 border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Reject Booking Request</h2>
              <button onClick={() => setShowRejectModal(null)} className="text-2xl text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-colors duration-200 resize-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this booking request is being rejected..."
                rows="4"
              />
            </div>
            <div className="px-6 py-4 border-t-2 border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(null)} className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors duration-200">
                Cancel
              </button>
              <button onClick={handleReject} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
