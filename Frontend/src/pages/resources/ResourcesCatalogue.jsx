import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI } from '../../services/api';

const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture hall' },
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

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    minCapacity: '',
    location: '',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    capacity: '',
    location: '',
    availabilityStartTime: '',
    availabilityEndTime: '',
    status: 'ACTIVE',
  });

  const isAdminOrManager = user && (user.role === 'ADMIN' || user.role === 'MANAGER');

  useEffect(() => {
    fetchAllResources();
  }, []);

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

  const handleResetFilters = () => {
    setFilters({ type: '', status: '', minCapacity: '', location: '' });
    fetchAllResources();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (formData.availabilityStartTime && formData.availabilityEndTime) {
      if (formData.availabilityEndTime <= formData.availabilityStartTime) {
        toast.error('End time must be after start time');
        return false;
      }
    }
    return true;
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        capacity: parseInt(formData.capacity, 10),
        location: formData.location.trim(),
        availabilityStartTime: formData.availabilityStartTime || null,
        availabilityEndTime: formData.availabilityEndTime || null,
        status: formData.status,
      };

      await resourceAPI.create(payload);
      toast.success('Resource created successfully');
      setFormData({
        name: '',
        description: '',
        type: '',
        capacity: '',
        location: '',
        availabilityStartTime: '',
        availabilityEndTime: '',
        status: 'ACTIVE',
      });
      setFormOpen(false);
      fetchAllResources();
    } catch (error) {
      console.error('Error creating resource', error);
      const message = error.response?.data?.message || 'Failed to create resource';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Facilities & Assets Catalogue</h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse campus lecture halls, labs, rooms, and equipment. Use filters to find the right resource.
            </p>
          </div>

          {isAdminOrManager && (
            <button
              type="button"
              onClick={() => setFormOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {formOpen ? 'Close form' : 'Add resource'}
            </button>
          )}
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
        {isAdminOrManager && formOpen && (
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Available from</label>
                <input
                  type="time"
                  name="availabilityStartTime"
                  value={formData.availabilityStartTime}
                  onChange={handleFormChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Available until</label>
                <input
                  type="time"
                  name="availabilityEndTime"
                  value={formData.availabilityEndTime}
                  onChange={handleFormChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  disabled={saving}
                />
              </div>

              <div className="mt-2 flex items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save resource'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resources table */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loading
                ? 'Loading resources...'
                : `${resources.length} resource${resources.length === 1 ? '' : 's'} found`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Type</th>
                  <th className="px-4 py-2 font-semibold">Capacity</th>
                  <th className="px-4 py-2 font-semibold">Location</th>
                  <th className="px-4 py-2 font-semibold">Availability</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading && resources.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                      No resources found. Try adjusting your filters{isAdminOrManager ? ' or add a new resource.' : '.'}
                    </td>
                  </tr>
                )}

                {resources.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-2 align-top">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      {r.description && (
                        <div className="mt-0.5 text-xs text-slate-500 line-clamp-2">{r.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {r.type?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top">{r.capacity ?? '—'}</td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600 max-w-xs">
                      {r.location || '—'}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {r.availabilityStartTime && r.availabilityEndTime
                        ? `${r.availabilityStartTime} – ${r.availabilityEndTime}`
                        : 'Not specified'}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          r.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.status?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesCatalogue;
