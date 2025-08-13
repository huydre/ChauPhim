'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, LoginRequest } from '@/types/api'
import { 
  loginUser, 
  getCurrentUser, 
  refreshUserToken,
  storeToken, 
  removeStoredToken, 
  getStoredToken 
} from '@/lib/auth-utils'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getStoredToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      removeStoredToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await loginUser(credentials)
      console.log('Login successful:', response)
      
      // Extract data from the wrapped response
      const loginData = response.data
      
      if (loginData.user?.role !== 'ADMIN') {
        throw new Error('Access denied. Admin role required.')
      }
      
      setUser(loginData.user)
      storeToken(loginData.accessToken)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    removeStoredToken()
    router.push('/login')
  }

  const refreshToken = async () => {
    try {
      const response = await refreshUserToken()
      
      // Extract data from the wrapped response
      const refreshData = response.data
      
      setUser(refreshData.user)
      storeToken(refreshData.accessToken)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
