import { useState } from 'react'
import { useAsync } from './useAsync'
import { useToast } from './useToast'

/**
 * Shared list + delete flow for admin CRUD pages.
 * `filters` changes reset to page 1; deleting the last row of a page steps back one page.
 */
export function useAdminList(service, filters = {}, { perPage = 15, noun = 'Item' } = {}) {
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [lastFilters, setLastFilters] = useState(filters)
  const filterKey = JSON.stringify(filters)

  // Reset pagination during render when filters change (avoids an extra fetch of a stale page).
  if (filterKey !== JSON.stringify(lastFilters)) {
    setLastFilters(filters)
    setPage(1)
  }

  const list = useAsync((signal) => service.list({ ...filters, page, per_page: perPage }, { signal }), [filterKey, page])

  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await service.remove(toDelete.id)
      toast.success(`${noun} deleted`)
      setToDelete(null)
      if (list.data?.items.length === 1 && page > 1) setPage(page - 1)
      else list.reload()
    } catch (error) {
      // 409 = still referenced (e.g. company with jobs); the API explains why.
      toast.error(`Could not delete ${noun.toLowerCase()}`, error.message)
      if (error.status === 409 || error.status === 404) setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return {
    ...list,
    page,
    setPage,
    deletion: { item: toDelete, open: Boolean(toDelete), loading: deleting, ask: setToDelete, cancel: () => setToDelete(null), confirm: confirmDelete },
  }
}
