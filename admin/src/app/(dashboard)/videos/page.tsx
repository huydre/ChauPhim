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
import { useAdminMovies, useUpdateMovieStatus } from '@/hooks/api'

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'MOVIE' | 'SERIES'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // API query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && { search: searchTerm }),
    ...(filterType !== 'ALL' && { type: filterType }),
  }

  // Fetch movies from API
  const { data: moviesResponse, isLoading, error } = useAdminMovies(queryParams)
  const updateMovieStatusMutation = useUpdateMovieStatus()

  const videos = moviesResponse?.data || []
  const totalPages = moviesResponse?.meta?.totalPages || 1
  const totalCount = moviesResponse?.meta?.total || 0

  const togglePublishStatus = async (video: Video) => {
    try {
      await updateMovieStatusMutation.mutateAsync({
        id: video.id,
        isPublished: !video.isPublished
      })
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
              {totalCount} videos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {video.posterUrl ? (
                <img
                  src={video.posterUrl}
                  alt={video.titleVi}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <VideoIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant={video.isPublished ? 'default' : 'secondary'}>
                  {video.isPublished ? 'Published' : 'Draft'}
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
                    {video.titleVi}
                  </h3>
                  {video.titleEn && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {video.titleEn}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {video.year}
                  </div>
                  {video.durationMinutes && (
                    <div className="flex items-center gap-1">
                      <VideoIcon className="h-3 w-3" />
                      {formatDuration(video.durationMinutes)}
                    </div>
                  )}
                  {video.ageRating && (
                    <Badge variant="outline" className="text-xs">
                      {video.ageRating}
                    </Badge>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {video.genres.slice(0, 3).map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="text-xs">
                      {genre.nameVi}
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
                      disabled={updateMovieStatusMutation.isPending}
                    >
                      {video.isPublished ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/videos/${video.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                  
                  <Button size="sm" asChild>
                    <Link href={`/videos/${video.id}`}>
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

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load videos</h3>
            <p className="text-gray-600 mb-6">
              There was an error loading the videos. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} videos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
