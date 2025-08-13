export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
export const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'admin_auth_token'
export const AUTH_COOKIE_SECURE = process.env.NEXT_PUBLIC_AUTH_COOKIE_SECURE === 'true'
export const AUTH_COOKIE_SAME_SITE = process.env.NEXT_PUBLIC_AUTH_COOKIE_SAME_SITE || 'lax'

export const I18N_DEFAULT_LOCALE = process.env.I18N_DEFAULT_LOCALE || 'vi'
export const I18N_LOCALES = process.env.I18N_LOCALES?.split(',') || ['vi', 'en']

export const MAX_FILE_SIZE = process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '100MB'
export const ALLOWED_FILE_TYPES = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
  'image/*',
  'video/*',
  'text/vtt'
]

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ChauPhim Admin'
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

export const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
export const ENABLE_DEV_TOOLS = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true'
export const ENABLE_MSW = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true'

export const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || ''
export const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://localhost:9000'

export const CSP_ENABLED = process.env.NEXT_PUBLIC_CSP_ENABLED === 'true'
export const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001'
]

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 1 day
}

// File upload limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 1024 * 1024 * 1024, // 1GB
  SUBTITLE: 1024 * 1024, // 1MB
}

// Video types
export const VIDEO_TYPES = {
  MOVIE: 'MOVIE',
  SERIES: 'SERIES',
} as const

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const

// Job statuses
export const JOB_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const

// Age ratings
export const AGE_RATINGS = {
  G: 'G', // General Audiences
  PG: 'PG', // Parental Guidance
  PG13: 'PG-13', // Parents Strongly Cautioned
  R: 'R', // Restricted
  NC17: 'NC-17', // Adults Only
} as const
