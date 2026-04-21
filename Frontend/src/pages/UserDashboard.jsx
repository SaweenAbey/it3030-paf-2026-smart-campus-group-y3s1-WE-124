import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Cog,
  IdCard,
  LayoutGrid,
  LogOut,
  Mail,
  PencilLine,
  ShieldCheck,
  Tickets,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../api/bookingApi';
import TicketCenter from '../tickets/pages/TicketCenter';
import uni360Logo from '../assets/logo.png';

const TABS = [
  { key: 'dashboard', label: 'Overview', icon: LayoutGrid },
  { key: 'bookings', label: 'My Bookings', icon: CalendarCheck2 },
  { key: 'my-tickets', label: 'My Tickets', icon: Tickets },
  { key: 'profile', label: 'Profile', icon: UserRound },
  { key: 'settings', label: 'Settings', icon: Cog },
];

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const approved = bookings.filter((item) => item.status === 'APPROVED').length;
    const pending = bookings.filter((item) => item.status === 'PENDING').length;
    const rejected = bookings.filter((item) => item.status === 'REJECTED').length;
    const cancelled = bookings.filter((item) => item.status === 'CANCELLED').length;
    return { total, approved, pending, rejected, cancelled };
  }, [bookings]);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab]);

  useEffect(() => {
    const queryTab = new URLSearchParams(location.search).get('tab');
    const validTab = TABS.some((item) => item.key === queryTab);
    if (validTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [location.search]);

  const onSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`/dashboard?tab=${tabKey}`, { replace: true });
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    setBookingError('');
    try {
      const response = await getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      setBookingError('Failed to load bookings. Please try again.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const onCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.filter((item) => item.id !== bookingId));
    } catch (error) {
      window.alert('Failed to cancel booking. Please try again.');
    }
  };

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const renderDashboard = () => {
    const safeTotal = Math.max(bookingStats.total, 1);
    const chartData = [
      {
        name: 'Approved',
        count: bookingStats.approved,
        percent: Math.round((bookingStats.approved / safeTotal) * 100),
        color: 'bg-emerald-500',
      },
      {
        name: 'Pending',
        count: bookingStats.pending,
        percent: Math.round((bookingStats.pending / safeTotal) * 100),
        color: 'bg-amber-500',
      },
      {
        name: 'Rejected',
        count: bookingStats.rejected,
        percent: Math.round((bookingStats.rejected / safeTotal) * 100),
        color: 'bg-rose-500',
      },
      {
        name: 'Cancelled',
        count: bookingStats.cancelled,
        percent: Math.round((bookingStats.cancelled / safeTotal) * 100),
        color: 'bg-slate-500',
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Analytics</h2>
          <p className="text-slate-500">Overview of your booking activity and trends.</p>
        </div>

        {loadingBookings && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Loading analytics...
          </div>
        )}

        {!loadingBookings && bookingError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{bookingError}</div>
        )}

        {!loadingBookings && !bookingError && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Bookings</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{bookingStats.total}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <p className="text-sm text-emerald-700">Approved</p>
                <p className="mt-2 text-3xl font-bold text-emerald-800">{bookingStats.approved}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                <p className="text-sm text-amber-700">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-800">{bookingStats.pending}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
                <p className="text-sm text-rose-700">Rejected</p>
                <p className="mt-2 text-3xl font-bold text-rose-800">{bookingStats.rejected}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">Booking Status Graph</h3>
                <div className="mt-5 space-y-4">
                  {chartData.map((item) => (
                    <div key={item.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-semibold text-slate-700">{item.count} ({item.percent}%)</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-3 rounded-full ${item.color}`}
                          style={{ width: `${item.percent || 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">Recent Booking Details</h3>
                <div className="mt-4 space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">Booking #{booking.id}</p>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                          {booking.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(booking.startTime)} to {formatDateTime(booking.endTime)}
                      </p>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-sm text-slate-500">No booking records available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderBookings = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Bookings</h2>
          <p className="text-slate-500">Manage your booked resources.</p>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New Booking
        </button>
      </div>

      {loadingBookings && <p className="text-slate-600">Loading your bookings...</p>}
      {!loadingBookings && bookingError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{bookingError}</div>
      )}

      {!loadingBookings && !bookingError && bookings.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          No bookings yet.
        </div>
      )}

      {!loadingBookings && !bookingError && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-800">Booking #{booking.id}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {booking.status}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Start:</span> {formatDateTime(booking.startTime)}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">End:</span> {formatDateTime(booking.endTime)}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Purpose:</span> {booking.purpose || 'N/A'}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Attendees:</span> {booking.expectedAttendees || 'N/A'}
                </p>
              </div>
              {booking.status === 'PENDING' && (
                <button
                  onClick={() => onCancelBooking(booking.id)}
                  className="mt-4 rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-200"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyTickets = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Tickets</h2>
        <p className="mb-2 text-slate-500">Track existing issues and raise new support tickets.</p>
      </div>
      <TicketCenter compact />
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-7">
      <header>
        <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Security and Identity
        </span>
        <h2 className="mt-3 text-4xl font-black text-slate-900">Personal Profile</h2>
        <p className="mt-2 text-lg text-slate-500">Manage your digital campus identity and preferences</p>
      </header>

      <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-sm md:p-8">
        <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
          <div className="relative rounded-3xl bg-linear-to-br from-blue-500 to-blue-600 p-6 text-center text-white shadow-xl">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-3xl border border-white/40 bg-white/10 text-6xl font-bold shadow-inner">
              {(user?.name || 'U')
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
            </div>
            <span className="absolute -bottom-3 -right-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-white shadow-lg">
              <BadgeCheck size={24} />
            </span>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                <ShieldCheck size={14} /> Active
              </span>
              <button className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition hover:bg-slate-700">
                <PencilLine size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Institutional Role</p>
                <p className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                  <CircleUserRound size={18} className="text-blue-500" />
                  {user?.role || 'STUDENT'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reference ID</p>
                <p className="mt-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                  <IdCard size={18} className="text-blue-500" />
                  {(user?.username || 'IT-3030').toUpperCase()}-2026
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <CalendarDays size={15} className="text-blue-500" /> Member since 2024
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <ShieldCheck size={15} className="text-blue-500" /> Identity Verified
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-slate-700">
                <BarChart3 size={15} className="text-blue-500" /> Full Resource Access
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.name || 'Not provided'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Username</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.username || 'Not provided'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-1 flex items-center gap-2 font-semibold text-slate-800">
            <Mail size={16} className="text-blue-500" />
            {user?.email || 'Not provided'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.role || 'STUDENT'}</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Configure your account and dashboard preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Notification Preferences</h3>
          <p className="mt-1 text-sm text-slate-500">Email alerts for booking updates and ticket activity.</p>
          <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Manage Notifications
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Security Controls</h3>
          <p className="mt-1 text-sm text-slate-500">Update password and secure your account access.</p>
          <button className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Open Security Center
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'bookings') return renderBookings();
    if (activeTab === 'my-tickets') return renderMyTickets();
    if (activeTab === 'settings') return renderSettings();
    return renderProfile();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-slate-100 to-slate-200/70 p-3 sm:p-4 lg:p-5">
      <div className="flex min-h-[calc(100vh-24px)] flex-col gap-4 lg:flex-row">
        <aside
          className={`hidden rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur transition-all duration-300 lg:flex lg:flex-col ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <img src={uni360Logo} alt="UNI 360" className="h-10 w-10 rounded-full object-cover" />
              {!sidebarCollapsed && <p className="text-2xl font-black text-slate-900">Uni 360</p>}
            </div>
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              aria-label="Toggle sidebar"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                  {(user?.name || 'US')
                    .split(' ')
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">Student</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Online</p>
                </div>
              </div>
            </div>
          )}

          <nav className="mt-8 space-y-2">
            {TABS.map((tab) => {
              const selected = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => onSelectTab(tab.key)}
                  className={`flex w-full items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    selected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-300/50'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <TabIcon size={18} strokeWidth={2.2} />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          <button
            onClick={onLogout}
            className={`mt-auto flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 ${
              sidebarCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </aside>

        <main className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner sm:p-6 lg:p-8">
          <section className="mx-auto max-w-6xl">{renderContent()}</section>
        </main>
      </div>

      <main className="mx-auto mt-4 w-full lg:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <nav className="grid grid-cols-3 gap-2">
            {TABS.map((tab) => {
              const selected = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => onSelectTab(tab.key)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold ${
                    selected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
