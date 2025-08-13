export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  status: 'ACTIVE' | 'BANNED'
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Login response data structure
export interface LoginResponseData {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends ApiResponse<LoginResponseData> {}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface Video {
  id: string
  slug: string
  titleVi: string
  titleEn?: string
  originalTitle?: string
  englishTitle?: string
  descriptionVi?: string
  descriptionEn?: string
  overview?: string
  type: 'MOVIE' | 'SERIES'
  year: number
  ageRating?: string
  quality?: 'CAM' | 'HD' | 'FHD' | 'FOURK'
  originCountry?: string[]
  imdbRating?: number
  imdbId?: string
  posterUrl?: string
  backdropUrl?: string
  durationMinutes?: number
  isPublished: boolean
  viewsCount?: string
  createdAt: string
  updatedAt: string
  genres: Genre[]
  cast?: CastMember[]
  seasons?: Season[]
  movieSources?: MovieSource[]
  _count?: {
    ratings: number
    comments: number
  }
}

export interface MovieSource {
  id: string
  isPublished: boolean
  hlsManifestKey?: string
  rawVideoKey?: string
  trailerHlsManifestKey?: string
}

export interface VideoSource {
  id: string
  video_id: string
  hls_manifest_key?: string
  trailer_key?: string
  subtitles: Subtitle[]
}

export interface Season {
  id: string
  video_id: string
  season_number: number
  name_vi: string
  name_en?: string
  episodes: Episode[]
}

export interface Episode {
  id: string
  season_id: string
  episode_number: number
  title_vi: string
  title_en?: string
  synopsis_vi?: string
  synopsis_en?: string
  runtime_minutes?: number
  is_published: boolean
  sources?: EpisodeSource[]
}

export interface EpisodeSource {
  id: string
  episode_id: string
  hls_manifest_key?: string
  trailer_key?: string
  subtitles: Subtitle[]
}

export interface Subtitle {
  id: string
  language: string
  label: string
  subtitle_key: string
}

export interface Genre {
  id: string
  slug: string
  nameVi: string
  nameEn?: string
  description?: string
  videoCount?: number
  createdAt: string
  updatedAt: string
}

export interface CastMember {
  id: string
  name: string
  avatar_url?: string
  role: 'actor' | 'director' | 'producer' | 'other'
  bio?: string
  birth_date?: string
  nationality?: string
  video_count?: number
  awards_count?: number
  created_at: string
  updated_at: string
  videos?: Video[]
}

export interface Rating {
  id: string
  user_id: string
  video_id: string
  score: number
  review?: string
  created_at: string
  user?: User
  video?: Video
}

export interface Comment {
  id: string
  user_id: string
  video_id: string
  parent_id?: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  is_hidden: boolean
  created_at: string
  updated_at: string
  user?: User
  video?: Video
  replies?: Comment[]
}

export interface Job {
  id: string
  type: string
  input: any
  output?: any
  preset?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress?: number
  attempts: number
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  error?: string
}

export interface WatchHistory {
  id: string
  user_id: string
  video_id: string
  episode_id?: string
  progress_seconds: number
  completed: boolean
  created_at: string
  updated_at: string
  user?: User
  video?: Video
  episode?: Episode
}

export interface UploadUrlRequest {
  filename: string
  contentType: string
  file_size?: number
}

export interface UploadUrlResponse {
  url: string
  fields: Record<string, string>
  file_id: string
}

export interface PaginationRequest {
  page?: number
  limit?: number
}

export interface PaginationResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface DashboardStats {
  total_views: number
  active_users: number
  average_rating: number
  new_videos: number
  views_chart: Array<{
    date: string
    views: number
  }>
  genre_distribution: Array<{
    genre: string
    count: number
  }>
  trending_videos: Array<{
    video: Video
    views: number
  }>
}

export interface AuditLog {
  id: string
  userId?: string
  userName: string
  userEmail: string
  userRole?: string
  action: string
  resource: string
  resourceId?: string
  ip?: string
  userAgent?: string
  status: 'SUCCESS' | 'FAILED'
  details?: Record<string, any>
  timestamp: string
  createdAt: string
}

export interface AuditLogStats {
  summary: {
    totalLogs: number
    successCount: number
    failedCount: number
    successRate: number
    uniqueUsersCount: number
  }
  actionBreakdown: Array<{
    action: string
    count: number
  }>
  timeBasedData: Array<{
    period: string
    totalLogs: number
    successCount: number
    failedCount: number
  }>
}

export interface TranscodeJob {
  id: string
  videoId: string
  jobId: string
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number // 0-100
  qualities: string[] // ["480p", "720p", "1080p"]
  inputPath: string
  outputPath: string
  errorMessage?: string | null
  startedAt?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  video: {
    titleVi: string
    titleEn: string
    slug: string
    posterUrl?: string | null
  }
}
