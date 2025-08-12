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
  Job,
  AuditLog,
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
