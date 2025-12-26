import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authService.verifyToken()
      if (response.success) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      if (response.success) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (error) {
      console.error('Login failed:', error)
      
      // Provide detailed error messages
      if (error.code === 'ECONNABORTED' || error.message === 'timeout of 10000ms exceeded') {
        return { 
          success: false, 
          message: 'Connection timeout - Server is not responding'
        }
      }
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return { 
          success: false, 
          message: 'Network Error - Unable to connect to server'
        }
      }
      
      const statusCode = error.response?.status
      const serverMessage = error.response?.data?.message
      
      if (statusCode === 401) {
        return { 
          success: false, 
          message: serverMessage || 'Invalid credentials'
        }
      }
      
      if (statusCode === 400) {
        return { 
          success: false, 
          message: serverMessage || 'Email and password are required'
        }
      }
      
      if (statusCode === 500) {
        return { 
          success: false, 
          message: 'Internal server error'
        }
      }
      
      return { 
        success: false, 
        message: serverMessage || 'Login failed - Please try again'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin: user?.role === 'admin',
    isSecurity: user?.role === 'security' || user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
