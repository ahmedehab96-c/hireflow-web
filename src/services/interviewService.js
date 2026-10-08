import { api, cleanParams } from './api'
import { AI_TIMEOUT } from './cvService'

export const interviewService = {
  list: (params, config) => api.get('/interviews', cleanParams(params), config),
  get: (id, config) => api.get(`/interviews/${id}`, undefined, config),
  create: (payload) => api.post('/interviews', payload),
  start: (id) => api.post(`/interviews/${id}/start`, null, { timeout: AI_TIMEOUT }),
  answer: (id, questionId, answer) => api.post(`/interviews/${id}/questions/${questionId}/answer`, { answer }, { timeout: AI_TIMEOUT }),
  complete: (id) => api.post(`/interviews/${id}/complete`, null, { timeout: AI_TIMEOUT }),
  remove: (id) => api.delete(`/interviews/${id}`),
}
