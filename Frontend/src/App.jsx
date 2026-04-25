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
import BookingDashboard from './pages/BookingDashboard';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import NotificationCreate from './pages/NotificationCreate';
import Services from './pages/Services';
import ResourcesCatalogue from './pages/resources/ResourcesCatalogue';
import Support from './pages/Support';
import ReviewSubmitPage from './pages/ReviewSubmitPage';
import ReviewSubmittedPage from './pages/ReviewSubmittedPage';
import ChatbotFloatingButton from './chatbot/ChatbotFloatingButton';
import TicketCenter from './tickets/pages/TicketCenter';

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

// Restricted Route for Managers and Technicians
const RestrictedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#38bdf8] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const userRole = (user?.role || '').toUpperCase();
  if (userRole === 'MANAGER' || userRole === 'TECHNICIAN') {
    return <Navigate to={getDefaultRouteByRole(user?.role)} />;
  }

  return children;
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
        <Route
          path="/bookings"
          element={
            <RestrictedRoute>
              <BookingDashboard />
            </RestrictedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourcesCatalogue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:resourceId"
          element={
            <ProtectedRoute>
              <ResourceDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/services" 
          element={
            <RestrictedRoute>
              <Services />
            </RestrictedRoute>
          } 
        />
        <Route path="/support" element={<Support />} />
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
          path="/support/review"
          element={
            <ProtectedRoute>
              <ReviewSubmitPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/review-submitted"
          element={
            <ProtectedRoute>
              <ReviewSubmittedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-6 rounded-3xl bg-linear-to-r from-slate-900 to-slate-700 p-6 text-white shadow-2xl md:p-8">
                    <h1 className="text-3xl font-bold md:text-4xl">Incident Ticket Center</h1>
                    <p className="mt-2 text-sm text-slate-200">Track issue workflow: OPEN to IN_PROGRESS to RESOLVED to CLOSED</p>
                  </div>
                  <TicketCenter />
                </div>
              </div>
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
      <ChatbotFloatingButton />
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
