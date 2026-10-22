import { useState, useEffect, useCallback, useRef } from 'react'
import api, { getErrorMessage } from '../api/api'

export function useMenus() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null)
  const pendingRef = useRef(null)

  const fetchMenus = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.menus.getAll()
      setMenus(data.menus || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const restore = useCallback((entry) => {
    setMenus((current) => {
      const next = [...current]
      next.splice(Math.min(entry.index, next.length), 0, entry.menu)
      return next
    })
  }, [])

  const commitDelete = useCallback(async () => {
    const entry = pendingRef.current
    if (!entry) return
    pendingRef.current = null
    setPending(null)
    try {
      await api.menus.delete(entry.menu._id)
    } catch (err) {
      restore(entry)
      setError(getErrorMessage(err))
    }
  }, [restore])

  const queueDelete = useCallback(
    (target) => {
      if (pendingRef.current) {
        commitDelete()
      }
      const index = menus.findIndex((item) => item._id === target._id)
      if (index === -1) return
      const entry = { menu: target, index }
      pendingRef.current = entry
      setPending(entry)
      setMenus((current) => current.filter((item) => item._id !== target._id))
    },
    [commitDelete, menus]
  )

  const undoDelete = useCallback(() => {
    const entry = pendingRef.current
    if (!entry) return
    pendingRef.current = null
    setPending(null)
    restore(entry)
  }, [restore])

  return {
    menus,
    loading,
    error,
    pending,
    queueDelete,
    undoDelete,
    commitDelete,
    refetch: fetchMenus,
  }
}

export default useMenus
