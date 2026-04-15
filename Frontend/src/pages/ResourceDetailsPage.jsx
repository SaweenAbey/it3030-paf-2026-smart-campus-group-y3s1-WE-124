import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';

const RESOURCE_FEATURES = {
  LECTURE_HALL: [
    { id: 'projector', label: 'Projector' },
    { id: 'mic', label: 'Microphone' },
    { id: 'whiteboard', label: 'Whiteboard' },
    { id: 'smart-board', label: 'Smart Board' },
  ],
  LAB: [
    { id: 'safety-kit', label: 'Safety Kit' },
    { id: 'equipment-setup', label: 'Equipment Setup Assistance' },
  ],
  MEETING_ROOM: [
    { id: 'catering', label: 'Catering' },
    { id: 'video-conference', label: 'Video Conference Setup' },
    { id: 'whiteboard', label: 'Whiteboard' },
  ],
  LIBRARY_HALL: [
    { id: 'projector', label: 'Projector' },
    { id: 'sound-system', label: 'Sound System' },
  ],
};

export default function ResourceDetailsPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
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

      await bookingAPI.createBooking(payload);

      toast.success('Booking request submitted! Pending manager approval.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 animate-spin text-sky-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading resource details...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-sky-50 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
          <p className="text-gray-500 mb-6">The requested resource could not be found or is no longer available.</p>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
       
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Image Section */}
        <div className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-sky-100">
          <div className="relative h-80 bg-gradient-to-br from-sky-100 to-blue-200">
            {resource.imageUrl ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4l8-4m0 10l-8 4m0 0l-8-4m0 0v-10m0 10l8-4" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Resource Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-sky-100 overflow-hidden sticky top-24">
              {/* Resource Header */}
              <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-8">
                <h1 className="text-3xl font-bold text-white mb-3">{resource.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {getResourceTypeLabel(resource.type)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    resource.status === 'ACTIVE' 
                      ? 'bg-emerald-100/40 backdrop-blur-sm text-emerald-100' 
                      : 'bg-red-100/40 backdrop-blur-sm text-red-100'
                  }`}>
                    {resource.status}
                  </span>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-6">
                {resource.description && (
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{resource.description}</p>
                )}

                {/* Key Information */}
                <div className="space-y-4 mb-6">
                  {/* Capacity */}
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Capacity</p>
                        <p className="text-xl font-bold text-gray-900">{resource.capacity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Location</p>
                        <p className="text-lg font-bold text-gray-900">{resource.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Add-ons */}
                {availableFeatures.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Available Add-ons
                    </h3>
                    <div className="space-y-2">
                      {availableFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            {resource.status === 'ACTIVE' ? (
              <div className="bg-white rounded-2xl shadow-lg border border-sky-100 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-8 py-8 border-b border-sky-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Book {resource.name}</h2>
                  <p className="text-gray-600">Fill in the details below to request a booking. A manager will review and approve your request.</p>
                </div>

                <form onSubmit={handleSubmitBooking} className="p-8 space-y-6">
                  {/* Date and Time Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Start Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={bookingForm.startTime}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                        required
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        End Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={bookingForm.endTime}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Purpose of Booking <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="purpose"
                      value={bookingForm.purpose}
                      onChange={handleBookingChange}
                      placeholder="Describe the purpose of this booking..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white resize-none font-medium"
                      rows="3"
                      minLength="5"
                      maxLength="200"
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">Describe why you need this resource</p>
                      <span className={`text-xs font-medium ${bookingForm.purpose.length > 150 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {bookingForm.purpose.length}/200
                      </span>
                    </div>
                  </div>

                  {/* Expected Attendees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Expected Attendees
                      </label>
                      <input
                        type="number"
                        name="expectedAttendees"
                        min="1"
                        max={resource.capacity}
                        value={bookingForm.expectedAttendees}
                        onChange={handleBookingChange}
                        placeholder="Number of people"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                      />
                      {bookingForm.expectedAttendees && parseInt(bookingForm.expectedAttendees) > resource.capacity && (
                        <p className="text-xs text-red-500 mt-2">⚠️ Exceeds maximum capacity of {resource.capacity}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Features */}
                  {availableFeatures.length > 0 && (
                    <div className="pt-4">
                      <h3 className="block text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2-1-2 1m2-1v2.5M4 7l2 1m0 0l2-1m-2 1v2.5" />
                        </svg>
                        Additional Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableFeatures.map((feature) => (
                          <label key={feature.id} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-sky-50 hover:border-sky-300 transition-all duration-200 group">
                            <input
                              type="checkbox"
                              checked={selectedFeatures.includes(feature.id)}
                              onChange={() => handleFeatureToggle(feature.id)}
                              className="w-5 h-5 text-sky-600 border-gray-300 rounded-lg focus:ring-sky-500 cursor-pointer"
                            />
                            <span className="ml-3 text-gray-700 font-medium group-hover:text-sky-600 transition-colors">{feature.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Alert */}
                  <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-sky-900">Booking Request</h4>
                        <p className="text-sm text-sky-800 mt-1">
                          Your request will be reviewed by a manager. You'll receive a confirmation email once approved.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/bookings')}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 disabled:from-sky-400 disabled:to-sky-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Submit Booking Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Resource Unavailable</h3>
                <p className="text-gray-600 mb-8">This resource is currently out of service and cannot be booked.</p>
                <button
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Browse Other Resources
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}