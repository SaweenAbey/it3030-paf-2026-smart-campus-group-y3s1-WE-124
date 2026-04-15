import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api' });

// Attach JWT token to every request
API.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const createBooking  = (data) => API.post('/bookings', data);
export const getMyBookings  = () => API.get('/bookings/my');
export const getAllBookings  = () => API.get('/bookings');
export const getApprovedByResource = (resourceId) => API.get(`/bookings/resource/${resourceId}/approved`);
export const updateBooking  = (id, data) => API.put(`/bookings/${id}`, data);
export const approveBooking = (id) => API.patch(`/bookings/${id}/approve`);
export const rejectBooking  = (id, reason) =>
    API.patch(`/bookings/${id}/reject`, { reason });
export const cancelBooking  = (id) => API.delete(`/bookings/${id}`);