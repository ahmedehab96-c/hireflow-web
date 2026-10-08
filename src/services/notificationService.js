import { api, cleanParams } from './api'

export const notificationService = {
  list: (params, config) => api.get('/notifications', cleanParams(params), config),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}

export const activityService = {
  list: (params, config) => api.get('/activity', cleanParams(params), config),
}

/** Where a notification or activity subject lives in the app. */
export function subjectPath(subject) {
  if (!subject) return null
  switch (subject.type) {
    case 'application':
      return `/app/applications/${subject.id}`
    case 'interview':
      return `/dashboard/interviews/${subject.id}`
    case 'cv':
      return `/dashboard/cv?cv=${subject.id}`
    case 'job':
      return `/jobs/${subject.id}`
    default:
      return null
  }
}
