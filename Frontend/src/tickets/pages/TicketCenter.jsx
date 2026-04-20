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
  const isAdmin = role === 'ADMIN';
  const canAssign = role === 'ADMIN' || role === 'MANAGER';

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
    [tickets, selectedTicketId]
  );

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ticketApi.getVisibleTickets();
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
  }, [selectedTicketId]);

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

  const onCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
  };

  const onAssign = async (ticketId, assigneeId) => {
    if (!assigneeId) return;
    try {
      await ticketApi.assignTicket(ticketId, Number(assigneeId));
      await loadTickets();
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

  const onReject = async (ticketId) => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason?.trim()) return;
    try {
      await ticketApi.rejectTicket(ticketId, reason.trim());
      await loadTickets();
      toast.success('Ticket rejected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject ticket');
    }
  };

  const cardHeight = compact ? 'max-h-[440px]' : 'max-h-[700px]';

  return (
    <div className="space-y-5">
      <TicketCreateForm onCreated={onCreated} />

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
                  <p>Assigned to: {selectedTicket.assignedToName || selectedTicket.assignedToUsername || 'Unassigned'}</p>
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assign technician/staff</p>
                        <select
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          value={selectedTicket.assignedToId || ''}
                          onChange={(event) => onAssign(selectedTicket.id, event.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workflow Status</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                          className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          Set IN_PROGRESS
                        </button>
                        <button
                          onClick={() => {
                            const notes = window.prompt('Resolution notes');
                            if (notes === null) return;
                            onUpdateStatus(selectedTicket.id, 'RESOLVED', notes);
                          }}
                          className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          Set RESOLVED
                        </button>
                        <button
                          onClick={() => onUpdateStatus(selectedTicket.id, 'CLOSED')}
                          className="rounded-md bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          Set CLOSED
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onReject(selectedTicket.id)}
                            className="rounded-md bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                          >
                            Reject
                          </button>
                        )}
                      </div>
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
