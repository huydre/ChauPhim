import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthenticatedApiClient } from '@/lib/auth-utils'
import type { 
  Video, 
  PaginationResponse, 
  Genre, 
  CastMember,
  User,
  DashboardStats,
  Comment,
  Rating,
  TranscodeJob,
  AuditLog,
  AuditLogStats,
  Job,
  UploadUrlRequest,
  UploadUrlResponse
} from '@/types/api'

// Query Keys
export const queryKeys = {
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  
  // Videos
  videos: (params?: Record<string, any>) => ['videos', params] as const,
  video: (id: string) => ['videos', id] as const,
  
  // Genres
  genres: (params?: Record<string, any>) => ['genres', params] as const,
  genre: (id: string) => ['genres', id] as const,
  
  // Cast
  cast: (params?: Record<string, any>) => ['cast', params] as const,
  castMember: (id: string) => ['cast', id] as const,
  
  // Users
  users: (params?: Record<string, any>) => ['users', params] as const,
  user: (id: string) => ['users', id] as const,
  
  // Comments
  comments: (params?: Record<string, any>) => ['comments', params] as const,
  comment: (id: string) => ['comments', id] as const,
  
  // Ratings
  ratings: (params?: Record<string, any>) => ['ratings', params] as const,
  
  // Jobs
  jobs: (params?: Record<string, any>) => ['jobs', params] as const,
  job: (id: string) => ['jobs', id] as const,
  
  // Audit Logs
  auditLogs: (params?: Record<string, any>) => ['audit-logs', params] as const,
}

// Dashboard Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.get<DashboardStats>('/admin/dashboard/stats')
    },
  })
}

// Video Hooks
export function useVideos(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.videos(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<Video>>(`/videos?${searchParams}`)
    },
  })
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: queryKeys.video(id),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.get<Video>(`/videos/${id}`)
    },
    enabled: !!id,
  })
}

export function useCreateVideo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Video>) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<Video>('/videos', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}

export function useUpdateVideo(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Video>) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.put<Video>(`/videos/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(id) })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

export function useDeleteVideo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.delete(`/videos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}

// Genre Hooks
export function useGenres(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.genres(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<Genre>>(`/genres?${searchParams}`)
    },
  })
}

export function useCreateGenre() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Genre>) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<Genre>('/genres', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })
}

export function useUpdateGenre() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ genreId, data }: { genreId: string; data: Partial<Genre> }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.patch<Genre>(`/genres/${genreId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })
}

export function useDeleteGenre() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (genreId: string) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.delete(`/genres/${genreId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] })
    },
  })
}

// Cast Hooks
export function useCastMembers(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.cast(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<CastMember>>(`/cast?${searchParams}`)
    },
  })
}

// User Hooks
export function useUsers(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<User>>(`/users?${searchParams}`)
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.patch<User>(`/users/${userId}/role`, { role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.patch<User>(`/users/${userId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Comment Hooks
export function useComments(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.comments(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<Comment>>(`/comments?${searchParams}`)
    },
  })
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      commentId, 
      status, 
      isHidden 
    }: { 
      commentId: string; 
      status?: 'pending' | 'approved' | 'rejected';
      isHidden?: boolean;
    }) => {
      const apiClient = getAuthenticatedApiClient()
      const updateData: any = {}
      if (status !== undefined) updateData.status = status
      if (isHidden !== undefined) updateData.is_hidden = isHidden
      
      return apiClient.patch<Comment>(`/comments/${commentId}`, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}

// Job Hooks
export function useJobs(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<Job>>(`/jobs?${searchParams}`)
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  })
}

// Audit Log Hooks
export function useAuditLogs(params?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.auditLogs(params),
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams(params)
      return apiClient.get<PaginationResponse<AuditLog>>(`/audit-logs?${searchParams}`)
    },
  })
}

export function useAuditLogStats(period: string = '7d') {
  return useQuery({
    queryKey: ['auditLogStats', period],
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.get<{ data: AuditLogStats }>(`/audit-logs/stats?period=${period}`)
    },
  })
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: async (params: { format?: string; filters?: Record<string, any> }) => {
      const apiClient = getAuthenticatedApiClient()
      const searchParams = new URLSearchParams({
        format: params.format || 'csv',
        ...params.filters,
      })
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit-logs/export?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${params.format || 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })
}

// Upload Hooks
export function useCreateUploadUrl() {
  return useMutation<UploadUrlResponse, Error, UploadUrlRequest>({
    mutationFn: async (data: UploadUrlRequest) => {
      const apiClient = getAuthenticatedApiClient()
      const response = await apiClient.post('/upload/presigned', data) as any
      return response.data as UploadUrlResponse
    },
  })
}

// Admin Movie Hooks
export function useGenerateMovieUploadUrl() {
  return useMutation({
    mutationFn: async (data: { filename: string; contentType: string }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<{
        success: boolean
        data: {
          uploadUrl: string
          videoKey: string
          expiresAt: string
        }
      }>('/admin/movies/upload-url', data)
    },
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      slug?: string
      titleVi?: string
      titleEn?: string
      descriptionVi?: string
      descriptionEn?: string
      type: 'MOVIE' | 'SERIES'
      year?: number
      posterUrl?: string
      backdropUrl?: string
      ageRating?: string
      durationMinutes?: number
      genreIds?: string[]
      castIds?: string[]
      rawVideoKey?: string
    }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<{
        success: boolean
        data: {
          id: string
          slug: string
          titleVi: string
          titleEn: string
          type: 'MOVIE' | 'SERIES'
          isPublished: boolean
          createdAt: string
          genres: any[]
          casts: any[]
        }
      }>('/admin/movies', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
    },
  })
}

export function useStartTranscoding() {
  return useMutation({
    mutationFn: async ({ 
      movieId, 
      rawVideoKey, 
      qualities 
    }: { 
      movieId: string
      rawVideoKey: string
      qualities?: string[]
    }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<{
        success: boolean
        data: {
          jobId: string
          status: string
          message: string
        }
      }>(`/admin/movies/${movieId}/transcode`, {
        rawVideoKey,
        qualities: qualities || ['480p', '720p', '1080p']
      })
    },
  })
}

export function useTranscodingStatus(movieId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['movies', movieId, 'transcoding-status'],
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.get<{
        success: boolean
        data: {
          status: 'queued' | 'processing' | 'completed' | 'failed'
          progress: number
          message: string
          hlsManifestKey?: string
        }
      }>(`/admin/movies/${movieId}/transcode/status`)
    },
    enabled: enabled && !!movieId,
    refetchInterval: (query) => {
      // Keep polling if status is not final
      const status = query.state.data?.data?.status
      return (status === 'queued' || status === 'processing') ? 5000 : false
    },
  })
}

export function usePublishMovie() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ movieId, isPublished }: { movieId: string; isPublished: boolean }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.patch<{
        success: boolean
        data: {
          id: string
          slug: string
          titleVi: string
          titleEn: string
          isPublished: boolean
          movieSources: Array<{
            hlsManifestKey: string
            isPublished: boolean
            subtitlesJson: any[]
          }>
        }
      }>(`/admin/movies/${movieId}/publish`, { isPublished })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

export function useGenerateSubtitleUploadUrl() {
  return useMutation({
    mutationFn: async ({ movieId, language }: { movieId: string; language: string }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<{
        success: boolean
        data: {
          uploadUrl: string
          subtitleKey: string
          language: string
          expiresAt: string
        }
      }>(`/admin/movies/${movieId}/subtitles/upload-url`, { language })
    },
  })
}

export function useAddSubtitle() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      movieId, 
      language, 
      subtitleKey 
    }: { 
      movieId: string
      language: string
      subtitleKey: string
    }) => {
      const apiClient = getAuthenticatedApiClient()
      return apiClient.post<{
        success: boolean
        data: {
          message: string
          subtitles: Array<{
            lang: string
            label: string
            key: string
          }>
        }
      }>(`/admin/movies/${movieId}/subtitles`, { language, subtitleKey })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.video(variables.movieId) })
    },
  })
}

// Transcode jobs hooks
export const useTranscodeJobs = (params?: {
  page?: string
  limit?: string
  status?: string
}) => {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page)
  if (params?.limit) searchParams.set('limit', params.limit)
  if (params?.status) searchParams.set('status', params.status)
  searchParams.set('_t', Date.now().toString()) // Cache busting

  return useQuery({
    queryKey: ['transcode-jobs', params],
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const response = await apiClient.get<{
        success: boolean
        data: TranscodeJob[]
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
      }>(`/admin/transcode-jobs?${searchParams.toString()}`)
      return response.data
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 0, // Always consider data stale
  })
}

export const useTranscodeJobStatus = (videoId: string) => {
  return useQuery({
    queryKey: ['transcode-status', videoId],
    queryFn: async () => {
      const apiClient = getAuthenticatedApiClient()
      const response = await apiClient.get<{
        success: boolean
        data: {
          status: string
          progress: number
          message: string
          jobId: string
          startedAt?: string
          completedAt?: string
          errorMessage?: string
          hlsManifestKey?: string
        }
      }>(`/admin/movies/${videoId}/transcode/status`)
      return response.data
    },
    enabled: !!videoId,
    refetchInterval: 3000, // Refresh every 3 seconds
  })
}
