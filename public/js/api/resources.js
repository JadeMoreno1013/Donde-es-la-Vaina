import { api } from './client.js';

export const sessionsApi = {
    create: (credentials) => api.post('/sessions', credentials),
    destroy: () => api.delete('/sessions')
};

export const usersApi = {
    register: (data) => api.post('/users', data),
    list: () => api.get('/users'),
    update: (id, data) => api.patch(`/users/${id}`, data),
    remove: (id) => api.delete(`/users/${id}`)
};

export const venuesApi = {
    list: () => api.get('/venues'),
    create: (data) => api.post('/venues', data)
};

export const eventsApi = {
    list: (filters) => api.get('/events', filters),
    get: (id) => api.get(`/events/${id}`),
    getInfo: (id) => api.get(`/events/${id}/info`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.patch(`/events/${id}`, data),
    remove: (id) => api.delete(`/events/${id}`)
};

export const purchasesApi = {
    create: (data) => api.post('/purchases', data),
    list: (filters) => api.get('/purchases', filters)
};

export const reviewsApi = {
    list: (filters) => api.get('/reviews', filters),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.patch(`/reviews/${id}`, data),
    remove: (id) => api.delete(`/reviews/${id}`)
};
