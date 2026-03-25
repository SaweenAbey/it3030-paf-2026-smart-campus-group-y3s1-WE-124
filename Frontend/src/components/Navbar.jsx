import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-sky-900 to-sky-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-sky-900 font-semibold text-lg hidden sm:block">UNI 360</span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <div className="hidden sm:flex items-center gap-3 pr-3 border-r border-slate-200">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user?.name}
                      className="w-10 h-10 rounded-2xl object-cover border-2 border-sky-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-sky-900 to-sky-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium text-sky-900">{user?.name}</div>
                    <div className="text-slate-400 text-xs">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard?tab=profile')}
                  className="px-4 py-2 rounded-lg text-slate-500 hover:text-sky-900 hover:bg-slate-50 transition-all text-sm font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-50 transition-all text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-slate-500 hover:text-sky-900 hover:bg-slate-50 transition-all text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-linear-to-r from-sky-900 to-sky-500 text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
