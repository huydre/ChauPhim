import type { User, LoginRequest, LoginResponse, ApiResponse } from '@/types/api'
import { apiClient } from '@/lib/api-client'
import { AUTH_COOKIE_NAME } from '@/lib/config'

// Token storage utilities
export function storeToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_COOKIE_NAME, token)
  }
}

export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_COOKIE_NAME)
  }
  return null
}

export function removeStoredToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_COOKIE_NAME)
  }
}

// Get authenticated API client
export function getAuthenticatedApiClient() {
  const token = getStoredToken()
  
  return {
    get: <T>(endpoint: string, headers: Record<string, string> = {}) => {
      return apiClient.get<T>(endpoint, {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      })
    },
    post: <T>(endpoint: string, data?: any, headers: Record<string, string> = {}) => {
      return apiClient.post<T>(endpoint, data, {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      })
    },
    put: <T>(endpoint: string, data?: any, headers: Record<string, string> = {}) => {
      return apiClient.put<T>(endpoint, data, {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      })
    },
    patch: <T>(endpoint: string, data?: any, headers: Record<string, string> = {}) => {
      return apiClient.patch<T>(endpoint, data, {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      })
    },
    delete: <T>(endpoint: string, headers: Record<string, string> = {}) => {
      return apiClient.delete<T>(endpoint, {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      })
    },
  }
}

// Auth API functions
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', credentials)
}

export async function getCurrentUser(): Promise<User> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const response = await apiClient.get<ApiResponse<User>>('/me', {
    Authorization: `Bearer ${token}`,
  })
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to get user info')
  }
  
  return response.data
}

export async function refreshUserToken(): Promise<LoginResponse> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('No refresh token available')
  }

  return apiClient.post<LoginResponse>('/auth/refresh', {
    refreshToken: token
  })
}
