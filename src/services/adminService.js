import { api, cleanParams, fetchAllPages } from './api'

/** One CRUD client per admin resource, all sharing the same shape. */
function resource(path) {
  return {
    list: (params, config) => api.get(path, cleanParams(params), config),
    all: (params) => fetchAllPages(path, { per_page: 50, ...params }),
    get: (id) => api.get(`${path}/${id}`),
    create: (payload) => api.post(path, payload),
    update: (id, payload) => api.put(`${path}/${id}`, payload),
    remove: (id) => api.delete(`${path}/${id}`),
  }
}

export const adminStats = {
  get: (config) => api.get('/admin/stats', undefined, config),
}

export const adminUsers = {
  list: (params, config) => api.get('/admin/users', cleanParams(params), config),
}

export const adminCompanies = resource('/admin/companies')
export const adminJobs = resource('/admin/jobs')
export const adminSkills = resource('/admin/skills')
