import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ticketApi from '../api/ticketApi';
import TicketComments from '../components/TicketComments';
import TicketCreateForm from '../components/TicketCreateForm';
import TicketStatusPill from '../components/TicketStatusPill';

const STAFF_ROLES = ['ADMIN', 'MANAGER', 'TECHNICIAN'];

const TicketCenter = ({ compact = false }) => {
  const { user } = useAuth();
  const role = (user?.role || '').toUpperCase();
  const isStaff = STAFF_ROLES.includes(role);
  const isTechnician = role === 'TECHNICIAN';
  const isAdmin = role === 'ADMIN';
  const canAssign = role === 'ADMIN';

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [acceptanceNote, setAcceptanceNote] = useState('');
  const [assignAssigneeId, setAssignAssigneeId] = useState('');
  const [assignDetails, setAssignDetails] = useState('');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = isTechnician
        ? await ticketApi.getAssignedToMe()
        : await ticketApi.getVisibleTickets();
      const rows = response.data || [];
      setTickets(rows);
      if (rows.length > 0 && !selectedTicketId) {
        setSelectedTicketId(rows[0].id);
      }
      if (rows.length === 0) {
        setSelectedTicketId(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [selectedTicketId, isTechnician]);

  const loadStaff = useCallback(async () => {
    if (!isStaff) return;
    try {
      const response = await ticketApi.getAssignableStaff();
      setStaff(response.data || []);
    } catch (error) {
      setStaff([]);
    }
  }, [isStaff]);

  const refreshTicketDetail = useCallback(async () => {
    if (!selectedTicketId) return;
    try {
      const response = await ticketApi.getTicketById(selectedTicketId);
      const updated = response.data;
      setTickets((prev) => prev.map((ticket) => (ticket.id === selectedTicketId ? updated : ticket)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to refresh ticket details');
    }
  }, [selectedTicketId]);

  useEffect(() => {
    loadTickets();
    loadStaff();
  }, [loadTickets, loadStaff]);

  useEffect(() => {
    setSelectedStatus('');
    setStatusMessage('');
    setAcceptanceNote('');
    setAssignAssigneeId(selectedTicket?.assignedToId ? String(selectedTicket.assignedToId) : '');
    setAssignDetails('');
  }, [selectedTicketId]);

  const onCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
  };

  const onAssign = async (ticketId, assigneeId, details = '') => {
    if (!assigneeId) return;
    try {
      await ticketApi.assignTicket(ticketId, Number(assigneeId));
      if (details.trim()) {
        await ticketApi.addComment(ticketId, `Admin assignment details: ${details.trim()}`);
      }
      await loadTickets();
      setAssignDetails('');
      toast.success('Ticket assigned');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const onUpdateStatus = async (ticketId, status, resolutionNotes = '') => {
    try {
      await ticketApi.updateStatus(ticketId, { status, resolutionNotes });
      await loadTickets();
      toast.success('Ticket status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const onReject = async (ticketId, reason) => {
    if (!reason?.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await ticketApi.rejectTicket(ticketId, reason.trim());
      await loadTickets();
      toast.success('Ticket rejected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject ticket');
    }
  };

  const cardHeight = compact ? 'max-h-[440px]' : 'max-h-[700px]';

  const technicianOptions = useMemo(
    () => staff.filter((member) => (member.role || '').toUpperCase() === 'TECHNICIAN'),
    [staff]
  );

  const assignmentDetailsText = useMemo(() => {
    const comments = selectedTicket?.comments || [];
    const note = [...comments]
      .reverse()
      .find((comment) => (comment.content || '').startsWith('Admin assignment details:'));
    if (!note) return '';
    return note.content.replace('Admin assignment details:', '').trim();
  }, [selectedTicket?.comments]);

  const acceptanceDetailsText = useMemo(() => {
    const comments = selectedTicket?.comments || [];
    const note = [...comments]
      .reverse()
      .find((comment) => (comment.content || '').startsWith('Technician acceptance note:'));
    if (!note) return '';
    return note.content.replace('Technician acceptance note:', '').trim();
  }, [selectedTicket?.comments]);

  const statusOptions = useMemo(() => {
    const current = selectedTicket?.status;
    if (!current) return [];

    const options = [];
    if (current === 'OPEN' && !isTechnician) options.push('IN_PROGRESS');
    if (current === 'IN_PROGRESS') options.push('RESOLVED');
    if (current === 'RESOLVED') options.push('CLOSED');
    if (isAdmin && current !== 'CLOSED' && current !== 'REJECTED') {
      options.push('REJECTED');
    }
    return options;
  }, [selectedTicket?.status, isAdmin, isTechnician]);

  const canTechnicianAccept = useMemo(() => {
    if (!isTechnician || !selectedTicket) return false;
    return (
      selectedTicket.status === 'OPEN' &&
      selectedTicket.assignedToUsername &&
      user?.username &&
      selectedTicket.assignedToUsername === user.username
    );
  }, [isTechnician, selectedTicket, user?.username]);

  const onAcceptRequest = async () => {
    if (!selectedTicket) return;

    try {
      await ticketApi.updateStatus(selectedTicket.id, { status: 'IN_PROGRESS' });
      if (acceptanceNote.trim()) {
        await ticketApi.addComment(selectedTicket.id, `Technician acceptance note: ${acceptanceNote.trim()}`);
      }
      await loadTickets();
      setAcceptanceNote('');
      toast.success('Request accepted and moved to IN_PROGRESS');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const onApplyStatus = async () => {
    if (!selectedTicket || !selectedStatus) return;

    if (selectedStatus === 'REJECTED') {
      await onReject(selectedTicket.id, statusMessage);
      setSelectedStatus('');
      setStatusMessage('');
      return;
    }

    let resolutionNotes = '';
    if (selectedStatus === 'RESOLVED') {
      if (!statusMessage.trim()) {
        toast.error('Resolution notes are required');
        return;
      }
      resolutionNotes = statusMessage;
    }

    await onUpdateStatus(selectedTicket.id, selectedStatus, resolutionNotes);
    setSelectedStatus('');
    setStatusMessage('');
  };

  return (
    <div className="space-y-5">
      {!isStaff && <TicketCreateForm onCreated={onCreated} />}

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className={`overflow-auto rounded-2xl border border-slate-200 bg-white p-3 ${cardHeight}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Tickets</h3>
            <button
              onClick={loadTickets}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
            >
              Refresh
            </button>
          </div>

          {loading && <p className="text-sm text-slate-500">Loading tickets...</p>}

          {!loading && tickets.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No tickets available.</p>
          )}

          <div className="space-y-2">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`w-full rounded-xl border p-3 text-left ${
                  ticket.id === selectedTicketId
                    ? 'border-sky-300 bg-sky-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-800">{ticket.ticketCode} - {ticket.title}</p>
                  <TicketStatusPill status={ticket.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{ticket.description}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Raised by: {ticket.raisedByName || ticket.raisedByUsername} | {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {!selectedTicket && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Select a ticket to view details.
            </div>
          )}

          {selectedTicket && (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-slate-800">{selectedTicket.ticketCode} - {selectedTicket.title}</h3>
                  <TicketStatusPill status={selectedTicket.status} />
                </div>

                <p className="mt-3 text-sm text-slate-700">{selectedTicket.description}</p>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs font-semibold text-slate-500">Category</p>
                    <p>{selectedTicket.category}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs font-semibold text-slate-500">Priority</p>
                    <p>{selectedTicket.priority}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="text-xs font-semibold text-slate-500">Reference</p>
                    <p>{selectedTicket.referenceId || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  <p>Raised by: {selectedTicket.raisedByName || selectedTicket.raisedByUsername}</p>
                  <p>Reviewed by: {selectedTicket.reviewedByName || selectedTicket.reviewedByUsername || 'Not reviewed yet'}</p>
                  <p>Assigned to: {selectedTicket.assignedToName || selectedTicket.assignedToUsername || 'Unassigned'}</p>
                  {assignmentDetailsText && <p>Assignment Details: {assignmentDetailsText}</p>}
                  {acceptanceDetailsText && <p>Acceptance Note: {acceptanceDetailsText}</p>}
                  {selectedTicket.resolutionNotes && <p>Resolution Notes: {selectedTicket.resolutionNotes}</p>}
                  {selectedTicket.rejectionReason && <p className="text-rose-700">Rejection Reason: {selectedTicket.rejectionReason}</p>}
                </div>

                {selectedTicket.attachmentUrls?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Evidence</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedTicket.attachmentUrls.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-slate-200">
                          <img src={url} alt="ticket evidence" className="h-32 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {isStaff && (
                  <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-2">
                    {canAssign && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assign Technician Request (Admin Approval)</p>
                        <select
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          value={assignAssigneeId}
                          onChange={(event) => setAssignAssigneeId(event.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {technicianOptions.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={assignDetails}
                          onChange={(event) => setAssignDetails(event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          rows={2}
                          placeholder="Add assignment request details for technician"
                        />
                        <button
                          onClick={() => onAssign(selectedTicket.id, assignAssigneeId, assignDetails)}
                          disabled={!assignAssigneeId}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve Assignment Request
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow Status</p>
                      {canTechnicianAccept && (
                        <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Assigned Request</p>
                          <p className="mt-1 text-sm text-blue-800">This ticket is assigned to you. Accept to start work.</p>
                          {assignmentDetailsText && (
                            <p className="mt-1 text-sm text-blue-900">Request Details: {assignmentDetailsText}</p>
                          )}
                          <textarea
                            value={acceptanceNote}
                            onChange={(event) => setAcceptanceNote(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm"
                            rows={2}
                            placeholder="Add acceptance note (optional)"
                          />
                          <button
                            onClick={onAcceptRequest}
                            className="mt-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Accept Request
                          </button>
                        </div>
                      )}

                      {isAdmin && selectedTicket.assignedToName && selectedTicket.status === 'IN_PROGRESS' && acceptanceDetailsText && (
                        <div className="mb-2 rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">✓ Technician Accepted</p>
                          <p className="mt-1 text-sm text-green-800">
                            {selectedTicket.assignedToName} has accepted the assignment request.
                          </p>
                          <p className="mt-2 text-sm text-green-900">Acceptance Note: {acceptanceDetailsText}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="min-w-52 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          value={selectedStatus}
                          onChange={(event) => {
                            setSelectedStatus(event.target.value);
                            setStatusMessage('');
                          }}
                        >
                          <option value="">Select next status</option>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={onApplyStatus}
                          disabled={!selectedStatus}
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Apply Status
                        </button>
                      </div>
                      {(selectedStatus === 'RESOLVED' || selectedStatus === 'REJECTED') && (
                        <div className="mt-2">
                          <p className="mb-1 text-xs font-medium text-slate-600">
                            {selectedStatus === 'RESOLVED' ? 'Resolution notes' : 'Rejection reason'}
                          </p>
                          <textarea
                            value={statusMessage}
                            onChange={(event) => setStatusMessage(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            rows={3}
                            placeholder={selectedStatus === 'RESOLVED' ? 'Type resolution notes' : 'Type rejection reason'}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <TicketComments
                ticket={selectedTicket}
                currentUser={user}
                isAdmin={isAdmin}
                onCommentsChanged={refreshTicketDetail}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCenter;
