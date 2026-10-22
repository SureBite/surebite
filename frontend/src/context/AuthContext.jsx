import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verify session on mount via secure httpOnly cookie
  useEffect(() => {
    let active = true

    api.auth
      .getMe()
      .then((data) => {
        if (active) setUser(data.user)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Login: stores user in state; cookie is automatically set by backend
  const login = useCallback(async (credentials) => {
    const data = await api.auth.login(credentials)
    setUser(data.user)
    return data.user
  }, [])

  // Register: creates unverified user; transitions to OTP verification
  const register = useCallback(async (details) => {
    return await api.auth.register(details)
  }, [])

  // Verify OTP: activates account and establishes session
  const verifyOtp = useCallback(async ({ email, otp }) => {
    const data = await api.auth.verifyOtp({ email, otp })
    setUser(data.user)
    return data.user
  }, [])

  // Resend OTP
  const resendOtp = useCallback(async (email) => {
    return await api.auth.resendOtp({ email })
  }, [])

  // Logout: clears httpOnly cookie via backend endpoint and resets state
  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch (err) {
      console.warn('Backend logout failed or offline:', err.message)
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
    }),
    [user, loading, login, register, verifyOtp, resendOtp, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
