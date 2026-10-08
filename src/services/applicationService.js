import { api, cleanParams, fetchAllPages } from './api'

export const applicationService = {
  list: (params, config) => api.get('/applications', cleanParams(params), config),
  get: (id) => api.get(`/applications/${id}`),
  create: (payload) => api.post('/applications', payload),
  update: (id, payload) => api.put(`/applications/${id}`, payload),
  remove: (id) => api.delete(`/applications/${id}`),
}

/** Every application of the current candidate (used to check whether a job is already tracked). */
applicationService.all = () => fetchAllPages('/applications', { per_page: 50 })
