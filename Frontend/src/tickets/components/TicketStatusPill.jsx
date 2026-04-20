const STATUS_COLOR = {
  OPEN: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-200 text-slate-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const TicketStatusPill = ({ status }) => {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[status] || 'bg-slate-100 text-slate-700'}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default TicketStatusPill;
