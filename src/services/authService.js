import { api } from './api'

export const authService = {
  login: (credentials) => api.post('/login', { ...credentials, device_name: 'web' }),
  register: (payload) => api.post('/register', { ...payload, device_name: 'web' }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
}
