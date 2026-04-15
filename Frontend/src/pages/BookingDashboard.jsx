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
  const [resourceBookings, setResourceBookings] = useState({});
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
      const activeResources = allResources.filter((r) => r.status === 'ACTIVE');
      setResources(activeResources);

      // Fetch approved bookings for each resource
      const bookingsMap = {};
      for (const resource of activeResources) {
        try {
          const bookingRes = await bookingAPI.getApprovedByResource(resource.id);
          bookingsMap[resource.id] = Array.isArray(bookingRes.data) ? bookingRes.data : [];
        } catch (err) {
          console.warn(`Error fetching bookings for resource ${resource.id}:`, err);
          bookingsMap[resource.id] = [];
        }
      }
      setResourceBookings(bookingsMap);

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

  const ResourceCard = ({ resource }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-sky-100 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-sky-100 to-blue-200 overflow-hidden">
        {resource.imageUrl ? (
          <img 
            src={resource.imageUrl} 
            alt={resource.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="p-6 border-b border-sky-50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">
              {resource.name}
            </h3>
            <p className="text-sm font-medium text-sky-600">{getResourceTypeLabel(resource.type)}</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full">
            Available
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Capacity: <span className="font-semibold text-gray-900">{resource.capacity} people</span></span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{resource.location}</span>
          </div>
          {resource.features && resource.features.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {resource.features.slice(0, 3).map((feature, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded">
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/resources/${resource.id}`)}
            className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            View Details
          </button>
          <button
            onClick={() => navigate(`/resources/${resource.id}#booking`)}
            className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => {
    const statusConfig = {
      PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    };
    const config = statusConfig[booking.status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-sky-100 overflow-hidden">
        {/* Image Section */}
        <div className="relative h-40 bg-gradient-to-br from-amber-100 to-orange-200 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className={`p-6 border-b ${config.border}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {booking.resourceName || booking.resourceId}
              </h3>
              <p className="text-sm text-gray-600">Booking Request</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(booking.startTime).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="line-clamp-2">{booking.purpose}</span>
            </div>
            {booking.expectedAttendees && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{booking.expectedAttendees} attendees</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate(`/bookings`)}
            className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="h-12 w-12 animate-spin text-sky-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Manager</h1>
          <p className="text-gray-600">Browse available resources and manage your bookings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'available'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Resources
              <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                {resources.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Available Resources Tab */}
        {activeTab === 'available' && (
          <div>
            {resources.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-sky-100">
                <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 21v-4H7v4M12 7v6m-3-3h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Resources</h3>
                <p className="text-gray-500">There are currently no active resources available for booking</p>
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
      </div>
    </div>
  );
}