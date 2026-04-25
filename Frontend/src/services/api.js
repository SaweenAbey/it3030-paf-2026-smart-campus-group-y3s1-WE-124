import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const authRoutes = ['/login', '/admin-login', '/manager-login', '/signup', '/role-selector'];
      const isOnAuthRoute = authRoutes.includes(window.location.pathname);
      if (!isOnAuthRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyOtp: (otpPayload) => api.post('/auth/verify-otp', otpPayload),
  googleAuth: (payload) => api.post('/auth/google', payload),
  register: (userData) => api.post('/auth/register', userData),
  validateToken: () => api.get('/auth/validate'),
  logout: () => api.post('/auth/logout'),
};

// User API calls
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  getAllUsers: () => api.get('/users/all'),
  getCurrentUser: () => api.get('/users/me'),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  getActiveUsers: () => api.get('/users/active'),
  getPendingTutors: () => api.get('/users/pending-tutors'),
  approveTutor: (id) => api.patch(`/users/approve-tutor/${id}`),
  getPendingStudents: () => api.get('/users/pending-students'),
  approveStudent: (id) => api.patch(`/users/approve-student/${id}`),
  updateProfileImage: (id, profileImageUrl) => api.patch(`/users/${id}/image`, { profileImageUrl }),
  deleteProfileImage: (id) => api.delete(`/users/${id}/image`),
  createAdminUser: (userData) => api.post('/users/create-admin-user', userData),
  updateActiveStatus: (id, isActive) =>
    api.patch(`/users/status/${id}`, null, { params: { isActive } }),
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats'),
  createManager: (userData) => api.post('/admin/create-manager', userData),
  getAllManagers: () => api.get('/admin/managers'),
  updateManagerStatus: (id, isActive) =>
    api.patch(`/admin/manager/${id}/status`, null, { params: { isActive } }),
  deleteManager: (id) => api.delete(`/admin/manager/${id}`),
};

// Notification API calls
export const notificationAPI = {
  getAllForAdmin: () => api.get('/notifications/admin/all'),
  getMyNotifications: (unreadOnly = false) => api.get('/notifications/me', { params: { unreadOnly } }),
  getUnreadCount: () => api.get('/notifications/me/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/me/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  createForUser: (userId, notification) => api.post(`/notifications/user/${userId}`, notification),
  createByAudience: (notification) => api.post('/notifications/audience', notification),
  createForRole: (role, notification) => api.post(`/notifications/role/${role}`, notification),
  broadcastToAll: (notification) => api.post('/notifications/broadcast', notification),
};

// Campus resources (facilities & assets) API calls
export const resourceAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  search: (params) => api.get('/resources/search', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  remove: (id) => api.delete(`/resources/${id}`),
};

// Booking API calls
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: () => api.get('/bookings'),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getApprovedByResource: (resourceId) => api.get(`/bookings/resource/${resourceId}/approved`),
  approveBooking: (id) => api.patch(`/bookings/${id}/approve`),
  rejectBooking: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

// Review API calls
export const reviewAPI = {
  getPublicReviews: (limit = 6) => api.get('/reviews/public', { params: { limit } }),
  createReview: (data) => api.post('/reviews', data),
  getMyReviews: () => api.get('/reviews/my'),
  getAllReviews: () => api.get('/reviews/all'),
};

// Chatbot API calls
export const chatbotAPI = {
  ask: (question) => api.post('/chatbot/ask', { question }),
  getHelp: () => api.get('/chatbot/help'),
};

export default api;
