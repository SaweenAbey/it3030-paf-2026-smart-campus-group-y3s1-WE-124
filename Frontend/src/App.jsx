import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ManagerLogin from './pages/ManagerLogin';
import RoleSelector from './pages/RoleSelector';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Bookings from './pages/Bookings';
import NotificationCreate from './pages/NotificationCreate';
import Services from './pages/Services';
import ResourcesCatalogue from './pages/resources/ResourcesCatalogue';

const getDefaultRouteByRole = (role) => {
  const normalizedRole = (role || '').toUpperCase();
  return ['STUDENT', 'USER'].includes(normalizedRole)
    ? '/dashboard?tab=profile'
    : '/dashboard';
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#38bdf8] border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#38bdf8] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin-login" />;
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'TECHNICIAN') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Manager Protected Route Component
const ManagerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#38bdf8] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/manager-login" />;
  }

  if (user?.role !== 'MANAGER') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#38bdf8] border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated()
    ? <Navigate to={getDefaultRouteByRole(user?.role)} replace />
    : children;
};

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/admin-login', '/manager-login', '/signup', '/role-selector'].includes(location.pathname);

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/role-selector" element={<RoleSelector />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourcesCatalogue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager-dashboard"
          element={
            <ManagerProtectedRoute>
              <ManagerDashboard />
            </ManagerProtectedRoute>
          }
        />
        <Route
          path="/notifications/create"
          element={
            <ProtectedRoute>
              <NotificationCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/adminlog"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/manager-login"
          element={
            <PublicRoute>
              <ManagerLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </Router>
  );
}

export default App;
