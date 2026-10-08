import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Runs an async loader on mount and whenever `deps` change.
 * The loader receives an AbortSignal; stale responses are dropped.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [version, setVersion] = useState(0)
  const loaderRef = useRef(loader)
  useLayoutEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, error: null, loading: true }))

    loaderRef.current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState((prev) => ({ ...prev, error, loading: false }))
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }))
  }, [])

  return { ...state, reload, setData }
}
