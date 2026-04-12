import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';



const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userInitials = (user?.name || user?.username || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const profileImageUrl = (user?.profileImageUrl || '').trim();
  const hasProfileImage = /^https?:\/\//i.test(profileImageUrl);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'All Resources', to: '/resources' },
    { label: 'Bookings', to: '/bookings' },
    { label: 'Services', to: '/services' },
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
           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-sky-900 to-sky-500 shadow-lg ring-2 ring-sky-400/30">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <span className="hidden text-base font-semibold bg-linear-to-r from-sky-900 to-sky-600 bg-clip-text text-transparent sm:block">UNI 360</span>
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
          <NotificationBell />

          {isAuthenticated() ? (
            <>
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                className="hidden items-center gap-2 rounded-full border border-white/30 px-2.5 py-1.5 text-sm font-medium text-slate-600 transition duration-300 hover:bg-white/30 hover:text-slate-900 backdrop-blur-sm hover:border-white/50 sm:flex"
              >
                {hasProfileImage ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-white/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-sky-700 to-blue-500 text-xs font-bold text-white">
                    {userInitials || 'U'}
                  </span>
                )}
                <span className="max-w-24 truncate">{user?.name?.split(' ')[0] || 'Profile'}</span>
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
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-slate-800 border border-slate-900/10"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
