import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import mediaUpload from '../../utils/mediaUpload';
import ticketApi from '../api/ticketApi';
import api from '../../services/api';

const TicketCreateForm = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [referenceId, setReferenceId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState('');

  const loadAvailableResources = useCallback(async () => {
    setLoadingResources(true);
    try {
      const response = await api.get('/resources/available');
      setResources(response.data || []);
    } catch (error) {
      toast.error('Failed to load available resources');
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  }, []);

  useEffect(() => {
    if (category === 'RESOURCE') {
      loadAvailableResources();
    }
  }, [category, loadAvailableResources]);

  const handleResourceSelect = (event) => {
    const resourceId = event.target.value;
    setSelectedResourceId(resourceId);
    setReferenceId(resourceId);
  };

  const onFileSelect = (event) => {
    const selected = Array.from(event.target.files || []);
    
    if (selected.length > 3) {
      toast.error('Maximum 3 attachments allowed');
      event.target.value = ''; // Reset input
      setFiles([]);
      return;
    }

    // Validate file types and sizes (e.g., max 5MB per image)
    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image`);
        event.target.value = '';
        setFiles([]);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit`);
        event.target.value = '';
        setFiles([]);
        return;
      }
    }
    
    setFiles(selected);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('OTHER');
    setReferenceId('');
    setPriority('MEDIUM');
    setFiles([]);
    setSelectedResourceId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || title.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }

    if (!description.trim() || description.trim().length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    if (category === 'RESOURCE' && !selectedResourceId) {
      toast.error('Please select a resource');
      return;
    }

    if (files.length === 0) {
      toast.error('Please attach at least 1 evidence image (max 3)');
      return;
    }

    setSubmitting(true);
    try {
      let attachmentUrls = [];
      if (files.length > 0) {
        attachmentUrls = await Promise.all(files.map((file) => mediaUpload(file)));
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        referenceId: referenceId.trim() || null,
        priority,
        attachmentUrls,
      };

      const response = await ticketApi.createTicket(payload);
      toast.success('Ticket raised successfully');
      resetForm();
      onCreated?.(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Raise Incident Ticket</h3>
        <p className="mt-1 text-sm text-slate-500">Add resource, booking, or other issue details with up to 3 evidence images.</p>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        placeholder="Title"
        maxLength={180}
      />

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        placeholder="Describe the issue"
        maxLength={3000}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="RESOURCE">RESOURCE</option>
          <option value="BOOKING">BOOKING</option>
          <option value="OTHER">OTHER</option>
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        {category === 'RESOURCE' ? (
          <select
            value={selectedResourceId}
            onChange={handleResourceSelect}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={loadingResources}
          >
            <option value="">Select Available Resource</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name} (ID: {resource.id})
              </option>
            ))}
          </select>
        ) : (
          <input
            value={referenceId}
            onChange={(event) => setReferenceId(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Reference ID (resource/booking)"
            maxLength={120}
          />
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">Evidence Images (max 3)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFileSelect}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {files.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">Selected: {files.map((file) => file.name).join(', ')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Create Ticket'}
      </button>
    </form>
  );
};

export default TicketCreateForm;
