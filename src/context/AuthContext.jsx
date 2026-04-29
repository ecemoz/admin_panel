import { createContext, useEffect, useMemo, useState } from 'react'
import { loginAdmin } from '../api/authApi'
import { isAdminFromToken, userFromToken } from '../lib/jwt'
import { clearAuthStorage, getStoredUser, getToken, setAuthStorage } from '../lib/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUser(null)
    }

    window.addEventListener('admin:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('admin:unauthorized', handleUnauthorized)
  }, [])

  async function login(credentials) {
    const response = await loginAdmin(credentials)

    const accessToken =
      response?.accessToken || response?.token || response?.data?.accessToken || response?.data?.token

    if (!accessToken) {
      throw new Error('Login response does not contain token')
    }

    if (!isAdminFromToken(accessToken)) {
      throw new Error('Only admin users can access this panel')
    }

    // Parse user from response or token payload
    let currentUser = response?.user || response?.data?.user || userFromToken(accessToken)

    // Fallback: if response has top-level user fields, merge them
    if (response?.email || response?.userName) {
      currentUser = {
        ...currentUser,
        email: response.email || currentUser?.email,
        name: response.userName || currentUser?.name,
        role: response.role || currentUser?.role,
      }
    }

    setAuthStorage(accessToken, currentUser)
    setToken(accessToken)
    setUser(currentUser)

    return { token: accessToken, user: currentUser }
  }

  function logout() {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAdmin: token ? isAdminFromToken(token) : false,
      login,
      logout,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
