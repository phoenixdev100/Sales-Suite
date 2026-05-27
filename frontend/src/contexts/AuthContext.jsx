import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import logger from '../utils/logger'

// Helper function to check if token is about to expire
const isTokenExpiringSoon = (token) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const timeUntilExpiry = expirationTime - currentTime

    // Return true if token expires in less than 1 hour
    return timeUntilExpiry < 60 * 60 * 1000
  } catch (error) {
    console.error('Error parsing token:', error)
    return true
  }
}

const AuthContext = createContext({})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')

    if (token && refreshToken) {
      // Set the token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      if (storedUser) {
        // Use stored user data first
        setUser(JSON.parse(storedUser))
        setLoading(false)
      } else {
        // Only fetch profile if no stored user data
        fetchProfile()
      }

      // Check if token is about to expire and set up refresh
      if (isTokenExpiringSoon(token)) {
        refreshTokenCall()
      }
    } else {
      setLoading(false)
    }

    // Set up token refresh interval (check every hour)
    const refreshInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token')
      const currentRefreshToken = localStorage.getItem('refreshToken')
      const currentUser = localStorage.getItem('user')
      if (currentToken && currentRefreshToken && currentUser && isTokenExpiringSoon(currentToken)) {
        refreshTokenCall()
      }
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(refreshInterval)
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile')
      const userData = response.data.user
      setUser(userData)
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // Only logout if token is expired or invalid, not for network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.log('Token invalid or expired, logging out')
        logout()
      } else {
        logger.log('Network error, keeping user logged in')
        setLoading(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token, refreshToken } = response.data

      // Store tokens
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken || '')
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser(user)
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { user, token, refreshToken } = response.data

      // Store tokens
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken || '')
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser(user)
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const refreshTokenCall = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        logout()
        return { success: false }
      }

      const response = await api.post('/auth/refresh', { refreshToken })
      const { token: newToken, refreshToken: newRefreshToken } = response.data

      // Update tokens
      localStorage.setItem('token', newToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      return { success: true }
    } catch (error) {
      console.error('Failed to refresh tokens:', error)
      // If refresh fails, logout user
      logout()
      return { success: false }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put(`/users/${user.id}`, profileData)
      setUser(response.data.user)
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await api.patch(`/users/${user.id}/password`, passwordData)
      toast.success('Password changed successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to change password'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const hasPermission = (requiredRoles) => {
    if (!user) return false
    if (typeof requiredRoles === 'string') {
      return user.role === requiredRoles
    }
    return requiredRoles.includes(user.role)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken: refreshTokenCall,
    updateProfile,
    changePassword,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
