import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI } from '../../services/api';
import mediaUpload from '../../utils/mediaUpload';

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

const ResourcesCatalogue = () => {
  const { user } = useAuth();
  const location = useLocation();

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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-sky-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Facilities & Assets Catalogue</h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse campus lecture halls, labs, rooms, and equipment. Use filters to find the right resource.
            </p>
          </div>

        </div>

        {/* Filters */}
        <form
          onSubmit={handleSearch}
          className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">All types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Any status</option>
              {RESOURCE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Min. capacity</label>
            <input
              type="number"
              name="minCapacity"
              min="1"
              value={filters.minCapacity}
              onChange={handleFilterChange}
              placeholder="e.g. 30"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Building or campus"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex items-end gap-2 lg:justify-end">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 lg:flex-none"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:flex-none"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Add resource form */}
        {isManager && formOpen && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Add new resource</h2>
            <p className="mb-4 text-xs text-slate-500">Only admins and managers can create or modify resources.</p>

            <form onSubmit={handleCreateResource} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Main Auditorium A1"
                  maxLength={150}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Optional details about equipment, layout, or notes."
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Resource image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelected}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                  disabled={saving}
                />
                <p className="text-xs text-slate-500">Upload a photo for lecture hall or library hall resources.</p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Selected resource preview"
                    className="h-36 w-full max-w-md rounded-lg border border-slate-200 object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                >
                  <option value="">Select type</option>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleFormChange}
                  placeholder="e.g. 80"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="e.g. New Engineering Building, Level 3"
                  maxLength={255}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                >
                  {RESOURCE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (uploadingImage ? 'Uploading image...' : 'Saving...') : 'Save resource'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loading
                ? 'Loading resources...'
                : `${resources.length} resource${resources.length === 1 ? '' : 's'} found`}
            </p>
          </div>

          {!loading && resources.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No resources found. Try adjusting your filters.
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => (
              <article
                key={r.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-100">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name ? `${r.name} resource` : 'Resource image'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No image</div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{r.name || 'Unnamed resource'}</h3>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {r.status?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>

                  <p className="min-h-10 line-clamp-2 text-sm leading-6 text-slate-600">{r.description || 'No description provided.'}</p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                    <p className="rounded-xl bg-slate-50 px-3 py-2">
                      <span className="font-semibold text-slate-700">Type:</span> {r.type?.replace(/_/g, ' ') || '—'}
                    </p>
                    <p className="rounded-xl bg-slate-50 px-3 py-2">
                      <span className="font-semibold text-slate-700">Capacity:</span> {r.capacity ?? '—'}
                    </p>
                    <p className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="font-semibold text-slate-700">Location:</span> {r.location || '—'}
                    </p>
                    {r.availabilityDurationMinutes && (
                      <p className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                        <span className="font-semibold text-slate-700">Duration:</span> {r.availabilityDurationMinutes} minutes
                      </p>
                    )}
                    {r.features && r.features.length > 0 && (
                      <div className="col-span-2 flex flex-wrap gap-2 pt-1">
                        {r.features.slice(0, 3).map((feature) => (
                          <span
                            key={`${r.id}-${feature}`}
                            className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700"
                          >
                            {feature}
                          </span>
                        ))}
                        {r.features.length > 3 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            +{r.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedResource(r)}
                    className="w-full rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">Resource Detail</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{selectedResource.name || 'Resource'}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="grid max-h-[calc(90vh-92px)] gap-6 overflow-y-auto p-5 md:grid-cols-[1.1fr_1fr]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {selectedResource.imageUrl ? (
                  <img
                    src={selectedResource.imageUrl}
                    alt={selectedResource.name ? `${selectedResource.name} image` : 'Resource image'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-65 items-center justify-center text-sm text-slate-400">No image available</div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overview</p>
                  <p className="mt-2 text-sm text-slate-700">{selectedResource.description || 'No description provided.'}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedResource.type?.replace(/_/g, ' ') || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Capacity</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedResource.capacity ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedResource.location || '—'}</p>
                  </div>
                  {selectedResource.availabilityDurationMinutes && (
                    <div className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedResource.availabilityDurationMinutes} minutes</p>
                    </div>
                  )}
                </div>

                {selectedResource.features && selectedResource.features.length > 0 && (
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Features</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedResource.features.map((feature) => (
                        <span
                          key={`${selectedResource.id}-${feature}`}
                          className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesCatalogue;
