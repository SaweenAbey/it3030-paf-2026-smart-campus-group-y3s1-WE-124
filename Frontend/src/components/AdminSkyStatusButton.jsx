/**
 * Minimal white + sky-blue status control for the admin dashboard.
 * Uiverse-style shine and corner frames; labels show the action on click.
 */
const AdminSkyStatusButton = ({ active, disabled, busy, onToggle }) => {
  const enabling = !active;
  const label = busy ? 'Saving…' : enabling ? 'Enable' : 'Disable';

  const accent = enabling ? '#e0f2fe' : '#bae6fd';
  const bgClass = enabling
    ? 'bg-gradient-to-br from-sky-500 via-sky-500 to-sky-600'
    : 'bg-gradient-to-br from-sky-800 via-slate-700 to-sky-900';

  if (disabled) {
    return (
      <span className="inline-flex rounded-lg border border-dashed border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-400">
        You
      </span>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Disable account' : 'Enable account'}
      disabled={busy}
      onClick={onToggle}
      className={`${bgClass} relative inline-flex min-w-[7.5rem] cursor-pointer justify-center overflow-hidden rounded-lg border border-white/25 px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-transform duration-300 ease-in-out outline-offset-4 focus:outline focus:outline-2 focus:outline-sky-300 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 group`}
    >
      <span className="relative z-20">{label}</span>

      <span
        className="absolute left-[-75%] top-0 z-10 h-full w-[50%] rotate-12 bg-white/30 blur-lg transition-all duration-1000 ease-in-out group-hover:left-[125%]"
        aria-hidden
      />

      <span
        style={{ borderColor: accent }}
        className="absolute left-0 top-0 z-[5] block h-[20%] w-1/2 rounded-tl-lg border-l-2 border-t-2 opacity-95 transition-all duration-300"
        aria-hidden
      />
      <span
        style={{ borderColor: accent }}
        className="absolute right-0 top-0 z-[5] block h-[60%] w-1/2 rounded-tr-lg border-r-2 border-t-2 opacity-95 transition-all duration-300 group-hover:h-[85%]"
        aria-hidden
      />
      <span
        style={{ borderColor: accent }}
        className="absolute bottom-0 left-0 z-[5] block h-[60%] w-1/2 rounded-bl-lg border-b-2 border-l-2 opacity-95 transition-all duration-300 group-hover:h-[85%]"
        aria-hidden
      />
      <span
        style={{ borderColor: accent }}
        className="absolute bottom-0 right-0 z-[5] block h-[20%] w-1/2 rounded-br-lg border-b-2 border-r-2 opacity-95 transition-all duration-300"
        aria-hidden
      />
    </button>
  );
};

export default AdminSkyStatusButton;
