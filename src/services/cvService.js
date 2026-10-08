import { api } from './api'

/** AI calls can take a while (the server allows up to ~2 minutes per attempt). */
export const AI_TIMEOUT = 240000

export const cvService = {
  list: (config) => api.get('/cvs', undefined, config),
  get: (id, config) => api.get(`/cvs/${id}`, undefined, config),
  upload: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/cvs', form, {
      timeout: 60000,
      onUploadProgress: (event) => event.total && onProgress?.(Math.round((event.loaded / event.total) * 100)),
    })
  },
  analyze: (id) => api.post(`/cvs/${id}/analyze`, null, { timeout: AI_TIMEOUT }),
  remove: (id) => api.delete(`/cvs/${id}`),
}
