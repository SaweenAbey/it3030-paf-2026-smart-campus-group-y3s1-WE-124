import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Users, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Filter,
  Layers,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function BookingDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resources, setResources] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to view bookings');
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const resourceRes = await resourceAPI.getAll();
      const allResources = resourceRes.data || [];
      const activeResources = allResources.filter((r) => r.status === 'ACTIVE');
      setResources(activeResources);

      try {
        const bookingsRes = await bookingAPI.getMyBookings();
        setUserBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      } catch (bookingError) {
        console.warn('Error fetching user bookings:', bookingError);
        setUserBookings([]);
      }
    } catch (error) {
      console.error('Error loading data', error);
      toast.error('Failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  const getResourceTypeLabel = (type) => {
    const labels = {
      LECTURE_HALL: 'Lecture Hall',
      LIBRARY_HALL: 'Library Hall',
      LAB: 'Laboratory',
      MEETING_ROOM: 'Meeting Room',
      EQUIPMENT: 'Equipment',
      PROJECTOR: 'Projector',
      CAMERA: 'Camera',
      OTHER: 'Other',
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getResourceTypeLabel(r.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ResourceCard = ({ resource }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500"
    >
      <div className="relative h-56 overflow-hidden">
        {resource.imageUrl ? (
          <img 
            src={resource.imageUrl} 
            alt={resource.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <Layers className="w-12 h-12 text-slate-200" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 shadow-sm">
            Active
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">
              {getResourceTypeLabel(resource.type)}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">
            {resource.name}
          </h3>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center text-sm font-bold text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 shrink-0">
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <span>Capacity: <span className="text-slate-900">{resource.capacity} People</span></span>
          </div>
          <div className="flex items-center text-sm font-bold text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 shrink-0">
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <span className="truncate">{resource.location}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/resources/${resource.id}`)}
            className="flex-1 px-4 py-4 rounded-2xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
          >
            Details
          </button>
          <button
            onClick={() => navigate(`/resources/${resource.id}#booking`)}
            className="flex-[1.5] px-4 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-sky-600 hover:shadow-sky-100 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
          >
            Book Now
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const BookingCard = ({ booking }) => {
    const statusConfig = {
      PENDING: { 
        icon: Clock, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        border: 'border-amber-100',
        label: 'Awaiting Review'
      },
      APPROVED: { 
        icon: CheckCircle2, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100',
        label: 'Confirmed'
      },
      REJECTED: { 
        icon: XCircle, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        border: 'border-rose-100',
        label: 'Declined'
      },
    };
    const config = statusConfig[booking.status] || { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', label: booking.status };
    const StatusIcon = config.icon;

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
              <Bookmark className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {booking.resourceName || 'Resource Booking'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Ref: #{booking.id.toString().slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-sky-500" /> Date
            </p>
            <p className="text-xs font-bold text-slate-900">
              {new Date(booking.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-emerald-500" /> Time
            </p>
            <p className="text-xs font-bold text-slate-900">
              {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{booking.status}</span>
          </div>
          <button 
            onClick={() => navigate(`/resources/${booking.resourceId}`)}
            className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.03),transparent_40%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest mb-6"
            >
              <Layers className="w-3 h-3" /> Campus Resource Center
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.9]"
            >
              Resource <span className="text-sky-600">Portal.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] mt-6 ml-1"
            >
              Premium facility management & reservation system for smart campus
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="SEARCH FACILITIES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-900 w-full sm:w-64 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all placeholder:text-slate-300 shadow-sm"
                />
             </div>
             <button className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: 'available', label: 'Discovery', count: resources.length },
            { id: 'my-bookings', label: 'My Reservations', count: userBookings.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200'
                  : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.label}
                <span className={`px-2 py-0.5 rounded-lg text-[8px] ${
                  activeTab === tab.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'available' ? (
            <motion.div 
              key="discovery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredResources.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                   <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                      <Layers className="w-10 h-10 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900">No Facilities Found</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Try adjusting your search query</p>
                </div>
              ) : (
                filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="reservations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {userBookings.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                   <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                      <Bookmark className="w-10 h-10 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900">No Reservations Yet</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Explore facilities to make your first booking</p>
                   <button 
                    onClick={() => setActiveTab('available')}
                    className="mt-8 px-10 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-sky-600 transition-all"
                   >
                     Browse Facilities
                   </button>
                </div>
              ) : (
                userBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}