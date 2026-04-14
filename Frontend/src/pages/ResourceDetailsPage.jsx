import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const RESOURCE_FEATURES = {
  LECTURE_HALL: [
    { id: 'projector', label: 'Projector', icon: '🎬' },
    { id: 'mic', label: 'Microphone', icon: '🎤' },
    { id: 'whiteboard', label: 'Whiteboard', icon: '✍️' },
    { id: 'smart-board', label: 'Smart Board', icon: '⌨️' },
  ],
  LAB: [
    { id: 'safety-kit', label: 'Safety Kit', icon: '🦺' },
    { id: 'equipment-setup', label: 'Equipment Setup Assistance', icon: '🔧' },
  ],
  MEETING_ROOM: [
    { id: 'catering', label: 'Catering', icon: '🍕' },
    { id: 'video-conference', label: 'Video Conference Setup', icon: '📹' },
    { id: 'whiteboard', label: 'Whiteboard', icon: '✍️' },
  ],
  LIBRARY_HALL: [
    { id: 'projector', label: 'Projector', icon: '🎬' },
    { id: 'sound-system', label: 'Sound System', icon: '🔊' },
  ],
};

export default function ResourceDetailsPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to view resource details');
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
      console.error('Error loading resource details', error);
      toast.error('Failed to load resource details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const availableFeatures = resource ? RESOURCE_FEATURES[resource.type] || [] : [];

  const handleFeatureToggle = (featureId) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.startTime || !bookingForm.endTime || !bookingForm.purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (bookingForm.purpose.length < 5 || bookingForm.purpose.length > 200) {
      toast.error('Purpose must be between 5 and 200 characters');
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

      const response = await bookingAPI.createBooking(payload);

      toast.success('Booking request submitted! Pending manager approval.');
      setShowBookingModal(false);
      setSelectedFeatures([]);
      setBookingForm({ startTime: '', endTime: '', purpose: '', expectedAttendees: '' });
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (error) {
      console.error('Error creating booking', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create booking';
      toast.error(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-16 w-16 animate-spin text-sky-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 text-lg">Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Resource Not Found</h2>
          <p className="text-slate-600 mb-6">The requested resource could not be found</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            ← Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/bookings')}
          className="mb-6 px-4 py-2 text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-2 transition-colors duration-200"
        >
          ← Back to Resources
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Resource Details */}
          <div className="space-y-6">
            {/* Image */}
            <div className="h-72 bg-gradient-to-br from-sky-200 to-blue-200 rounded-2xl flex items-center justify-center text-8xl shadow-lg overflow-hidden">
              {resource.imageUrl ? (
                <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
              ) : (
                '🏛️'
              )}
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{resource.name}</h1>
              <p className="text-xl text-sky-600 font-semibold mb-4">{resource.type.replace(/_/g, ' ')}</p>

              {resource.description && (
                <p className="text-slate-600 mb-6 leading-relaxed">{resource.description}</p>
              )}

              {/* Details Grid */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="text-2xl">👥</span>
                  <div>
                    <span className="text-slate-600">Capacity: </span>
                    <span className="font-semibold text-slate-900">{resource.capacity} people</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <span className="text-2xl">📍</span>
                  <div>
                    <span className="text-slate-600">Location: </span>
                    <span className="font-semibold text-slate-900">{resource.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <span className="text-2xl">{resource.status === 'ACTIVE' ? '✅' : '⛔'}</span>
                  <div>
                    <span className="text-slate-600">Status: </span>
                    <span className="font-semibold text-slate-900">{resource.status}</span>
                  </div>
                </div>

                {resource.availabilityStartTime && resource.availabilityEndTime && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <span className="text-slate-600">Hours: </span>
                      <span className="font-semibold text-slate-900">
                        {new Date(resource.availabilityStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' '}-{' '}
                        {new Date(resource.availabilityEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Features */}
              {availableFeatures.length > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span>✨</span> Available Add-ons
                  </h3>
                  <div className="space-y-2 flex flex-wrap gap-2">
                    {availableFeatures.map((feature) => (
                      <div
                        key={feature.id}
                        className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-sm text-sky-700 font-medium flex items-center gap-1"
                      >
                        <span>{feature.icon}</span>
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Booking Form */}
          {resource.status === 'ACTIVE' && (
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl shadow-lg border border-sky-200 p-8 h-fit">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>📅</span> Book {resource.name}
              </h2>

              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Start Date & Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={bookingForm.startTime}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-colors duration-200"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    End Date & Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={bookingForm.endTime}
                    onChange={handleBookingChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-colors duration-200"
                    required
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Purpose of Booking <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="purpose"
                    value={bookingForm.purpose}
                    onChange={handleBookingChange}
                    placeholder="Describe the purpose of this booking..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-colors duration-200 resize-none"
                    rows="3"
                    minLength="5"
                    maxLength="200"
                    required
                  />
                </div>

                {/* Expected Attendees */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Expected Attendees
                  </label>
                  <input
                    type="number"
                    name="expectedAttendees"
                    min="1"
                    value={bookingForm.expectedAttendees}
                    onChange={handleBookingChange}
                    placeholder="Number of people"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-colors duration-200"
                  />
                </div>

                {/* Additional Features */}
                {availableFeatures.length > 0 && (
                  <div className="pt-4 border-t border-sky-200">
                    <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span>✨</span> Additional Features
                    </label>
                    <div className="space-y-2">
                      {availableFeatures.map((feature) => (
                        <label key={feature.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.id)}
                            onChange={() => handleFeatureToggle(feature.id)}
                            className="w-5 h-5 accent-sky-600 cursor-pointer"
                          />
                          <span className="text-slate-700 group-hover:text-slate-900 transition-colors duration-200 flex items-center gap-2">
                            <span>{feature.icon}</span>
                            {feature.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Alert */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-800 mt-6">
                  <div className="font-semibold mb-1">ℹ️ Important</div>
                  <p>Your booking request will be reviewed and approved by a manager before confirmation.</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/bookings')}
                    className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 px-4 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    {bookingLoading ? '⏳ Submitting...' : '✅ Submit Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Inactive Resource Message */}
          {resource.status !== 'ACTIVE' && (
            <div className="bg-white rounded-2xl shadow-md border border-red-200 p-8 h-fit flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">⛔</div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Resource Unavailable</h2>
              <p className="text-slate-600 text-center">This resource is currently not available for booking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
