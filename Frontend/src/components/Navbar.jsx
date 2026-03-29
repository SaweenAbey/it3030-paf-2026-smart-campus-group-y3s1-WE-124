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
      <style>{`
        @supports (backdrop-filter: blur(20px)) {
          .glass-navbar {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        }
        @supports not (backdrop-filter: blur(20px)) {
          .glass-navbar {
            background: rgba(255, 255, 255, 0.95);
          }
        }
      `}</style>
      
      <div className="glass-navbar mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-full border border-white/40 px-3 shadow-2xl sm:px-4 transition-all duration-300 hover:border-white/60 hover:shadow-3xl">
        <Link to="/" className="flex items-center gap-2 pl-1 transition-transform duration-200 hover:scale-105">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-900 to-sky-500 shadow-lg ring-2 ring-sky-400/30">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <span className="hidden text-base font-semibold bg-gradient-to-r from-sky-900 to-sky-600 bg-clip-text text-transparent sm:block">UNI 360</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1 md:flex backdrop-blur-sm">
          {navLinks.map((item) => {
            const requiresAuth = item.to.startsWith('/dashboard');
            const target = !isAuthenticated() && requiresAuth ? '/login' : item.to;
            const active = isActive(item.to);

            return (
              <Link
                key={item.label}
                to={target}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                  active 
                    ? 'bg-white/40 text-slate-900 shadow-lg backdrop-blur-md border border-white/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/20 border border-transparent'
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-slate-600 transition duration-300 hover:bg-white/30 hover:text-slate-900 hover:border-white/50 backdrop-blur-sm"
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
              {['ADMIN', 'TEACHER', 'TECHNICIAN'].includes(user?.role) && (
                <Link
                  to="/notifications/create"
                  className="hidden rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition duration-300 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl border border-white/20 backdrop-blur-sm sm:block"
                >
                  📢 Notify
                </Link>
              )}
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition duration-300 hover:bg-white/30 hover:text-slate-900 border border-white/30 backdrop-blur-sm hover:border-white/50 sm:block"
              >
                {user?.name?.split(' ')[0] || 'Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-slate-600 transition duration-300 hover:border-red-300/60 hover:bg-red-500/10 hover:text-red-600 backdrop-blur-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition duration-300 hover:bg-white/30 hover:text-slate-900 border border-white/30 backdrop-blur-sm hover:border-white/50"
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
