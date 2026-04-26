import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const typeBadgeClass = (t) => {
  switch (t) {
    case 'SUCCESS':
      return 'bg-emerald-100 text-emerald-800';
    case 'WARNING':
      return 'bg-amber-100 text-amber-800';
    case 'ERROR':
      return 'bg-rose-100 text-rose-800';
    case 'REQUEST':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-sky-100 text-sky-800';
  }
};

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const rootRef = useRef(null);

  const unreadOnly = useMemo(() => notifications.filter((n) => !n.isRead), [notifications]);

  const refreshUnreadCount = async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      const count = Number(res.data?.unreadCount) || 0;
      
      setUnreadCount(count);
    } catch (e) {
      // silent: avoid spamming
    }
  };

  const refreshList = async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    try {
      const res = await notificationAPI.getMyNotifications(false);
      setNotifications(res.data || []);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    const id = window.setInterval(() => {
      refreshUnreadCount();
      if (open) {
        refreshList();
      }
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Instant updates when admin sends notifications (same tab + other tabs).
  useEffect(() => {
    const refreshNow = () => {
      refreshUnreadCount();
      if (open) {
        refreshList();
      }
    };

    const onRefreshEvent = () => refreshNow();
    window.addEventListener('uni360:notifications:refresh', onRefreshEvent);

    let bc;
    try {
      bc = new BroadcastChannel('uni360-notifications');
      bc.onmessage = (msg) => {
        if (msg?.data?.type === 'refresh') {
          refreshNow();
        }
      };
    } catch (_) {
      bc = null;
    }

    return () => {
      window.removeEventListener('uni360:notifications:refresh', onRefreshEvent);
      try {
        bc?.close?.();
      } catch (_) {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    refreshUnreadCount();
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const handleBellClick = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setOpen((v) => !v);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      // Keep other tabs in sync.
      try {
        const bc = new BroadcastChannel('uni360-notifications');
        bc.postMessage({ type: 'refresh' });
        bc.close();
      } catch (_) {
        // ignore
      }
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');

      // Keep other tabs in sync.
      try {
        const bc = new BroadcastChannel('uni360-notifications');
        bc.postMessage({ type: 'refresh' });
        bc.close();
      } catch (_) {
        // ignore
      }
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={handleBellClick}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-slate-600 transition duration-300 hover:bg-white/30 hover:text-slate-900 hover:border-white/50 backdrop-blur-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
          <path d="M14.5 18a2.5 2.5 0 0 1-5 0" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M18 9.5a6 6 0 1 0-12 0c0 6-2 6-2 7.5h16c0-1.5-2-1.5-2-7.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex flex-col border-b border-slate-100 bg-linear-to-b from-slate-50 to-white px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Notifications</h3>
              <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-700 uppercase tracking-wider">
                {unreadCount} New
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Latest Activity
              </p>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="group flex items-center gap-1.5 text-[10px] font-black text-sky-600 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 transition-transform group-hover:scale-110" stroke="currentColor" strokeWidth="3">
                   <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Mark all as read
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-sm text-slate-600">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No notifications yet.</div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl border p-3 transition ${
                      n.isRead ? 'border-slate-200 bg-white' : 'border-sky-200 bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">{n.title}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${typeBadgeClass(n.type)}`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{formatTime(n.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        {n.actionUrl && (
                          <Link
                            to={n.actionUrl}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                            onClick={() => setOpen(false)}
                          >
                            Open
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(n.id)}
                            className="rounded-lg bg-sky-600 px-2.5 py-1.5 font-semibold text-white hover:bg-sky-700"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unreadOnly.length > 0 && (
            <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
              Tip: click a notification to open its action link if provided.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

