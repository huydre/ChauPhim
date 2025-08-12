'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MoreHorizontal,
  VideoIcon,
  Calendar,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import type { Video, PaginationResponse } from '@/types/api'
import { getAuthenticatedApiClient } from '@/lib/auth-utils'

// Mock data for demonstration
const mockVideos: Video[] = [
  {
    id: '1',
    slug: 'avengers-endgame',
    title_vi: 'Avengers: Endgame',
    title_en: 'Avengers: Endgame',
    type: 'MOVIE',
    year: 2019,
    age_rating: 'PG-13',
    duration_minutes: 181,
    is_published: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    genres: [
      { id: '1', slug: 'action', name_vi: 'Hành động', name_en: 'Action' },
      { id: '2', slug: 'adventure', name_vi: 'Phiêu lưu', name_en: 'Adventure' },
    ],
    cast: [
      { id: '1', name: 'Robert Downey Jr.', role: 'Tony Stark / Iron Man' },
      { id: '2', name: 'Chris Evans', role: 'Steve Rogers / Captain America' },
    ],
  },
  {
    id: '2',
    slug: 'stranger-things',
    title_vi: 'Stranger Things',
    title_en: 'Stranger Things',
    type: 'SERIES',
    year: 2016,
    age_rating: 'TV-14',
    is_published: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    genres: [
      { id: '3', slug: 'drama', name_vi: 'Chính kịch', name_en: 'Drama' },
      { id: '4', slug: 'sci-fi', name_vi: 'Khoa học viễn tưởng', name_en: 'Sci-Fi' },
    ],
    cast: [
      { id: '3', name: 'Millie Bobby Brown', role: 'Eleven' },
      { id: '4', name: 'Finn Wolfhard', role: 'Mike Wheeler' },
    ],
    seasons: [
      {
        id: '1',
        video_id: '2',
        season_number: 1,
        name_vi: 'Mùa 1',
        name_en: 'Season 1',
        episodes: [],
      },
    ],
  },
]

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>(mockVideos)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'MOVIE' | 'SERIES'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  useEffect(() => {
    loadVideos()
  }, [currentPage, searchTerm, filterType])

  const loadVideos = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with real API call
      // const apiClient = getAuthenticatedApiClient()
      // const params = new URLSearchParams({
      //   page: currentPage.toString(),
      //   limit: pageSize.toString(),
      //   ...(searchTerm && { q: searchTerm }),
      //   ...(filterType !== 'ALL' && { type: filterType }),
      // })
      // const response = await apiClient.get<PaginationResponse<Video>>(`/videos?${params}`)
      // setVideos(response.data)
      
      // For now, use mock data with filtering
      let filteredVideos = mockVideos
      
      if (searchTerm) {
        filteredVideos = filteredVideos.filter(video => 
          video.title_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.title_en?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (filterType !== 'ALL') {
        filteredVideos = filteredVideos.filter(video => video.type === filterType)
      }
      
      setVideos(filteredVideos)
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePublishStatus = async (video: Video) => {
    try {
      // TODO: API call to toggle publish status
      // const apiClient = getAuthenticatedApiClient()
      // await apiClient.patch(`/videos/${video.id}`, {
      //   is_published: !video.is_published
      // })
      
      setVideos(prev => prev.map(v => 
        v.id === video.id 
          ? { ...v, is_published: !v.is_published }
          : v
      ))
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
          <p className="text-gray-600">Manage movies and series content</p>
        </div>
        <Button asChild>
          <Link href="/videos/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                {(['ALL', 'MOVIE', 'SERIES'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <VideoIcon className="h-4 w-4" />
              {videos.length} videos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {video.poster_url ? (
                <img
                  src={video.poster_url}
                  alt={video.title_vi}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <VideoIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant={video.is_published ? 'default' : 'secondary'}>
                  {video.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="outline">
                  {video.type}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Title */}
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {video.title_vi}
                  </h3>
                  {video.title_en && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {video.title_en}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {video.year}
                  </div>
                  {video.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <VideoIcon className="h-3 w-3" />
                      {formatDuration(video.duration_minutes)}
                    </div>
                  )}
                  {video.age_rating && (
                    <Badge variant="outline" className="text-xs">
                      {video.age_rating}
                    </Badge>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {video.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="text-xs">
                      {genre.name_vi}
                    </Badge>
                  ))}
                  {video.genres.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{video.genres.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublishStatus(video)}
                    >
                      {video.is_published ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/videos/${video.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/videos/${video.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {videos.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first video'
              }
            </p>
            <Button asChild>
              <Link href="/dashboard/videos/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
