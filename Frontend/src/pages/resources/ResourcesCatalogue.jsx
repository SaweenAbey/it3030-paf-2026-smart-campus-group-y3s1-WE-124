import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI } from '../../services/api';
import mediaUpload from '../../utils/mediaUpload';
import { 
  Search, 
  MapPin, 
  Users, 
  Layers, 
  Filter, 
  RotateCcw, 
  ArrowUpRight,
  Plus,
  Type,
  ImageIcon,
  Zap,
  Clock
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
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
];

const ResourcesCatalogue = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    minCapacity: '',
    location: '',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    capacity: '',
    location: '',
    availabilityStartTime: '',
    availabilityEndTime: '',
    availabilityDurationMinutes: '',
    status: 'ACTIVE',
  });

  const isManager = user?.role === 'MANAGER';

  useEffect(() => {
    if (isManager && location.state?.openCreateForm) {
      setFormOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [isManager, location.state]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      runResourceQuery();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [filters.type, filters.status, filters.minCapacity, filters.location]);

  const runResourceQuery = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.minCapacity) {
        const cap = parseInt(filters.minCapacity, 10);
        if (!Number.isNaN(cap)) params.minCapacity = cap;
      }

      const res = Object.keys(params).length
        ? await resourceAPI.search(params)
        : await resourceAPI.getAll();

      setResources(res.data || []);
    } catch (error) {
      console.error('Error searching resources', error);
      toast.error('Failed to search resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllResources = async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getAll();
      setResources(res.data || []);
    } catch (error) {
      console.error('Error loading resources', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    runResourceQuery();
  };

  const handleResetFilters = () => {
    setFilters({ type: '', status: '', minCapacity: '', location: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      capacity: '',
      location: '',
      availabilityStartTime: '',
      availabilityEndTime: '',
      availabilityDurationMinutes: '',
      status: 'ACTIVE',
    });
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedImageFile(null);
      setImagePreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      e.target.value = '';
      setSelectedImageFile(null);
      setImagePreview('');
      return;
    }

    setSelectedImageFile(file);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Resource name is required');
      return false;
    }
    if (!formData.type) {
      toast.error('Resource type is required');
      return false;
    }
    if (!formData.capacity) {
      toast.error('Capacity is required');
      return false;
    }
    const capacityNumber = parseInt(formData.capacity, 10);
    if (Number.isNaN(capacityNumber) || capacityNumber < 1) {
      toast.error('Capacity must be at least 1');
      return false;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return false;
    }
    return true;
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      let imageUrl = null;
      if (selectedImageFile) {
        setUploadingImage(true);
        imageUrl = await mediaUpload(selectedImageFile);
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        imageUrl,
        type: formData.type,
        capacity: parseInt(formData.capacity, 10),
        location: formData.location.trim(),
        availabilityStartTime: formData.availabilityStartTime || null,
        availabilityEndTime: formData.availabilityEndTime || null,
        availabilityDurationMinutes: formData.availabilityDurationMinutes
          ? parseInt(formData.availabilityDurationMinutes, 10)
          : null,
        status: formData.status,
      };

      await resourceAPI.create(payload);
      toast.success('Resource created successfully');
      resetForm();
      setFormOpen(false);
      fetchAllResources();
    } catch (error) {
      console.error('Error creating resource', error);
      const message = error.response?.data?.message || 'Failed to create resource';
      toast.error(message);
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-[1400px] px-6 pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="h-px w-8 bg-sky-500"></span>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">Campus Directory</p>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Resource <span className="text-sky-600">Catalogue</span></h1>
              <p className="mt-4 text-slate-500 font-medium max-w-lg leading-relaxed">
                Explore and book world-class facilities across our smart campus. 
                From lecture halls to specialized labs.
              </p>
           </div>
           
           {isManager && (
             <button
               onClick={() => setFormOpen(true)}
               className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 group"
             >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Add New Facility
             </button>
           )}
        </div>

        {/* Filters Section */}
        <div className="relative mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-[2.5rem] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
          <form 
            onSubmit={runResourceQuery} 
            className="relative flex flex-col gap-6 rounded-[2.5rem] border border-white/40 bg-white/60 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:flex-row lg:items-center"
          >
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Layers className="w-3 h-3" />
                 Classification
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all appearance-none"
              >
                <option value="">All Resource Types</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Users className="w-3 h-3" />
                 Min Capacity
              </label>
              <input
                type="number"
                name="minCapacity"
                value={filters.minCapacity}
                onChange={handleFilterChange}
                placeholder="e.g. 50"
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              />
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <MapPin className="w-3 h-3" />
                 Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Block, Level or Building"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all pl-12"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="flex items-end gap-3 lg:pt-6">
              <button
                type="submit"
                className="flex-[2] lg:flex-none lg:px-8 py-3.5 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-100 hover:shadow-sky-200 hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Refine Result
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 lg:flex-none p-3.5 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all flex items-center justify-center"
                title="Reset Filters"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Add resource form Panel */}
        {isManager && formOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all duration-500">
            <aside className="w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="flex items-start justify-between border-b border-slate-100 p-8 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700">Global Registry</p>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">New Facility</h3>
                  <p className="mt-1 text-sm text-slate-500 font-medium">Register a new resource to the campus catalogue.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                  className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-slate-600"
                >
                  <Plus className="w-7 h-7 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateResource} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                <div className="grid gap-10">
                  {/* Name Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Type className="w-4 h-4 text-sky-600" />
                       Resource Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Innovation Lab 402"
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                      disabled={saving}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Layers className="w-4 h-4 text-slate-400" />
                       Description & Usage
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                      placeholder="Detail the purpose, specialized equipment, or accessibility notes..."
                      className="w-full resize-none rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                      disabled={saving}
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-indigo-600" />
                       Facility Media
                    </label>
                    <div className="relative group cursor-pointer">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleImageSelected}
                         className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                         disabled={saving}
                       />
                       <div className="w-full aspect-[16/9] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white group-hover:border-sky-300 group-hover:bg-sky-50/30 transition-all overflow-hidden shadow-inner">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-sky-500" />
                              </div>
                              <p className="text-xs font-bold text-slate-600">Select Facility Photograph</p>
                              <p className="text-[9px] text-slate-400 uppercase mt-2 tracking-[0.2em] font-black opacity-60">High Resolution Recommended</p>
                            </>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    {/* Type Selection */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Zap className="w-4 h-4 text-amber-600" />
                         Category *
                      </label>
                      <div className="relative">
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all appearance-none"
                          disabled={saving}
                        >
                          <option value="">Select Classification</option>
                          {RESOURCE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <RotateCcw className="w-4 h-4 rotate-45" />
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Users className="w-4 h-4 text-emerald-600" />
                         Max Capacity *
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        value={formData.capacity}
                        onChange={handleFormChange}
                        placeholder="e.g. 150"
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                        disabled={saving}
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-3 sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-rose-600" />
                         Campus Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        placeholder="e.g. Science Park, Block B, Floor 2"
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                        disabled={saving}
                      />
                    </div>

                    {/* Availability Time Slots */}
                    <div className="grid gap-8 sm:grid-cols-2 sm:col-span-2">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Clock className="w-4 h-4 text-emerald-600" />
                           Available From
                        </label>
                        <input
                          type="time"
                          name="availabilityStartTime"
                          value={formData.availabilityStartTime}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Clock className="w-4 h-4 text-rose-600" />
                           Available To
                        </label>
                        <input
                          type="time"
                          name="availabilityEndTime"
                          value={formData.availabilityEndTime}
                          onChange={handleFormChange}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-3 sm:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Clock className="w-4 h-4 text-sky-600" />
                           Max Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          name="availabilityDurationMinutes"
                          value={formData.availabilityDurationMinutes}
                          onChange={handleFormChange}
                          placeholder="e.g. 60"
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Filter className="w-4 h-4 text-indigo-500" />
                         Initial Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-6 py-5 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-8 focus:ring-sky-50 transition-all appearance-none"
                        disabled={saving}
                      >
                        {RESOURCE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </form>

              {/* Sticky Footer */}
              <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
                 <button
                   type="button"
                   onClick={() => {
                     resetForm();
                     setFormOpen(false);
                   }}
                   className="flex-1 px-8 py-5 bg-slate-100 text-slate-600 font-bold rounded-[2rem] hover:bg-slate-200 transition-all text-sm"
                 >
                   Discard Changes
                 </button>
                 <button
                   type="submit"
                   onClick={handleCreateResource}
                   disabled={saving}
                   className="flex-[2] px-8 py-5 bg-slate-900 text-white font-bold rounded-[2rem] shadow-2xl shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-sm group"
                 >
                    {saving ? (
                       <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                       <>
                         <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                         <span>Deploy to Catalogue</span>
                       </>
                    )}
                 </button>
              </div>
            </aside>
          </div>
        )}

        {/* Catalogue Content */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8 px-2">
             <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {loading ? 'Analyzing Data...' : `${resources.length} Facilities Found`}
                </span>
                {loading && <div className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>}
             </div>
             
             <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Sort by:</span>
                <select className="bg-transparent border-none focus:ring-0 cursor-pointer text-slate-900 font-black">
                   <option>Newest First</option>
                   <option>Capacity</option>
                   <option>A-Z</option>
                </select>
             </div>
          </div>

          {!loading && resources.length === 0 && (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 px-8 py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6 opacity-50">
                 <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-8 text-sky-600 font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => (
              <article
                key={r.id}
                onClick={() => navigate(`/resources/${r.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:bg-white/60"
              >
                {/* Image Section */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
                      <Layers className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                        r.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : r.status === 'OUT_OF_STOCK'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'ACTIVE' ? 'bg-emerald-500' : r.status === 'OUT_OF_STOCK' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                      {r.status?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/50 shadow-sm">
                      {r.type?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-7 space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors line-clamp-1">{r.name || 'Unnamed Facility'}</h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                       <MapPin className="w-3.5 h-3.5 text-rose-500/70" />
                       <span className="text-xs font-medium truncate">{r.location || 'Campus Location'}</span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600 line-clamp-2 min-h-[2.5rem] font-medium opacity-80">{r.description || 'No description provided for this campus resource.'}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity</span>
                         <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-sky-600" />
                            {r.capacity ?? '—'}
                         </span>
                       </div>
                    </div>
                    
                    <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-lg group-hover:bg-sky-600">
                       <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                  {r.features && r.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {r.features.slice(0, 2).map((feature) => (
                        <span
                          key={`${r.id}-${feature}`}
                          className="rounded-lg bg-sky-50 px-2 py-1 text-[9px] font-bold text-sky-700 border border-sky-100/50 uppercase tracking-tight"
                        >
                          {feature}
                        </span>
                      ))}
                      {r.features.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400 self-center">
                          +{r.features.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesCatalogue;
