import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Bookings', to: '/bookings' },
    { label: 'Services', to: '/dashboard' },
    { label: 'Support', to: '/dashboard?tab=activity' },
  ];

  const isActive = (to) => {
    if (to.includes('?')) {
      return `${location.pathname}${location.search}` === to;
    }

    if (to === '/dashboard') {
      return location.pathname === '/dashboard';
    }

    return location.pathname === to;
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-800">Are you sure you want to logout?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              logout();
              toast.success('Logged out successfully');
              navigate('/login');
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <nav className="sticky top-3 z-50 px-4 sm:px-6">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-full border border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur sm:px-4">
        <Link to="/" className="flex items-center gap-2 pl-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-900 to-sky-500">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <span className="hidden text-base font-semibold text-slate-900 sm:block">UNI 360</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex">
          {navLinks.map((item) => {
            const requiresAuth = item.to.startsWith('/dashboard');
            const target = !isAuthenticated() && requiresAuth ? '/login' : item.to;
            const active = isActive(item.to);

            return (
              <Link
                key={item.label}
                to={target}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
              <path d="M14.5 18a2.5 2.5 0 0 1-5 0" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M18 9.5a6 6 0 1 0-12 0c0 6-2 6-2 7.5h16c0-1.5-2-1.5-2-7.5Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isAuthenticated() ? (
            <>
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:block"
              >
                {user?.name?.split(' ')[0] || 'Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
              
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
