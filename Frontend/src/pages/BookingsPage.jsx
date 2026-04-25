import { useEffect, useState, useMemo } from 'react';
import { getMyBookings, cancelBooking, updateBooking } from '../api/bookingApi';
import BookingCard from '../components/BookingCard';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Plus, 
  ArrowLeft, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  MoreVertical,
  ChevronRight,
  Info,
  MapPin,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('user123'); // Default for demo, should be from auth
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings(userId);
      setBookings(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleEditOpen = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      startTime: booking.startTime.slice(0, 16),
      endTime: booking.endTime.slice(0, 16),
      purpose: booking.purpose,
      expectedAttendees: booking.expectedAttendees || ''
    });
  };

  const handleEditSave = async () => {
    setEditSubmitting(true);
    try {
      await updateBooking(editingBooking.id, {
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        purpose: editForm.purpose,
        expectedAttendees: editForm.expectedAttendees
          ? parseInt(editForm.expectedAttendees) : null
      });
      toast.success('Booking updated successfully!');
      setEditingBooking(null);
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update booking');
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesFilter = filter === 'ALL' || b.status === filter;
      const matchesSearch = b.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.resourceId?.toString().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      approved: bookings.filter(b => b.status === 'APPROVED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="max-w-7xl mx-auto px-6 pt-16 relative">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">My Reservations</h1>
              <p className="text-slate-400 text-sm mt-2 font-medium">Manage and track your campus resource bookings</p>
            </div>
            <Link to="/bookings/new">
              <button className="px-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-400 hover:text-white transition-all shadow-xl flex items-center gap-2 group">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                New Reservation
              </button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Calendar, color: 'slate' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
            { label: 'Confirmed', value: stats.approved, icon: CheckCircle2, color: 'emerald' },
            { label: 'Others', value: stats.cancelled, icon: AlertCircle, color: 'rose' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{s.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
          {/* Controls */}
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search purpose or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading your history...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900">No Reservations Found</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">We couldn't find any bookings matching your current filters.</p>
                <Link to="/bookings/new" className="mt-8">
                  <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl">
                    Create New Booking
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredBookings.map((b, idx) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <BookingCard 
                        booking={b}
                        onCancel={handleCancel}
                        onEdit={handleEditOpen} 
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="px-3 py-1 bg-sky-50 text-sky-600 text-[9px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
                      Reservation Editor
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">Update Booking #{editingBooking.id}</h2>
                  </div>
                  <button 
                    onClick={() => setEditingBooking(null)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      value={editForm.startTime}
                      onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      value={editForm.endTime}
                      onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Activity Purpose</label>
                    <textarea 
                      rows={3} 
                      value={editForm.purpose}
                      onChange={e => setEditForm({ ...editForm, purpose: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Expected Attendees</label>
                    <input 
                      type="number" 
                      value={editForm.expectedAttendees}
                      onChange={e => setEditForm({ ...editForm, expectedAttendees: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 py-5 border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleEditSave}
                    disabled={editSubmitting}
                    className="flex-[2] py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-sky-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
