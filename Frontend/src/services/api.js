import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
      window.location.href = '/login';
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
  updateProfileImage: (id, profileImageUrl) => api.patch(`/users/${id}/image`, { profileImageUrl }),
  deleteProfileImage: (id) => api.delete(`/users/${id}/image`),
  createAdminUser: (userData) => api.post('/users/create-admin-user', userData),
  updateActiveStatus: (id, isActive) =>
    api.patch(`/users/status/${id}`, null, { params: { isActive } }),
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

export default api;
