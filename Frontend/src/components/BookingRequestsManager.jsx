import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LayoutGrid, 
  User, 
  Calendar, 
  Timer, 
  FileText,
  Filter,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-sky-600 animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-50/50 rounded-2xl w-fit border border-slate-100">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => {
          const count = bookingRequests.filter(b => status === 'ALL' ? true : b.status === status).length;
          const isActive = activeFilter === status;
          
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                isActive 
                  ? 'bg-white text-sky-600 shadow-sm border border-sky-100' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <span>{status}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-sky-50 text-sky-600' : 'bg-slate-200/50 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-200/60">
          <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl shadow-slate-100 flex items-center justify-center mb-6 group hover:scale-110 transition-transform duration-500">
            <LayoutGrid className="w-8 h-8 text-slate-200 group-hover:text-sky-300 transition-colors" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Queue is Empty</h3>
          <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">No {activeFilter.toLowerCase()} requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-50">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Facility ID</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">User Details</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Schedule</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Status</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LayoutGrid className="w-5 h-5 text-sky-600" />
                      </div>
                      <span className="font-black text-slate-900 tracking-tight">RES-{request.resourceId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-slate-900 font-bold tracking-tight text-sm">
                         <User className="w-3.5 h-3.5 text-indigo-500" />
                         <span>USR-{request.userId}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest truncate max-w-[140px]" title={request.purpose}>
                         <FileText className="w-3 h-3" />
                         {request.purpose || 'Academic Usage'}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-900 font-black text-xs tracking-tight">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        {new Date(request.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(request.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <ChevronRight className="w-2 h-2" />
                        {Math.round((new Date(request.endTime) - new Date(request.startTime)) / (1000 * 60))} min
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${
                      request.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      request.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        request.status === 'PENDING' ? 'bg-amber-500' :
                        request.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                      } ${request.status === 'PENDING' ? 'animate-pulse' : ''}`}></div>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    {request.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(request.id)} 
                          className="h-10 px-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 transition-all flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button 
                          onClick={() => setShowRejectModal(request.id)} 
                          className="h-10 px-4 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                          request.status === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {request.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {request.status === 'APPROVED' ? 'Authorized' : 'Denied'}
                        </span>
                        {request.status === 'REJECTED' && request.rejectionReason && (
                          <span className="text-[9px] font-bold text-slate-400 italic max-w-[120px] truncate" title={request.rejectionReason}>
                             "{request.rejectionReason}"
                          </span>
                        )}
                      </div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowRejectModal(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
               <div className="flex items-center gap-2 mb-2">
                 <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Decision Required</p>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reject Request</h3>
               <p className="text-slate-500 text-sm font-medium mt-1">Specify why this request cannot be fulfilled.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <FileText className="w-3 h-3 text-rose-500" />
                   Official Reason *
                </label>
                <textarea
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-8 focus:ring-rose-50 transition-all duration-300 text-sm font-bold placeholder:text-slate-300 resize-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Facility scheduled for emergency maintenance during this slot..."
                  rows="4"
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
              <button 
                onClick={() => setShowRejectModal(null)} 
                className="flex-1 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject} 
                className="flex-[2] h-14 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-100 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
