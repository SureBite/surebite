import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/api'
import { TOKEN_KEY } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    let active = true
    api.auth
      .getMe()
      .then((data) => active && setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const startSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(async (data) => startSession(await api.auth.login(data)), [startSession])
  const register = useCallback(async (data) => startSession(await api.auth.register(data)), [startSession])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
