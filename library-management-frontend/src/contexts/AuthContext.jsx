import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage immediately
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Verify authentication with backend (runs after initial state restoration)
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token && isAuthenticated) {
        try {
          const userData = await authService.getCurrentUser()
          
          // Transform backend response to include userType
          const enhancedUserData = {
            ...userData,
            // Determine userType based on which fields exist
            userType: userData.memberId ? 'MEMBER' : 'ADMIN',
            // Ensure consistent ID field
            id: userData.memberId || userData.adminId
          }
          
          setUser(enhancedUserData)
          // Update stored user data
          localStorage.setItem('user', JSON.stringify(enhancedUserData))
        } catch (error) {
          console.error('Auth verification failed:', error)
          // Clear invalid token and user data
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    }

    if (!loading) {
      verifyAuth()
    }
  }, [loading, isAuthenticated])

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password)
      
      // Store token
      localStorage.setItem('authToken', response.token)
      
      // Set user data from login response (which has userType)
      const userData = {
        id: response.userId,
        username: response.userName,
        fullName: response.fullName,
        userType: response.userType,
        // Add ID fields for consistency
        ...(response.userType === 'MEMBER' ? { memberId: response.userId } : { adminId: response.userId })
      }
      
      // Store user data in localStorage for quick restoration
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (registrationData) => {
    try {
      const response = await authService.register(registrationData)
      return response
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state regardless of API response
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}