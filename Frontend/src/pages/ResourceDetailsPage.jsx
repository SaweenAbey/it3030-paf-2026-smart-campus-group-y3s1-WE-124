import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBookingReceipt } from '../utils/receiptGenerator';
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Shield,
  Zap,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Heart,
  Share2,
  Lock,
  ChevronLeft,
  Download,
  PartyPopper
} from 'lucide-react';

const RESOURCE_FEATURES = {
  LECTURE_HALL: [
    { id: 'projector', label: '4K Projection', icon: '📽️' },
    { id: 'mic', label: 'Audio System', icon: '🎙️' },
    { id: 'whiteboard', label: 'Glass Board', icon: '🖍️' },
    { id: 'ac', label: 'Climate Control', icon: '❄️' },
  ],
  LAB: [
    { id: 'safety-kit', label: 'Safety Station', icon: '🆘' },
    { id: 'equipment-setup', label: 'Pro Stations', icon: '🔬' },
    { id: 'ventilation', label: 'Fume Hoods', icon: '🌬️' },
  ],
  MEETING_ROOM: [
    { id: 'video-conference', label: 'HD VC Hub', icon: '📹' },
    { id: 'wifi', label: 'Gigabit WiFi', icon: '📶' },
    { id: 'smart-tv', label: 'Smart Display', icon: '📺' },
  ],
  LIBRARY_HALL: [
    { id: 'projector', label: 'Presentation Kit', icon: '📽️' },
    { id: 'quiet-zone', label: 'Quiet Zone', icon: '🤫' },
  ],
};

const GENERATE_SLOTS = (durationMinutes = 30) => {
  const slots = [];
  const startHour = 8;
  const endHour = 20;

  let current = new Date();
  current.setHours(startHour, 0, 0, 0);

  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5);
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + durationMinutes);
  }
  return slots;
};

export default function ResourceDetailsPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 12);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to view details');
      navigate('/login');
      return;
    }
    fetchResourceDetails();
    fetchUserBookingForResource();
  }, [resourceId, isAuthenticated, navigate]);

  useEffect(() => {
    if (resource) {
      fetchBookingsForDate(bookingForm.date);
    }
  }, [bookingForm.date, resource]);

  const fetchResourceDetails = async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getById(resourceId);
      setResource(res.data);
    } catch (error) {
      console.error('Error loading resource', error);
      toast.error('Failed to load resource');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookingForResource = async () => {
    try {
      const res = await bookingAPI.getMyBookings();
      const myBookings = res.data || [];
      const match = myBookings.find(b => 
        b.resourceId === resourceId && b.status === 'APPROVED'
      );
      setExistingBooking(match);
    } catch (error) {
      console.warn('Failed to fetch user bookings for receipt check', error);
    }
  };

  const fetchBookingsForDate = async (date) => {
    try {
      const res = await bookingAPI.getApprovedByResource(resourceId);
      const allBookings = res.data || [];
      // Filter bookings for the selected date
      const dayBookings = allBookings.filter(b => b.startTime.startsWith(date));
      setBookedSlots(dayBookings);
    } catch (error) {
      console.warn('Failed to fetch bookings for slots', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      icon: isLiked ? '💔' : '❤️',
      style: { borderRadius: '20px', background: '#333', color: '#fff' }
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!', {
      style: { borderRadius: '20px', background: '#333', color: '#fff' }
    });
  };

  const getRealFeatures = () => {
    if (!resource) return [];

    // If resource has specific features from backend, use them
    if (resource.features && resource.features.length > 0) {
      return resource.features.map(f => ({
        id: f,
        label: f.replace(/_/g, ' '),
        icon: '🔹'
      }));
    }

    // Fallback to type-based defaults if no specific features are set
    return RESOURCE_FEATURES[resource.type] || [];
  };

  const availableFeatures = getRealFeatures();

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const isSlotBooked = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotDateTime = new Date(bookingForm.date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Check if slot is in the past
    if (slotDateTime < now) return true;

    return bookedSlots.some(b => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      return slotDateTime >= start && slotDateTime < end;
    });
  };

  const handleSlotClick = (time) => {
    if (isSlotBooked(time)) return;

    if (selectedSlots.length === 0) {
      setSelectedSlots([time]);
    } else if (selectedSlots.length === 1) {
      const start = selectedSlots[0];
      const end = time;

      if (start === end) {
        setSelectedSlots([]);
        return;
      }

      // Generate range
      const allSlots = GENERATE_SLOTS(resource?.availabilityDurationMinutes || 30);
      const startIndex = allSlots.indexOf(start);
      const endIndex = allSlots.indexOf(end);

      const range = allSlots.slice(
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex) + 1
      );

      // Check if any slot in range is booked
      const hasBooked = range.some(s => isSlotBooked(s));
      if (hasBooked) {
        toast.error('Range contains already booked slots');
        setSelectedSlots([time]);
        return;
      }

      setSelectedSlots(range);
    } else {
      // If already a range, start fresh with new selection
      setSelectedSlots([time]);
    }
  };

  // Auto-fill startTime and endTime based on selected slots
  useEffect(() => {
    if (selectedSlots.length > 0) {
      const sorted = [...selectedSlots].sort((a, b) => {
        const [ha, ma] = a.split(':').map(Number);
        const [hb, mb] = b.split(':').map(Number);
        return (ha * 60 + ma) - (hb * 60 + mb);
      });

      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      // End time calculation based on resource duration
      const duration = resource?.availabilityDurationMinutes || 30;
      const [h, m] = last.split(':').map(Number);
      const totalMinutes = h * 60 + m + duration;
      const endH = Math.floor(totalMinutes / 60);
      const endM = totalMinutes % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      setBookingForm(prev => ({
        ...prev,
        startTime: `${bookingForm.date}T${first}`,
        endTime: `${bookingForm.date}T${endTime}`
      }));
    } else {
      setBookingForm(prev => ({ ...prev, startTime: '', endTime: '' }));
    }
  }, [selectedSlots, bookingForm.date]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    const now = new Date();
    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);

    if (!bookingForm.startTime || !bookingForm.endTime || !bookingForm.purpose) {
      toast.error('Please select time slots and fill required fields');
      return;
    }

    if (start < now) {
      toast.error('Start time cannot be in the past');
      return;
    }

    if (end <= start) {
      toast.error('End time must be after the start time');
      return;
    }

    // Minimum booking duration check (e.g., 15 minutes)
    const durationMs = end - start;
    const durationMins = durationMs / (1000 * 60);
    if (durationMins < 15) {
      toast.error('Minimum booking duration is 15 minutes');
      return;
    }

    if (bookingForm.expectedAttendees && parseInt(bookingForm.expectedAttendees) > resource.capacity) {
      toast.error(`Capacity exceeded. Maximum allowed: ${resource.capacity}`);
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        resourceId: resource.id.toString(),
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose: bookingForm.purpose,
        expectedAttendees: bookingForm.expectedAttendees ? parseInt(bookingForm.expectedAttendees) : 1,
      };

      const response = await bookingAPI.createBooking(payload);
      setLastBooking(response.data);
      setShowSuccess(true);
      toast.success('Request submitted for approval');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book');
    } finally {
      setBookingLoading(false);
    }
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

  if (!resource) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 lg:p-12 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400" />
              
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <PartyPopper className="w-10 h-10 text-emerald-500" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Booking Requested!</h2>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10 max-w-xs mx-auto uppercase tracking-widest">
                Your reservation for <span className="text-sky-600">{resource.name}</span> has been logged and is pending approval.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => generateBookingReceipt(lastBooking || bookingForm, resource, user)}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="w-full py-5 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  Return to Bookings
                </button>
              </div>

              <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Verification ID: {lastBooking?.id || 'PENDING'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 pt-12 lg:pt-16">

        {/* Back navigation */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to catalogue
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-900 group"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
            </button>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border group ${isLiked ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-slate-100 text-slate-400 hover:text-rose-500'
                }`}
            >
              <Heart className={`w-4 h-4 transition-transform group-active:scale-150 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{likeCount} Likes</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Content Side */}
          <div className="lg:col-span-7 space-y-10">

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {resource.type?.replace(/_/g, ' ')}
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                  resource.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : resource.status === 'OUT_OF_STOCK'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    resource.status === 'ACTIVE' ? 'bg-emerald-500' : resource.status === 'OUT_OF_STOCK' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {resource.status === 'ACTIVE' ? 'Live Now' : resource.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {resource.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{resource.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-300" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{resource.capacity} CAPACITY</span>
                </div>
              </div>

              {existingBooking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Reservation</p>
                      <h4 className="text-sm font-black text-slate-900">You have a confirmed booking for this resource.</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => generateBookingReceipt(existingBooking, resource, user)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Receipt
                  </button>
                </motion.div>
              )}
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-100 shadow-2xl group">
              {resource.imageUrl ? (
                <img
                  src={resource.imageUrl}
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[5s]"
                />
              ) : (
                <div className="aspect-[16/9] w-full flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-200">
                  <Layers className="w-16 h-16" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No preview available</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-sky-500" /> Overview
                </h3>
                <p className="text-slate-500 text-[13px] leading-relaxed font-bold">
                  {resource.description || "No detailed description provided for this campus facility."}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Infrastructure
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableFeatures.length > 0 ? availableFeatures.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all cursor-default group">
                      <span className="text-sm group-hover:scale-125 transition-transform">{f.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{f.label}</span>
                    </div>
                  )) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Standard equipment included</span>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-12">
              <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Reserve Space</h2>
                      <p className="text-slate-400 text-[9px] font-black mt-1 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Select available slots
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="px-3 py-1 bg-sky-50 rounded-lg">
                        <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">{selectedSlots.length} Selected</span>
                      </div>
                      {selectedSlots.length > 0 && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                          {bookingForm.startTime.split('T')[1]} - {bookingForm.endTime.split('T')[1]}
                        </span>
                      )}
                    </div>
                  </div>

                  {resource.status === 'ACTIVE' ? (
                    <form onSubmit={handleSubmitBooking} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Choose Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            name="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={bookingForm.date}
                            onChange={handleBookingChange}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 text-xs font-black focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Timeline Availability</label>
                          <div className="flex gap-3">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-slate-100" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Free</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-sky-500" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Selected</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-slate-200" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Booked</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 h-64 overflow-y-auto pr-2 scrollbar-hide border-y border-slate-50 py-4">
                          {GENERATE_SLOTS(resource?.availabilityDurationMinutes || 30).map((time) => {
                            const isBooked = isSlotBooked(time);
                            const isSelected = selectedSlots.includes(time);
                            return (
                              <button
                                key={time}
                                type="button"
                                disabled={isBooked}
                                onClick={() => handleSlotClick(time)}
                                className={`py-3 rounded-xl text-[9px] font-black transition-all border flex flex-col items-center justify-center gap-1 ${isBooked
                                    ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed opacity-50'
                                    : isSelected
                                      ? 'bg-sky-500 text-white border-sky-600 shadow-lg shadow-sky-100'
                                      : 'bg-white text-slate-500 border-slate-100 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/30'
                                  }`}
                              >
                                {isBooked ? <Lock className="w-3 h-3" /> : time}
                                {isSelected && !isBooked && <CheckCircle2 className="w-2.5 h-2.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="group space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Purpose</label>
                          <textarea
                            name="purpose"
                            value={bookingForm.purpose}
                            onChange={handleBookingChange}
                            rows="2"
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 text-[11px] font-bold focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all outline-none resize-none"
                            placeholder="Briefly describe the university activity..."
                            required
                          />
                        </div>

                        <div className="group space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Expected Size</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="expectedAttendees"
                              max={resource.capacity}
                              value={bookingForm.expectedAttendees}
                              onChange={handleBookingChange}
                              className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-900 text-sm font-black focus:bg-white focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all outline-none"
                              placeholder={`Max ${resource.capacity}`}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading || selectedSlots.length === 0}
                        className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:shadow-2xl hover:bg-sky-600 hover:shadow-sky-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                      >
                        {bookingLoading ? (
                          <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Confirm Reservation</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Shield className="w-3 h-3 text-sky-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Secured Campus Registry</span>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center space-y-6 py-8">
                      <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto">
                        <Zap className="w-8 h-8 text-rose-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900">
                          {resource.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Currently Offline'}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                          {resource.status === 'OUT_OF_STOCK' ? 'Inventory depleted' : 'Maintenance Mode Active'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/bookings')}
                        className="w-full py-4 border border-slate-100 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest"
                      >
                        Find Alternate Space
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}