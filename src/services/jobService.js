import { api, cleanParams } from './api'
import { AI_TIMEOUT } from './cvService'

export const jobService = {
  list: (params, config) => api.get('/jobs', cleanParams(params), config),
  get: (id) => api.get(`/jobs/${id}`),
}

/** Compares one of the candidate's CVs with a job (AI). */
jobService.match = (jobId, cvId) => api.post(`/jobs/${jobId}/match`, { cv_id: cvId }, { timeout: AI_TIMEOUT })
