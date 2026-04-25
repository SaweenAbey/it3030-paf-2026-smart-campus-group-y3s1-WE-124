import { useEffect, useState, useMemo } from 'react';
import { getAllBookings, approveBooking, rejectBooking, cancelBooking } from '../api/bookingApi';
import BookingCard from '../components/BookingCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  RefreshCcw, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      setBookings(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load system bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this reservation?')) return;
    try {
      await approveBooking(id);
      toast.success('Reservation approved');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (required):');
    if (reason && reason.trim()) {
      try {
        await rejectBooking(id, reason);
        toast.success('Reservation rejected');
        fetchAll();
      } catch (e) {
        toast.error(e.response?.data?.error || 'Failed to reject');
      }
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this approved reservation? This will free up the time slot.')) return;
    try {
      await cancelBooking(id);
      toast.success('Reservation cancelled');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to cancel');
    }
  };

  const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  
  const stats = useMemo(() => {
    return {
      PENDING: bookings.filter(b => b.status === 'PENDING').length,
      APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
      REJECTED: bookings.filter(b => b.status === 'REJECTED').length,
      CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
      TOTAL: bookings.length
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchesFilter = filter === 'ALL' || b.status === filter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = (b.purpose || '').toLowerCase().includes(q) || 
                           (b.userId || '').toLowerCase().includes(q) ||
                           (b.resourceId || '').toString().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fbfcfd] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Console</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Bookings</h1>
              <p className="text-slate-400 text-sm font-medium">Monitor and regulate campus resource utilization</p>
            </div>
            <button 
              onClick={fetchAll}
              className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl shadow-slate-200 group active:scale-95"
            >
              <RefreshCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
              Sync Database
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: stats.PENDING, icon: Clock, color: 'amber' },
            { label: 'Confirmed', value: stats.APPROVED, icon: CheckCircle2, color: 'emerald' },
            { label: 'Declined', value: stats.REJECTED, icon: XCircle, color: 'rose' },
            { label: 'Total Logs', value: stats.TOTAL, icon: Calendar, color: 'slate' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-all">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by User ID, Purpose, or Resource ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                      filter === f 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {f} <span className={`ml-1.5 opacity-50`}>({f === 'ALL' ? stats.TOTAL : stats[f]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="p-6 md:p-8 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Consulting Database...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <Filter className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900">No matching logs</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-xs font-medium uppercase tracking-tight">Zero results found for the current query.</p>
                <button 
                  onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
                  className="mt-8 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filtered.map((b, idx) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      layout
                    >
                      <BookingCard 
                        booking={b}
                        showActions={true}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onCancel={handleCancel}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

