import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userInitials = (user?.name || user?.username || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  
  const profileImageUrl = (user?.profileImageUrl || '').trim();
  const hasProfileImage = /^https?:\/\//i.test(profileImageUrl);

  const baseLinks = [
    { label: 'Home', to: '/' },
    { label: 'Resources', to: '/resources' },
    { label: 'Booking', to: '/bookings' },
    { label: 'Services', to: '/services' },
    { label: 'Support', to: '/support' },
  ];

  const navLinks = baseLinks;

  const isActive = (to) => {
    if (to.includes('?')) {
      return `${location.pathname}${location.search}` === to;
    }
    if (to === '/bookings' && location.pathname.startsWith('/bookings')) return true;
    if (to === '/resources' && location.pathname.startsWith('/resources')) return true;
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === to;
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-sm">Are you sure you want to logout?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-100 text-slate-600">Cancel</button>
          <button onClick={() => { toast.dismiss(t.id); logout(); toast.success('Logged out'); navigate('/'); }} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-rose-600 text-white">Logout</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'top-0 px-0' : 'top-3 px-4 sm:px-6'}`}>
      <style>{`
        @supports (backdrop-filter: blur(20px)) {
          .glass-navbar {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        }
      `}</style>
      
      <div className={`glass-navbar mx-auto flex h-16 w-full items-center justify-between border-white/40 shadow-2xl transition-all duration-500 ${
        scrolled 
          ? 'max-w-full rounded-none border-b px-6 sm:px-12' 
          : 'max-w-7xl rounded-full border px-3 sm:px-4'
      }`}>
        <Link to="/" className="flex items-center gap-2 pl-1 transition-transform duration-200 hover:scale-105">
           <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-slate-900 to-slate-600 shadow-lg ring-2 ring-white/30">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <span className="hidden text-base font-black bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent sm:block tracking-tighter">UNI 360</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 rounded-full border border-white/30 bg-white/10 p-1 md:flex backdrop-blur-md">
          {navLinks.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-widest transition duration-300 ${
                  active 
                    ? 'bg-slate-900 text-white shadow-xl' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="hidden items-center gap-2 sm:flex">
            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => navigate('/dashboard?tab=profile')}
                  className="flex items-center gap-2 rounded-full border border-white/30 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition duration-300 hover:bg-white/40 hover:text-slate-900"
                >
                  {hasProfileImage ? (
                    <img src={profileImageUrl} alt="Profile" className="h-6 w-6 rounded-full border border-white/50 object-cover" />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-white">{userInitials}</span>
                  )}
                  <span className="max-w-24 truncate">{user?.name?.split(' ')[0]}</span>
                </button>
                <button onClick={handleLogout} className="rounded-full border border-white/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition duration-300 hover:bg-rose-50 hover:text-rose-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900">Sign In</Link>
                <Link to="/signup" className="rounded-full bg-slate-900 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-slate-800 transition-all">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 md:hidden transition-transform active:scale-90"
          >
            <div className="flex flex-col gap-1.5 w-5 items-end">
              <motion.div animate={mobileMenuOpen ? { rotate: 45, y: 6, width: "100%" } : { rotate: 0, y: 0, width: "100%" }} className="h-0.5 bg-slate-900 rounded-full" />
              <motion.div animate={mobileMenuOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }} className="h-0.5 bg-slate-900 w-3/4 rounded-full" />
              <motion.div animate={mobileMenuOpen ? { rotate: -45, y: -6, width: "100%" } : { rotate: 0, y: 0, width: "100%" }} className="h-0.5 bg-slate-900 rounded-full" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 z-40 flex flex-col gap-2 rounded-[2rem] border border-white/40 bg-white/90 p-4 shadow-3xl backdrop-blur-xl md:hidden"
          >
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all ${
                  isActive(item.to) ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2">
              {!isAuthenticated() ? (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 bg-slate-50 rounded-2xl">Login Account</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">Create Identity</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard?tab=profile" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 bg-slate-50 rounded-2xl">My Profile</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 rounded-2xl">Termination Session</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
