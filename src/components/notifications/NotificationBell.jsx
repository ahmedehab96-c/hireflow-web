import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { notificationService, subjectPath } from '../../services/notificationService'
import { timeAgo } from '../../utils/format'
import { ErrorState, Spinner } from '../ui/Feedback'

const POLL_MS = 60000

/** Header bell: unread badge (polled), dropdown list, mark one/all as read. */
export function NotificationBell() {
  const toast = useToast()
  const navigate = useNavigate()
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [list, setList] = useState({ items: null, loading: false, error: null })

  const refreshCount = useCallback(async () => {
    try {
      const data = await notificationService.list({ per_page: 1 })
      setUnread(data.unread_count)
    } catch {
      /* the badge is best-effort; errors surface when the list is opened */
    }
  }, [])

  const loadList = useCallback(async () => {
    setList((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await notificationService.list({ per_page: 15 })
      setList({ items: data.items, loading: false, error: null })
      setUnread(data.unread_count)
    } catch (error) {
      setList((prev) => ({ ...prev, loading: false, error }))
    }
  }, [])

  // Poll while the tab is visible, and refresh when the user comes back to it.
  useEffect(() => {
    refreshCount()
    const id = setInterval(() => document.visibilityState === 'visible' && refreshCount(), POLL_MS)
    window.addEventListener('focus', refreshCount)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', refreshCount)
    }
  }, [refreshCount])

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const toggle = () => {
    if (!open) loadList()
    setOpen(!open)
  }

  const markAll = async () => {
    try {
      await notificationService.markAllRead()
      setList((prev) => ({ ...prev, items: prev.items?.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })) }))
      setUnread(0)
    } catch (error) {
      toast.error('Could not update notifications', error.message)
    }
  }

  const openItem = async (item) => {
    setOpen(false)
    if (!item.read_at) {
      setUnread((n) => Math.max(0, n - 1))
      setList((prev) => ({ ...prev, items: prev.items?.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)) }))
      notificationService.markRead(item.id).catch(() => {})
    }
    const path = subjectPath(item.subject)
    if (path) navigate(path)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] leading-4 font-semibold text-white tabular-nums">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-16 z-30 animate-fade-in rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">
                <CheckCheck className="size-3.5" aria-hidden="true" /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {list.error ? (
              <ErrorState error={list.error} onRetry={loadList} className="py-8" />
            ) : !list.items ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : list.items.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <BellOff className="size-6 text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-slate-700">You're all caught up</p>
                <p className="mt-0.5 text-xs text-slate-500">Updates about your applications and interviews appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => openItem(item)} className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${item.read_at ? '' : 'bg-brand-50/40'}`}>
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read_at ? 'bg-transparent' : 'bg-brand-600'}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${item.read_at ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>{item.title}</span>
                        <span className="mt-0.5 block text-sm text-slate-500">{item.message}</span>
                        <span className="mt-1 block text-xs text-slate-400">{timeAgo(item.created_at)}{!item.read_at && <span className="sr-only"> · unread</span>}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {list.loading && list.items && <div className="flex justify-center py-2"><Spinner className="size-4" /></div>}
          </div>
        </div>
      )}
    </div>
  )
}
