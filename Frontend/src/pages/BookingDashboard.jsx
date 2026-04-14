import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function BookingDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resources, setResources] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

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
      setResources(allResources.filter((r) => r.status === 'ACTIVE'));

      // Load user bookings with better error handling
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

  const getResourceIcon = (type) => {
    const icons = {
      LECTURE_HALL: '🎓',
      LIBRARY_HALL: '📚',
      LAB: '🔬',
      MEETING_ROOM: '🤝',
      EQUIPMENT: '⚙️',
      PROJECTOR: '🎬',
      CAMERA: '📷',
      OTHER: '📦',
    };
    return icons[type] || '📦';
  };

  const ResourceCard = ({ resource }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200 animate-fadeIn">
      {/* Image Section */}
      <div className="h-48 bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-6xl">
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
        ) : (
          getResourceIcon(resource.type)
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{resource.name}</h3>
        <p className="text-sm text-sky-600 font-medium mb-4">{resource.type.replace(/_/g, ' ')}</p>

        {/* Details */}
        <div className="space-y-2 mb-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>👥</span> Capacity: <span className="font-semibold text-slate-900">{resource.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span> {resource.location}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/resources/${resource.id}`)}
            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors duration-200"
          >
            👁️ View Details
          </button>
          <button
            onClick={() => navigate(`/resources/${resource.id}#booking`)}
            className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            📅 Book Now
          </button>
        </div>
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => {
    const statusColors = {
      PENDING: 'bg-amber-100 text-amber-800',
      APPROVED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const statusColor = statusColors[booking.status] || 'bg-slate-100 text-slate-800';

    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200">
        {/* Icon/Status Section */}
        <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-5xl relative">
          📅
          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {booking.status}
          </span>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{booking.resourceId}</h3>
          <p className="text-sm text-amber-600 font-medium mb-4">Booking Request</p>

          {/* Details */}
          <div className="space-y-2 mb-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>📅</span>
              {new Date(booking.startTime).toLocaleDateString()} {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-start gap-2">
              <span>📝</span>
              <span className="line-clamp-2">{booking.purpose}</span>
            </div>
            {booking.expectedAttendees && (
              <div className="flex items-center gap-2">
                <span>👥</span>
                {booking.expectedAttendees} attendees
              </div>
            )}
          </div>

          {/* View Button */}
          <button
            onClick={() => navigate(`/bookings`)}
            className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            📋 View Details
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="h-16 w-16 animate-spin text-sky-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-600 text-lg">Loading booking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">📅 Booking Manager</h1>
          <p className="text-xl text-slate-600">Browse available resources and manage your bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-slate-300">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 font-semibold rounded-t-lg transition-colors duration-200 ${
              activeTab === 'available'
                ? 'bg-white text-sky-600 border-b-2 border-sky-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏛️ Available Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('mybookings')}
            className={`px-6 py-3 font-semibold rounded-t-lg transition-colors duration-200 ${
              activeTab === 'mybookings'
                ? 'bg-white text-sky-600 border-b-2 border-sky-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 My Bookings ({userBookings.length})
          </button>
        </div>

        {/* Available Resources Tab */}
        {activeTab === 'available' && (
          <div>
            {resources.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Available Resources</h3>
                <p className="text-slate-600">There are currently no active resources available for booking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'mybookings' && (
          <div>
            {userBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Bookings Yet</h3>
                <p className="text-slate-600 mb-6">You haven't made any booking requests. Start by exploring available resources!</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors duration-200 inline-block"
                >
                  🔍 Browse Resources →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
