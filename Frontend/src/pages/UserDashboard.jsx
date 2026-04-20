import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck2,
  CirclePlus,
  LogOut,
  Tickets,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../api/bookingApi';
import TicketCenter from '../tickets/pages/TicketCenter';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'bookings', label: 'My Bookings', icon: CalendarCheck2 },
  { key: 'raise-ticket', label: 'Raise Tickets', icon: CirclePlus },
  { key: 'my-tickets', label: 'My Tickets', icon: Tickets },
  { key: 'profile', label: 'Profile', icon: UserRound },
];

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
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

  const renderRaiseTickets = () => (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Raise Tickets</h2>
      <p className="mb-5 text-slate-500">Create a new support request for campus services.</p>
      <TicketCenter compact />
    </div>
  );

  const renderMyTickets = () => (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">My Tickets</h2>
      <p className="mb-5 text-slate-500">Track status and updates on your existing tickets.</p>
      <TicketCenter compact />
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
        <p className="text-slate-500">Your account details.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.name || 'Not provided'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Username</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.username || 'Not provided'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.email || 'Not provided'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-1 font-semibold text-slate-800">{user?.role || 'STUDENT'}</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') return renderDashboard();
    if (activeTab === 'bookings') return renderBookings();
    if (activeTab === 'raise-ticket') return renderRaiseTickets();
    if (activeTab === 'my-tickets') return renderMyTickets();
    return renderProfile();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">UNI360</p>
            <h1 className="text-3xl font-bold text-slate-900">User Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.name || 'User'}.</p>
          </div>
          <button
            onClick={onLogout}
            className="hidden items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 lg:inline-flex"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-fit">
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const selected = activeTab === tab.key;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      selected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <TabIcon size={18} strokeWidth={2.2} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={onLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 lg:hidden"
            >
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            {renderContent()}
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
