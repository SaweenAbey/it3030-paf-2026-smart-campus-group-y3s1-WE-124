import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import BookingRequestsManager from '../components/BookingRequestsManager';
import { resourceAPI } from '../services/api';
import mediaUpload from '../utils/mediaUpload';
import toast from 'react-hot-toast';

const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture hall' },
  { value: 'LIBRARY_HALL', label: 'Library hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting room' },
  { value: 'EQUIPMENT', label: 'Equipment (generic)' },
  { value: 'PROJECTOR', label: 'Projector' },
  { value: 'CAMERA', label: 'Camera' },
  { value: 'OTHER', label: 'Other' },
];

const RESOURCE_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_SERVICE', label: 'Out of service' },
];

const RESOURCE_FEATURE_OPTIONS = ['Mic', 'Projector', 'Speaker', 'Whiteboard', 'Air Conditioner', 'WiFi'];

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [resourcePanelOpen, setResourcePanelOpen] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [resourceImagePreview, setResourceImagePreview] = useState('');
  const [selectedResourceImage, setSelectedResourceImage] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    description: '',
    type: '',
    capacity: '',
    location: '',
    availabilityDurationMinutes: '',
    features: [],
    customFeature: '',
    status: 'ACTIVE',
  });
  const [bookings, setBookings] = useState([
    { id: 1, facility: 'Auditorium', date: '2026-04-15', time: '10:00 AM', booked_by: 'John Doe', status: 'Confirmed' },
    { id: 2, facility: 'Lab A', date: '2026-04-16', time: '2:00 PM', booked_by: 'Jane Smith', status: 'Pending' },
  ]);

  const [maintenance, setMaintenance] = useState([
    { id: 1, facility: 'Building A', issue: 'Roof leak', priority: 'High', assigned_tech: 'Unassigned', status: 'Open' },
    { id: 2, facility: 'Lab B', issue: 'Broken AC', priority: 'Medium', assigned_tech: 'Ahmed Khan', status: 'In Progress' },
  ]);

  const [technicians, setTechnicians] = useState([
    { id: 1, name: 'Ahmed Khan', specialty: 'Electrical', available: true, current_assignment: 1 },
    { id: 2, name: 'Ali Hassan', specialty: 'Plumbing', available: true, current_assignment: null },
    { id: 3, name: 'Fatima Al-Mansouri', specialty: 'HVAC', available: false, current_assignment: 2 },
  ]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const [newBooking, setNewBooking] = useState({ facility: '', date: '', time: '', booked_by: '' });
  const [newMaintenance, setNewMaintenance] = useState({ facility: '', issue: '', priority: 'Medium' });
  const [technicianAssignment, setTechnicianAssignment] = useState({ maintenance_id: '', technician_id: '' });

  const handleAddBooking = () => {
    if (!newBooking.facility || !newBooking.date || !newBooking.time || !newBooking.booked_by) {
      toast.error('Please fill all fields');
      return;
    }
    const booking = {
      id: bookings.length + 1,
      ...newBooking,
      status: 'Confirmed'
    };
    setBookings([...bookings, booking]);
    setNewBooking({ facility: '', date: '', time: '', booked_by: '' });
    setShowBookingModal(false);
    toast.success('Booking added successfully');
  };

  const handleAddMaintenance = () => {
    if (!newMaintenance.facility || !newMaintenance.issue) {
      toast.error('Please fill all fields');
      return;
    }
    const issue = {
      id: maintenance.length + 1,
      ...newMaintenance,
      assigned_tech: 'Unassigned',
      status: 'Open'
    };
    setMaintenance([...maintenance, issue]);
    setNewMaintenance({ facility: '', issue: '', priority: 'Medium' });
    setShowMaintenanceModal(false);
    toast.success('Maintenance request added');
  };

  const handleAssignTechnician = () => {
    if (!technicianAssignment.maintenance_id || !technicianAssignment.technician_id) {
      toast.error('Please select both maintenance and technician');
      return;
    }

    const maintenanceIndex = maintenance.findIndex(m => m.id === parseInt(technicianAssignment.maintenance_id));
    const technicianIndex = technicians.findIndex(t => t.id === parseInt(technicianAssignment.technician_id));

    if (maintenanceIndex !== -1 && technicianIndex !== -1) {
      const updatedMaintenance = [...maintenance];
      updatedMaintenance[maintenanceIndex].assigned_tech = technicians[technicianIndex].name;
      updatedMaintenance[maintenanceIndex].status = 'In Progress';
      setMaintenance(updatedMaintenance);

      const updatedTechnicians = [...technicians];
      updatedTechnicians[technicianIndex].current_assignment = parseInt(technicianAssignment.maintenance_id);
      updatedTechnicians[technicianIndex].available = false;
      setTechnicians(updatedTechnicians);

      setTechnicianAssignment({ maintenance_id: '', technician_id: '' });
      setShowTechnicianModal(false);
      toast.success('Technician assigned successfully');
    }
  };

  const handleBookingStatusChange = (id, newStatus) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(updated);
    toast.success(`Booking status updated to ${newStatus}`);
  };

  const handleMaintenanceStatusChange = (id, newStatus) => {
    const updated = maintenance.map(m => m.id === id ? { ...m, status: newStatus } : m);
    setMaintenance(updated);
    toast.success(`Maintenance status updated to ${newStatus}`);
  };

  const deletBooking = (id) => {
    setBookings(bookings.filter(b => b.id !== id));
    toast.success('Booking deleted');
  };

  const deleteMaintenance = (id) => {
    setMaintenance(maintenance.filter(m => m.id !== id));
    toast.success('Maintenance request deleted');
  };

  const fetchResources = async () => {
    setResourcesLoading(true);
    try {
      const response = await resourceAPI.getAll();
      setResources(response.data || []);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleResourceFieldChange = (e) => {
    const { name, value } = e.target;
    setResourceForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetResourceForm = () => {
    if (resourceImagePreview) {
      URL.revokeObjectURL(resourceImagePreview);
    }
    setResourceForm({
      name: '',
      description: '',
      type: '',
      capacity: '',
      location: '',
      availabilityStartTime: '',
      availabilityEndTime: '',
      availabilityDurationMinutes: '',
      features: [],
      customFeature: '',
      status: 'ACTIVE',
    });
    setSelectedResourceImage(null);
    setResourceImagePreview('');
  };

  const handleResourceImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (resourceImagePreview) {
        URL.revokeObjectURL(resourceImagePreview);
      }
      setSelectedResourceImage(null);
      setResourceImagePreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      e.target.value = '';
      setSelectedResourceImage(null);
      setResourceImagePreview('');
      return;
    }

    setSelectedResourceImage(file);
    if (resourceImagePreview) {
      URL.revokeObjectURL(resourceImagePreview);
    }
    setResourceImagePreview(URL.createObjectURL(file));
  };

  const validateResourceForm = () => {
    if (!resourceForm.name.trim()) {
      toast.error('Resource name is required');
      return false;
    }
    if (!resourceForm.type) {
      toast.error('Resource type is required');
      return false;
    }
    if (!resourceForm.capacity) {
      toast.error('Capacity is required');
      return false;
    }
    const capacityNumber = parseInt(resourceForm.capacity, 10);
    if (Number.isNaN(capacityNumber) || capacityNumber < 1) {
      toast.error('Capacity must be at least 1');
      return false;
    }
    if (!resourceForm.location.trim()) {
      toast.error('Location is required');
      return false;
    }
    if (resourceForm.availabilityDurationMinutes) {
      const duration = parseInt(resourceForm.availabilityDurationMinutes, 10);
      if (Number.isNaN(duration) || duration < 1) {
        toast.error('Duration must be at least 1 minute');
        return false;
      }
    }
    return true;
  };

  const toggleResourceFeature = (feature) => {
    setResourceForm((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
      };
    });
  };

  const addCustomResourceFeature = () => {
    const feature = resourceForm.customFeature.trim();
    if (!feature) return;
    if (resourceForm.features.includes(feature)) {
      setResourceForm((prev) => ({ ...prev, customFeature: '' }));
      return;
    }
    setResourceForm((prev) => ({
      ...prev,
      features: [...prev.features, feature],
      customFeature: '',
    }));
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (!validateResourceForm()) return;

    setResourceSaving(true);
    try {
      let imageUrl = null;
      if (selectedResourceImage) {
        setResourceUploading(true);
        imageUrl = await mediaUpload(selectedResourceImage);
      }

      await resourceAPI.create({
        name: resourceForm.name.trim(),
        description: resourceForm.description.trim() || null,
        imageUrl,
        type: resourceForm.type,
        capacity: parseInt(resourceForm.capacity, 10),
        location: resourceForm.location.trim(),
        availabilityStartTime: resourceForm.availabilityStartTime || null,
        availabilityEndTime: resourceForm.availabilityEndTime || null,
        availabilityDurationMinutes: resourceForm.availabilityDurationMinutes
          ? parseInt(resourceForm.availabilityDurationMinutes, 10)
          : null,
        features: resourceForm.features,
        status: resourceForm.status,
      });

      toast.success('Resource created successfully');
      await fetchResources();
      resetResourceForm();
      setResourcePanelOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create resource');
    } finally {
      setResourceUploading(false);
      setResourceSaving(false);
    }
  };

  const sidebarItems = [
    { key: 'booking-requests', label: 'Booking Requests' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'resources', label: 'Resources' },
    { key: 'technicians', label: 'Assign Technician' },
  ];

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
    } else {
      setResourcePanelOpen(false);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_44%,#f8fafc_100%)] px-4 py-6">
      <div className="mx-auto max-w-360">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} title="Manager Console">
            <div className="rounded-xl border border-slate-200 bg-linear-to-b from-white to-sky-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Signed in as</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-800">{user?.username || 'Manager'}</p>
            </div>
          </Sidebar>

          <section className="space-y-6">
            {/* Header */}
            <div className="rounded-4xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Facility Operations</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Manager Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Welcome back, {user?.username}! Manage facilities, maintenance, and assignments from one control panel.</p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Bookings</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{bookings.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pending Bookings</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{bookings.filter(b => b.status === 'Pending').length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Open Maintenance</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{maintenance.filter(m => m.status === 'Open').length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Available Techs</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{technicians.filter(t => t.available).length}</p>
              </div>
            </div>

            <div className={resourcePanelOpen ? 'grid gap-6 xl:grid-cols-[1fr_420px]' : 'space-y-6'}>
              {/* Tab Content Wrap */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">

              {/* Booking Requests Tab */}
          {activeTab === 'booking-requests' && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Booking Requests</h2>
              <BookingRequestsManager />
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Facility Bookings</h2>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="rounded-lg bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-700"
                >
                  + New Booking
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Facility</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Booked By</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4">{booking.facility}</td>
                        <td className="py-3 px-4">{booking.date}</td>
                        <td className="py-3 px-4">{booking.time}</td>
                        <td className="py-3 px-4">{booking.booked_by}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            booking.status === 'Confirmed'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={booking.status}
                            onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                            className="mr-2 rounded-lg border border-slate-300 px-3 py-1 text-sm"
                          >
                            <option>Confirmed</option>
                            <option>Pending</option>
                            <option>Cancelled</option>
                          </select>
                          <button
                            onClick={() => deletBooking(booking.id)}
                            className="font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Maintenance Requests</h2>
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="rounded-lg bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-700"
                >
                  + New Request
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Facility</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Issue</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Assigned Tech</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map(maint => (
                      <tr key={maint.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4">{maint.facility}</td>
                        <td className="py-3 px-4">{maint.issue}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            maint.priority === 'High'
                              ? 'bg-slate-900 text-white'
                              : maint.priority === 'Medium'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {maint.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">{maint.assigned_tech}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            maint.status === 'Open'
                              ? 'bg-sky-100 text-sky-800'
                              : maint.status === 'In Progress'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-slate-900 text-white'
                          }`}>
                            {maint.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={maint.status}
                            onChange={(e) => handleMaintenanceStatusChange(maint.id, e.target.value)}
                            className="mr-2 rounded-lg border border-slate-300 px-3 py-1 text-sm"
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>
                          <button
                            onClick={() => deleteMaintenance(maint.id)}
                            className="font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assign Technician Tab */}
          {activeTab === 'technicians' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Technician Assignments</h2>
                <button
                  onClick={() => setShowTechnicianModal(true)}
                  className="rounded-lg bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-700"
                >
                  + Assign Technician
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Technicians */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <span className="h-3 w-3 rounded-full bg-sky-600"></span>
                    Available Technicians
                  </h3>
                  <div className="space-y-3">
                    {technicians.filter(t => t.available).map(tech => (
                      <div key={tech.id} className="rounded-lg border border-sky-100 bg-sky-50/60 p-4">
                        <p className="font-semibold text-slate-900">{tech.name}</p>
                        <p className="text-sm text-slate-600">{tech.specialty}</p>
                        <p className="mt-1 text-xs text-sky-700">Available</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Busy Technicians */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <span className="h-3 w-3 rounded-full bg-slate-900"></span>
                    Busy Technicians
                  </h3>
                  <div className="space-y-3">
                    {technicians.filter(t => !t.available).map(tech => (
                      <div key={tech.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                        <p className="font-semibold text-slate-900">{tech.name}</p>
                        <p className="text-sm text-slate-600">{tech.specialty}</p>
                        <p className="mt-1 text-xs text-slate-500">Currently assigned (Task #{tech.current_assignment})</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">All Resources</h2>
                <button
                  type="button"
                  onClick={() => setResourcePanelOpen(true)}
                  className="rounded-lg bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-700"
                >
                  + Add Resource
                </button>
              </div>

              {resourcesLoading ? (
                <p className="text-sm text-slate-600">Loading resources...</p>
              ) : resources.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  No resources found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Image</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Capacity</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Location</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Availability</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Duration</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Features</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((resource) => (
                        <tr key={resource.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            {resource.imageUrl ? (
                              <img
                                src={resource.imageUrl}
                                alt={resource.name ? `${resource.name} resource` : 'Resource image'}
                                className="h-12 w-16 rounded-md border border-slate-200 object-cover"
                              />
                            ) : (
                              <span className="text-xs text-slate-400">No image</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{resource.name || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{resource.type?.replace(/_/g, ' ') || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{resource.capacity ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{resource.location || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {resource.availabilityStartTime && resource.availabilityEndTime
                              ? `${resource.availabilityStartTime} - ${resource.availabilityEndTime}`
                              : 'Not specified'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {resource.availabilityDurationMinutes ? `${resource.availabilityDurationMinutes} min` : '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {resource.features && resource.features.length > 0
                              ? resource.features.join(', ')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                resource.status === 'ACTIVE'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {resource.status?.replace(/_/g, ' ') || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
              </div>

              {resourcePanelOpen && activeTab === 'resources' && (
                <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">
                  <div className="flex items-start justify-between border-b border-slate-200 p-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Quick Create</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">Add Resource</h3>
                      <p className="mt-1 text-sm text-slate-500">Create a campus resource from the dashboard.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetResourceForm();
                        setResourcePanelOpen(false);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleResourceSubmit} className="max-h-[calc(100vh-220px)] space-y-4 overflow-y-auto p-6">
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={resourceForm.name}
                          onChange={handleResourceFieldChange}
                          placeholder="e.g. Main Auditorium A1"
                          maxLength={150}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          disabled={resourceSaving}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <textarea
                          name="description"
                          value={resourceForm.description}
                          onChange={handleResourceFieldChange}
                          rows={3}
                          maxLength={500}
                          placeholder="Optional details about equipment, layout, or notes."
                          className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          disabled={resourceSaving}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">Resource image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleResourceImageSelected}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                          disabled={resourceSaving}
                        />
                        {resourceImagePreview && (
                          <img
                            src={resourceImagePreview}
                            alt="Selected resource preview"
                            className="h-36 w-full rounded-lg border border-slate-200 object-cover"
                          />
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Type *</label>
                          <select
                            name="type"
                            value={resourceForm.type}
                            onChange={handleResourceFieldChange}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={resourceSaving}
                          >
                            <option value="">Select type</option>
                            {RESOURCE_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Capacity *</label>
                          <input
                            type="number"
                            name="capacity"
                            min="1"
                            value={resourceForm.capacity}
                            onChange={handleResourceFieldChange}
                            placeholder="e.g. 80"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={resourceSaving}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Location *</label>
                          <input
                            type="text"
                            name="location"
                            value={resourceForm.location}
                            onChange={handleResourceFieldChange}
                            placeholder="e.g. New Engineering Building, Level 3"
                            maxLength={255}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={resourceSaving}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700">Status</label>
                          <select
                            name="status"
                            value={resourceForm.status}
                            onChange={handleResourceFieldChange}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={resourceSaving}
                          >
                            {RESOURCE_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-sm font-medium text-slate-700">Duration (minutes)</label>
                          <input
                            type="number"
                            name="availabilityDurationMinutes"
                            min="1"
                            value={resourceForm.availabilityDurationMinutes}
                            onChange={handleResourceFieldChange}
                            placeholder="e.g. 120"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            disabled={resourceSaving}
                          />
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                          <label className="text-sm font-medium text-slate-700">Additional features</label>
                          <div className="flex flex-wrap gap-2">
                            {RESOURCE_FEATURE_OPTIONS.map((feature) => (
                              <button
                                key={feature}
                                type="button"
                                onClick={() => toggleResourceFeature(feature)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                  resourceForm.features.includes(feature)
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {feature}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="customFeature"
                              value={resourceForm.customFeature}
                              onChange={handleResourceFieldChange}
                              placeholder="Add custom feature"
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                              disabled={resourceSaving}
                            />
                            <button
                              type="button"
                              onClick={addCustomResourceFeature}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                              disabled={resourceSaving}
                            >
                              Add
                            </button>
                          </div>
                          {resourceForm.features.length > 0 && (
                            <p className="text-xs text-slate-500">Selected: {resourceForm.features.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-200 pt-4">
                      <button
                        type="submit"
                        disabled={resourceSaving}
                        className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {resourceSaving ? (resourceUploading ? 'Uploading image...' : 'Saving...') : 'Save resource'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetResourceForm();
                          setResourcePanelOpen(false);
                        }}
                        disabled={resourceSaving}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </aside>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-2xl font-semibold text-slate-900">Add New Booking</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={newBooking.facility}
                onChange={(e) => setNewBooking({ ...newBooking, facility: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
              <input
                type="time"
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
              <input
                type="text"
                placeholder="Booked By"
                value={newBooking.booked_by}
                onChange={(e) => setNewBooking({ ...newBooking, booked_by: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBookingModal(false)} className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-slate-900 transition hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleAddBooking} className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-2xl font-semibold text-slate-900">Add Maintenance Request</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={newMaintenance.facility}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, facility: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
              <input
                type="text"
                placeholder="Issue Description"
                value={newMaintenance.issue}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, issue: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
              <select
                value={newMaintenance.priority}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowMaintenanceModal(false)} className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-slate-900 transition hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleAddMaintenance} className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showTechnicianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-2xl font-semibold text-slate-900">Assign Technician</h3>
            <div className="space-y-4">
              <select
                value={technicianAssignment.maintenance_id}
                onChange={(e) => setTechnicianAssignment({ ...technicianAssignment, maintenance_id: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="">Select Maintenance Task</option>
                {maintenance.map(m => (
                  <option key={m.id} value={m.id}>{m.facility} - {m.issue}</option>
                ))}
              </select>
              <select
                value={technicianAssignment.technician_id}
                onChange={(e) => setTechnicianAssignment({ ...technicianAssignment, technician_id: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="">Select Technician</option>
                {technicians.filter(t => t.available).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTechnicianModal(false)} className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-slate-900 transition hover:bg-slate-200">
                Cancel
              </button>
              <button onClick={handleAssignTechnician} className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
