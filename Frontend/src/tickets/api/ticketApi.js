import api from '../../services/api';

export const ticketApi = {
  createTicket: (payload) => api.post('/tickets', payload),
  getVisibleTickets: () => api.get('/tickets'),
  getMyTickets: () => api.get('/tickets/my'),
  getAssignedToMe: () => api.get('/tickets/assigned/me'),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  getAssignableStaff: () => api.get('/tickets/assignable-staff'),
  assignTicket: (ticketId, payload) => api.patch(`/tickets/${ticketId}/assign`, payload),
  updateStatus: (ticketId, payload) => api.patch(`/tickets/${ticketId}/status`, payload),
  rejectTicket: (ticketId, reason) => api.patch(`/tickets/${ticketId}/reject`, { reason }),
  getComments: (ticketId) => api.get(`/tickets/${ticketId}/comments`),
  addComment: (ticketId, content) => api.post(`/tickets/${ticketId}/comments`, { content }),
  updateComment: (ticketId, commentId, content) =>
    api.put(`/tickets/${ticketId}/comments/${commentId}`, { content }),
  deleteComment: (ticketId, commentId) => api.delete(`/tickets/${ticketId}/comments/${commentId}`),
};

export default ticketApi;
