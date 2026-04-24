import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BookingRequestsManager from '../components/BookingRequestsManager';
import { resourceAPI, bookingAPI } from '../services/api';
import mediaUpload from '../utils/mediaUpload';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Layers, 
  Users, 
  MapPin, 
  Clock, 
  Search, 
  MoreVertical,
  Type,
  Image as ImageIcon,
  Upload,
  Zap,
  LayoutGrid,
  ChevronRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

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
  const { user, updateUserProfileImage, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [resourcePanelOpen, setResourcePanelOpen] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceUploading, setResourceUploading] = useState(false);
  const [resourceImagePreview, setResourceImagePreview] = useState('');
  const [selectedResourceImage, setSelectedResourceImage] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    id: null,
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
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [newResource, setNewResource] = useState({ name: '', type: 'LECTURE_HALL', location: '', capacity: '', description: '', amenities: [] });
  const [newMaintenance, setNewMaintenance] = useState({ facility: '', issue: '', priority: 'Medium' });
  const [technicianAssignment, setTechnicianAssignment] = useState({ maintenance_id: '', technician_id: '' });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
  });

  const [securityForm, setSecurityForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleAvatarUpdate = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const imageUrl = await mediaUpload(file);
      await updateUserProfileImage(imageUrl);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to update profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!securityForm.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await updateUser(user.id, {
        ...user, // Keep existing data
        password: securityForm.newPassword,
        confirmPassword: securityForm.confirmPassword
      });
      toast.success('Password updated successfully');
      setShowSecurityModal(false);
      setSecurityForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      toast.error('Name and Email are required');
      return;
    }

    try {
      await updateUser(user.id, profileForm);
      toast.success('Profile updated successfully');
      setShowProfileModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
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


  const handleMaintenanceStatusChange = (id, newStatus) => {
    const updated = maintenance.map(m => m.id === id ? { ...m, status: newStatus } : m);
    setMaintenance(updated);
    toast.success(`Maintenance status updated to ${newStatus}`);
  };


  const deleteMaintenance = (id) => {
    setMaintenance(maintenance.filter(m => m.id !== id));
    toast.success('Maintenance request deleted');
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      const allData = response.data || [];
      
      // Transform backend data to fit dashboard state if necessary
      const formattedBookings = allData.map(b => ({
        id: b.id,
        facility: b.resource?.name || 'Unknown',
        date: new Date(b.startTime).toLocaleDateString(),
        time: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        booked_by: b.user?.name || b.user?.username || 'User',
        status: b.status.charAt(0) + b.status.slice(1).toLowerCase(),
        purpose: b.purpose
      }));

      setBookings(formattedBookings);
      
      // Filter for pending requests to show in notifications
      const pending = allData.filter(b => b.status === 'PENDING').map(b => ({
        id: b.id,
        user: { name: b.user?.name || b.user?.username || 'New User' },
        resource: { name: b.resource?.name || 'Facility' },
        status: 'PENDING'
      }));
      setBookingRequests(pending);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
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
      id: null,
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

  const handleEditResource = (resource) => {
    setResourceForm({
      id: resource.id,
      name: resource.name || '',
      description: resource.description || '',
      type: resource.type || '',
      capacity: resource.capacity?.toString() || '',
      location: resource.location || '',
      availabilityStartTime: resource.availabilityStartTime || '',
      availabilityEndTime: resource.availabilityEndTime || '',
      availabilityDurationMinutes: resource.availabilityDurationMinutes?.toString() || '',
      features: resource.features || [],
      customFeature: '',
      status: resource.status || 'ACTIVE',
    });
    setResourceImagePreview(resource.imageUrl || '');
    setResourcePanelOpen(true);
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    if (!validateResourceForm()) return;

    setResourceSaving(true);
    try {
      let imageUrl = resourceForm.id ? resourceImagePreview : null;
      if (selectedResourceImage) {
        setResourceUploading(true);
        imageUrl = await mediaUpload(selectedResourceImage);
      }

      const payload = {
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
      };

      if (resourceForm.id) {
        await resourceAPI.update(resourceForm.id, payload);
        toast.success('Resource updated successfully');
      } else {
        await resourceAPI.create(payload);
        toast.success('Resource created successfully');
      }

      await fetchResources();
      resetResourceForm();
      setResourcePanelOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save resource');
    } finally {
      setResourceUploading(false);
      setResourceSaving(false);
    }
  };

  const sidebarItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'booking-requests', label: 'Booking Requests' },
    { key: 'resources', label: 'Resources' },
    { key: 'profile', label: 'Profile' },
  ];

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, []);

  useEffect(() => {
    if (activeTab === 'resources') {
      fetchResources();
    } else if (activeTab === 'overview') {
      fetchBookings();
    } else {
      setResourcePanelOpen(false);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_44%,#f8fafc_100%)] px-4 py-6">
      <div className="mx-auto max-w-360">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} title="Manager Console">
            <div className="rounded-xl border border-sky-100 bg-linear-to-b from-white to-sky-50/50 p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Session Admin</p>
              <p className="mt-1 text-sm font-bold text-slate-800 truncate">{user?.name || user?.username || 'Manager'}</p>
            </div>
          </Sidebar>

          <section className="space-y-6">
            <Navbar />
            
            <div className={resourcePanelOpen ? 'grid gap-6 xl:grid-cols-[1fr_420px]' : 'space-y-6'}>
              {/* Tab Content Wrap */}
              <div className={`overflow-hidden ${activeTab === 'overview' ? '' : 'rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]'}`}>

              {/* Overview Tab (Premium View) */}
              {activeTab === 'overview' && (
                <div className="grid gap-6">
                   {/* Top Stats Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Resources', value: resources.length, trend: 'Online', icon: Users, color: 'sky' },
                        { label: 'Pending Requests', value: bookingRequests.length, trend: 'Needs Action', icon: Clock, color: 'emerald' },
                        { label: 'Maintenance', value: maintenance.length, trend: 'Active', icon: Search, color: 'rose' },
                        { label: 'Confirmed Bookings', value: bookings.length, trend: 'Active', icon: Zap, color: 'indigo' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all group">
                           <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                 <stat.icon className="w-5 h-5" />
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                                 {stat.trend}
                              </span>
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                           <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                      ))}
                   </div>

                   {/* Main Content Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                      <div className="space-y-6">
                         {/* Large Chart Area */}
                         <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                               <div>
                                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Resource Utilization</h3>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time usage trends across campus</p>
                               </div>
                               <div className="flex gap-2">
                                  {['1W', '1M', '3M', 'ALL'].map(t => (
                                    <button key={t} className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${t === '1M' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                      {t}
                                    </button>
                                  ))}
                               </div>
                            </div>
                            
                            {/* Mock Chart Area */}
                            <div className="relative h-[300px] w-full bg-slate-50/30 rounded-3xl overflow-hidden group">
                               <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                                  <defs>
                                     <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                                     </linearGradient>
                                  </defs>
                                  <path 
                                    d="M0,250 C100,220 150,280 250,200 C350,120 450,230 550,150 C650,70 750,120 800,100 L800,300 L0,300 Z" 
                                    fill="url(#chartGradient)"
                                    className="animate-in fade-in slide-in-from-bottom-2 duration-1000"
                                  />
                                  <path 
                                    d="M0,250 C100,220 150,280 250,200 C350,120 450,230 550,150 C650,70 750,120 800,100" 
                                    fill="none" 
                                    stroke="#0ea5e9" 
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    className="animate-in fade-in duration-700"
                                  />
                                  {/* Grid Lines */}
                                  {[50, 100, 150, 200, 250].map(y => (
                                    <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                                  ))}
                               </svg>
                               <div className="absolute inset-0 flex items-center justify-around px-8 pointer-events-none">
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map(m => (
                                    <span key={m} className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-auto pb-4">{m}</span>
                                  ))}
                               </div>
                            </div>
                         </div>

                         {/* Mini Table Section */}
                         <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                               <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Facility Logs</h3>
                               <button className="text-sky-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All Logs</button>
                            </div>
                            <div className="space-y-4">
                               {bookings.slice(0, 3).map((log, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                          {log.booked_by?.charAt(0) || 'U'}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-900">{log.booked_by || 'Resource Booking'}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.facility} • {log.time || 'All Day'}</p>
                                          <p className="text-[9px] font-bold text-sky-600 uppercase tracking-[0.2em] mt-0.5">{log.purpose || 'Facility Utilization'}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-xs font-black text-slate-900">{log.date}</p>
                                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${log.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                          {log.status}
                                       </span>
                                    </div>
                                 </div>
                               ))}
                               {bookings.length === 0 && <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent bookings found</p>}
                            </div>
                         </div>
                      </div>

                      {/* Right Column: Widgets */}
                      <div className="space-y-6">
                         {/* Calendar Widget */}
                         <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                               <h4 className="text-lg font-black text-slate-900">Calendar</h4>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
                               </span>
                            </div>
                            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-300 uppercase mb-4">
                               {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                               {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => {
                                 const day = i + 1;
                                 const isToday = day === new Date().getDate();
                                 return (
                                   <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${isToday ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                                     {day}
                                   </div>
                                 );
                               })}
                            </div>
                         </div>

                          {/* Live Notifications */}
                          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black text-slate-900">Live Notifications</h4>
                                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                             </div>
                             <div className="space-y-6">
                                {bookingRequests.slice(0, 3).map((request, i) => (
                                  <div key={i} className="flex gap-4 relative">
                                     {i < bookingRequests.slice(0, 3).length - 1 && <div className="absolute left-[17px] top-10 w-0.5 h-10 bg-slate-100" />}
                                     <div className={`w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0`}>
                                        <Clock className="w-4 h-4" />
                                     </div>
                                     <div className="overflow-hidden">
                                        <p className="text-sm font-black text-slate-900 truncate">{request.user?.name || 'New Request'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase truncate">{request.resource?.name || 'Booking Detail'}</p>
                                        <span className="inline-block mt-1 text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">Pending Review</span>
                                     </div>
                                  </div>
                                ))}
                                {bookingRequests.length === 0 && (
                                   <div className="text-center py-4">
                                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">All Caught Up</p>
                                   </div>
                                )}
                             </div>
                          </div>

                         {/* Analytics Circle */}
                         <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm flex flex-col items-center">
                            <h4 className="text-lg font-black text-slate-900 mb-6 w-full text-left">Facility Health</h4>
                            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                               <svg className="w-full h-full -rotate-90">
                                  <circle cx="64" cy="64" r="56" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                  <circle cx="64" cy="64" r="56" fill="none" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="351.85" strokeDashoffset="42.22" strokeLinecap="round" className="animate-in fade-in duration-1000" />
                               </svg>
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-black text-slate-900">88%</span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Optimal</span>
                               </div>
                            </div>
                            <div className="w-full space-y-3">
                               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                  <span className="text-slate-400">Total Status</span>
                                  <span className="text-slate-900">Healthy</span>
                               </div>
                               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full w-[92%]" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
          {activeTab === 'booking-requests' && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Booking Requests</h2>
              <BookingRequestsManager />
            </div>
          )}


          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
               {/* Identity Card */}
               <div className="bg-white rounded-[3rem] border border-slate-200/60 p-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50/50 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-sky-100/50 transition-colors duration-1000"></div>
                  
                  <div className="relative flex flex-col md:flex-row gap-10 items-center md:items-start">
                     {/* Avatar Area */}
                     <div className="relative">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                           {avatarLoading ? (
                              <div className="flex flex-col items-center">
                                 <div className="w-8 h-8 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
                                 <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest mt-2">Uploading...</span>
                              </div>
                           ) : user?.profileImageUrl ? (
                              <img src={user.profileImageUrl} alt="Manager" className="w-full h-full object-cover" />
                           ) : (
                              <div className="flex flex-col items-center">
                                 <Users className="w-16 h-16 text-slate-200" />
                                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">No Image</span>
                              </div>
                           )}
                        </div>
                        <input 
                           type="file" 
                           id="avatar-upload" 
                           className="hidden" 
                           accept="image/*"
                           onChange={handleAvatarUpdate}
                        />
                        <button 
                           onClick={() => document.getElementById('avatar-upload').click()}
                           className="absolute -bottom-2 -right-2 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl hover:bg-sky-600 hover:scale-110 transition-all duration-300 group/edit"
                        >
                           <Edit2 className="w-5 h-5 group-hover/edit:rotate-12 transition-transform" />
                        </button>
                     </div>

                     {/* Info Area */}
                     <div className="flex-1 text-center md:text-left space-y-6">
                        <div>
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100/50 mb-4">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Verified Operations Manager</span>
                           </div>
                           <h2 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name || user?.username || 'Administrator'}</h2>
                           <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">Uni 360 Campus Command Center</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                 <Plus className="w-3 h-3 text-sky-500" /> Professional Email
                              </p>
                              <p className="text-base font-bold text-slate-700">{user?.email || 'manager@uni360.edu'}</p>
                           </div>
                           <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                 <MapPin className="w-3 h-3 text-rose-500" /> Primary Office
                              </p>
                              <p className="text-base font-bold text-slate-700">{user?.location || 'Operations Block B, Room 204'}</p>
                           </div>
                        </div>

                        <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                           <button 
                             onClick={() => setShowProfileModal(true)}
                             className="px-10 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-600 transition-all hover:scale-105 shadow-2xl shadow-slate-200"
                           >
                              Edit Profile Details
                           </button>
                           <button 
                             onClick={() => setShowSecurityModal(true)}
                             className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all hover:scale-105"
                           >
                              Security Settings
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Meta Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                     { label: 'Authorization', value: 'Level 4 Admin', icon: ShieldCheck, color: 'sky' },
                     { label: 'Duty Session', value: '04h 12m', icon: Clock, color: 'emerald' },
                     { label: 'Registry Access', value: 'Full Control', icon: Zap, color: 'indigo' },
                  ].map((stat, i) => (
                     <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                           <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black text-slate-900 mt-2">{stat.value}</p>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">All Resources</h2>
                <button
                  type="button"
                  onClick={() => setResourcePanelOpen(true)}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  Add Resource
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
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Image</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resource Details</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Capacity</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Schedule</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amenities</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resources.map((resource) => (
                        <tr key={resource.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          {/* Image Cell */}
                          <td className="px-6 py-5">
                            {resource.imageUrl ? (
                              <div className="relative h-14 w-20 overflow-hidden rounded-[1.25rem] border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                <img
                                  src={resource.imageUrl}
                                  alt={resource.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-14 w-20 items-center justify-center rounded-[1.25rem] bg-slate-50 border border-slate-100">
                                <Layers className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </td>

                          {/* Name & Location Cell */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-slate-900 text-base tracking-tight group-hover:text-sky-600 transition-colors">{resource.name || 'Unnamed Resource'}</span>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{resource.location || 'Central Campus'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Type Cell */}
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200/50">
                              {resource.type?.replace(/_/g, ' ') || 'FACILITY'}
                            </span>
                          </td>

                          {/* Capacity Cell */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                               <Users className="w-4 h-4 text-sky-500/70" />
                               <span className="font-black text-slate-900">{resource.capacity ?? '—'}</span>
                            </div>
                          </td>

                          {/* Schedule Cell */}
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-900 tracking-tight">{resource.availabilityStartTime || '08:00'}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">— {resource.availabilityEndTime || '18:00'}</span>
                            </div>
                          </td>

                          {/* Features Cell */}
                          <td className="px-6 py-5">
                             <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                                {resource.features && resource.features.length > 0 ? (
                                  <>
                                    {resource.features.slice(0, 2).map((f, i) => (
                                      <span key={i} className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-tighter">
                                        {f}
                                      </span>
                                    ))}
                                    {resource.features.length > 2 && (
                                      <span className="text-[9px] font-black text-slate-300 self-center ml-1">+{resource.features.length - 2}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Standard Specs</span>
                                )}
                             </div>
                          </td>

                          {/* Status Cell */}
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${
                                resource.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full ${resource.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                              {resource.status?.replace(/_/g, ' ') || 'ACTIVE'}
                            </span>
                          </td>

                          {/* Actions Cell */}
                          <td className="px-6 py-5 text-right">
                             <div className="flex items-center justify-end gap-3">
                                <button 
                                  onClick={() => navigate(`/resources/${resource.id}`)}
                                  className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-sky-600 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-50 transition-all duration-300 group/btn"
                                  title="View Public Details"
                                >
                                   <ExternalLink className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleEditResource(resource)}
                                  className="h-10 w-10 flex items-center justify-center bg-slate-900 rounded-xl text-white hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-100 transition-all duration-300 group/btn"
                                  title="Edit Resource"
                                >
                                   <Edit2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                </button>
                             </div>
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
                <aside className="sticky top-6 h-fit overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/70 backdrop-blur-2xl shadow-[0_40px_80px_-24px_rgba(15,23,42,0.12)] animate-in slide-in-from-right-10 duration-500 flex flex-col">
                  {/* Panel Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 p-8 bg-slate-50/40">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-700/80">Console Registry</p>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {resourceForm.id ? 'Edit Resource' : 'Initialize Resource'}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider opacity-60">
                        {resourceForm.id ? 'Modify existing facility data' : 'Define new campus facility'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetResourceForm();
                        setResourcePanelOpen(false);
                      }}
                      className="p-2.5 bg-white border border-slate-100 hover:shadow-lg hover:border-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-900 group"
                    >
                      <Plus className="w-5 h-5 rotate-45 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <form onSubmit={handleResourceSubmit} className="max-h-[calc(100vh-280px)] space-y-10 overflow-y-auto p-8 scrollbar-hide">
                    <div className="grid gap-10">
                      {/* Section Title: Identity */}
                      <div className="space-y-6">
                        {/* Name Section */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                             <Type className="w-3.5 h-3.5 text-sky-600" />
                             Resource Identity *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={resourceForm.name}
                            onChange={handleResourceFieldChange}
                            placeholder="e.g. Main Auditorium A1"
                            maxLength={150}
                            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all shadow-inner"
                            disabled={resourceSaving}
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                             <Layers className="w-3.5 h-3.5 text-slate-400" />
                             Contextual Details
                          </label>
                          <textarea
                            name="description"
                            value={resourceForm.description}
                            onChange={handleResourceFieldChange}
                            rows={3}
                            maxLength={500}
                            placeholder="Describe the layout, purpose, or specialized equipment available..."
                            className="w-full resize-none rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all shadow-inner"
                            disabled={resourceSaving}
                          />
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-4 p-8 bg-slate-50/80 rounded-[2.5rem] border-2 border-white/50 shadow-inner">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                           <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                           Visual Identification
                        </label>
                        <div className="relative group cursor-pointer">
                           <input
                             type="file"
                             accept="image/*"
                             onChange={handleResourceImageSelected}
                             className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                             disabled={resourceSaving}
                           />
                           <div className="w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white group-hover:border-sky-300 group-hover:bg-sky-50/30 transition-all overflow-hidden shadow-sm">
                              {resourceImagePreview ? (
                                <img
                                  src={resourceImagePreview}
                                  alt="Preview"
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              ) : (
                                <>
                                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white transition-all shadow-inner">
                                    <Upload className="w-7 h-7 text-slate-300 group-hover:text-sky-500" />
                                  </div>
                                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Select Photograph</p>
                                  <p className="text-[9px] text-slate-400 uppercase mt-2 tracking-[0.15em] font-black opacity-50">1920x1080 Highly Recommended</p>
                                </>
                              )}
                           </div>
                        </div>
                      </div>

                      <div className="grid gap-10">
                        <div className="grid gap-8 sm:grid-cols-2">
                          {/* Type Selection */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                               <Zap className="w-3.5 h-3.5 text-amber-600" />
                               Classification *
                            </label>
                            <div className="relative">
                              <select
                                name="type"
                                value={resourceForm.type}
                                onChange={handleResourceFieldChange}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all appearance-none shadow-inner"
                                disabled={resourceSaving}
                              >
                                <option value="">Select Category</option>
                                {RESOURCE_TYPES.map((type) => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                 <Plus className="w-4 h-4 rotate-45" />
                              </div>
                            </div>
                          </div>

                          {/* Capacity */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                               <Users className="w-3.5 h-3.5 text-emerald-600" />
                               Max Capacity *
                            </label>
                            <input
                              type="number"
                              name="capacity"
                              min="1"
                              value={resourceForm.capacity}
                              onChange={handleResourceFieldChange}
                              placeholder="e.g. 150"
                              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all shadow-inner"
                              disabled={resourceSaving}
                            />
                          </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                             <MapPin className="w-3.5 h-3.5 text-rose-600" />
                             Campus Location *
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={resourceForm.location}
                            onChange={handleResourceFieldChange}
                            placeholder="e.g. Innovation Hub, Block C, Room 402"
                            maxLength={255}
                            className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all shadow-inner"
                            disabled={resourceSaving}
                          />
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2">
                          {/* Status */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                               <Search className="w-3.5 h-3.5 text-indigo-500" />
                               Availability Status
                            </label>
                            <div className="relative">
                              <select
                                name="status"
                                value={resourceForm.status}
                                onChange={handleResourceFieldChange}
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all appearance-none shadow-inner"
                                disabled={resourceSaving}
                              >
                                {RESOURCE_STATUSES.map((status) => (
                                  <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                              </select>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                 <Plus className="w-4 h-4 rotate-45" />
                              </div>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                               <Clock className="w-3.5 h-3.5 text-violet-600" />
                               Session Limit
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                name="availabilityDurationMinutes"
                                min="1"
                                value={resourceForm.availabilityDurationMinutes}
                                onChange={handleResourceFieldChange}
                                placeholder="120"
                                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all pr-14 shadow-inner"
                                disabled={resourceSaving}
                              />
                              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-lg">MIN</span>
                            </div>
                          </div>
                        </div>

                        {/* Availability Time Slots */}
                        <div className="grid gap-8 sm:grid-cols-2 p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-white/50">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                               <Clock className="w-3.5 h-3.5 text-emerald-600" />
                               Operation Start
                            </label>
                            <input
                              type="time"
                              name="availabilityStartTime"
                              value={resourceForm.availabilityStartTime}
                              onChange={handleResourceFieldChange}
                              className="w-full rounded-2xl border-2 border-white bg-white/80 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all shadow-sm"
                              disabled={resourceSaving}
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
                               <Clock className="w-3.5 h-3.5 text-rose-600" />
                               Operation End
                            </label>
                            <input
                              type="time"
                              name="availabilityEndTime"
                              value={resourceForm.availabilityEndTime}
                              onChange={handleResourceFieldChange}
                              className="w-full rounded-2xl border-2 border-white bg-white/80 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all shadow-sm"
                              disabled={resourceSaving}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-6">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Premium Amenities
                         </label>
                         <div className="flex flex-wrap gap-3">
                            {RESOURCE_FEATURE_OPTIONS.map((feature) => (
                               <button
                                 key={feature}
                                 type="button"
                                 onClick={() => toggleResourceFeature(feature)}
                                 className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-300 ${
                                   resourceForm.features.includes(feature)
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1'
                                    : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600 hover:bg-slate-50'
                                 }`}
                               >
                                  {feature}
                               </button>
                            ))}
                         </div>
                      </div>
                    </div>

                    {/* Bottom Actions - Removed Sticky */}
                    <div className="flex gap-4 mt-12 px-2 pb-4">
                       <button
                         type="button"
                         onClick={() => {
                           resetResourceForm();
                           setResourcePanelOpen(false);
                         }}
                         className="flex-1 px-8 py-5 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 hover:text-slate-800 transition-all"
                       >
                         Discard
                       </button>
                       <button
                         type="submit"
                         disabled={resourceSaving}
                         className="flex-[2.5] px-8 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-200 hover:shadow-sky-100 hover:bg-sky-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
                       >
                          {resourceSaving ? (
                             <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                             <>
                               <span>{resourceForm.id ? 'Deploy the Resource' : 'Create Resource'}</span>
                               <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                             </>
                          )}
                       </button>
                    </div>
                  </form>
                </aside>
              )}
            </div>
          </section>


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
      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update your professional digital identity</p>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="manager@uni360.edu"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Office Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="e.g. Block B, Room 204"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowProfileModal(false)} 
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-sky-600 transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Settings</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update your account access credentials</p>
              </div>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-2">
                   <div className="flex items-center gap-3 text-sky-600 mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <p className="text-xs font-black uppercase tracking-widest">Password Protocol</p>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">Ensure your new password contains at least 8 characters including symbols and numerals for optimal campus security.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                  <input
                    type="password"
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowSecurityModal(false)} 
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] px-8 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Update Account Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
