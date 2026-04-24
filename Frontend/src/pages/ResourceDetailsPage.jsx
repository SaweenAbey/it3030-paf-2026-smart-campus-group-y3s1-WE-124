import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
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
  Share2
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

export default function ResourceDetailsPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to view details');
      navigate('/login');
      return;
    }
    fetchResourceDetails();
  }, [resourceId, isAuthenticated, navigate]);

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

  const availableFeatures = resource ? RESOURCE_FEATURES[resource.type] || [] : [];

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.startTime || !bookingForm.endTime || !bookingForm.purpose) {
      toast.error('Please fill in all fields');
      return;
    }

    if (new Date(bookingForm.endTime) <= new Date(bookingForm.startTime)) {
      toast.error('End time must be after start time');
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

      await bookingAPI.createBooking(payload);
      toast.success('Request submitted for approval');
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Subtle Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to catalogue
          </button>
          
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
               <Share2 className="w-4 h-4" />
             </button>
             <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
               <Heart className="w-4 h-4" />
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Content Side */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Minimal Header */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {resource.type?.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                  resource.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {resource.status === 'ACTIVE' ? 'Online' : 'Maintenance'}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
                {resource.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-300" />
                  <span className="text-sm font-medium">{resource.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-300" />
                  <span className="text-sm font-medium">{resource.capacity} capacity</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-100 group">
              {resource.imageUrl ? (
                <img 
                  src={resource.imageUrl} 
                  alt={resource.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-200">
                  <Layers className="w-16 h-16" />
                  <p className="text-xs font-bold uppercase tracking-widest">No preview available</p>
                </div>
              )}
            </div>

            {/* Content Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Description</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {resource.description || "A premium campus space optimized for academic excellence and collaborative research. Designed with versatility in mind to support a wide range of university activities."}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {availableFeatures.length > 0 ? availableFeatures.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md cursor-default">
                      <span className="text-sm">{f.icon}</span>
                      <span className="text-[11px] font-bold text-slate-600">{f.label}</span>
                    </div>
                  )) : (
                    <span className="text-[11px] font-bold text-slate-400">Standard equipment included</span>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.06)]">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Reserve Space</h2>
                    <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-widest">Select your desired timeline</p>
                  </div>

                  {resource.status === 'ACTIVE' ? (
                    <form onSubmit={handleSubmitBooking} className="space-y-6">
                      <div className="space-y-4">
                        <div className="group space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Arrival</label>
                          <input
                            type="datetime-local"
                            name="startTime"
                            value={bookingForm.startTime}
                            onChange={handleBookingChange}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all outline-none"
                            required
                          />
                        </div>
                        <div className="group space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Departure</label>
                          <input
                            type="datetime-local"
                            name="endTime"
                            value={bookingForm.endTime}
                            onChange={handleBookingChange}
                            className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="group space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Objective</label>
                        <textarea
                          name="purpose"
                          value={bookingForm.purpose}
                          onChange={handleBookingChange}
                          rows="2"
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all outline-none resize-none"
                          placeholder="What's your plan?"
                          required
                        />
                      </div>

                      <div className="group space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Attendees</label>
                        <input
                          type="number"
                          name="expectedAttendees"
                          max={resource.capacity}
                          value={bookingForm.expectedAttendees}
                          onChange={handleBookingChange}
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-900 transition-all outline-none"
                          placeholder={`Max ${resource.capacity}`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                         {bookingLoading ? (
                           <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                         ) : (
                           <>
                             <span>Request Booking</span>
                             <ChevronRight className="w-4 h-4" />
                           </>
                         )}
                      </button>

                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Shield className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Instant Security Verification</span>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center space-y-6 py-8">
                       <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto">
                         <Zap className="w-8 h-8 text-rose-500" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-lg font-bold text-slate-900">Temporarily Offline</h3>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">This resource is currently under scheduled maintenance and cannot be reserved.</p>
                       </div>
                       <button 
                         onClick={() => navigate('/bookings')}
                         className="w-full py-4 border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                       >
                         View Available Spaces
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-100 mt-20">
         <div className="flex flex-col md:flex-row items-center justify-between gap-10 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black italic text-sm">U</div>
               <span className="text-sm font-black tracking-tight text-slate-900 uppercase tracking-widest">UNI360 Operations</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Campus Resource Management</p>
         </div>
      </footer>
    </div>
  );
}