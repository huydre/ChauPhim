'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Eye,
  Tv,
  Play,
  Calendar,
  Clock,
  Users,
  Star,
  Download,
  Filter
} from 'lucide-react'

interface Season {
  id: string
  season_number: number
  title?: string
  description?: string
  poster_url?: string
  release_date?: string
  episode_count: number
  video_id: string
  video_title: string
  created_at: string
  updated_at: string
}

interface Episode {
  id: string
  episode_number: number
  title_vi: string
  title_en?: string
  description_vi?: string
  description_en?: string
  duration_minutes: number
  video_url?: string
  thumbnail_url?: string
  release_date?: string
  view_count: number
  season_id: string
  season_number: number
  video_title: string
  created_at: string
  updated_at: string
}

export default function SeasonsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'seasons' | 'episodes'>('seasons')
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)

  // Mock data for seasons
  const seasons: Season[] = [
    {
      id: '1',
      season_number: 1,
      title: 'Season 1: The Beginning',
      description: 'The first season introduces the main characters and sets up the story.',
      poster_url: '/images/season1-poster.jpg',
      release_date: '2024-01-15',
      episode_count: 10,
      video_id: 'series_1',
      video_title: 'Breaking Bad',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
    },
    {
      id: '2',
      season_number: 2,
      title: 'Season 2: The Rise',
      description: 'The story intensifies as characters face new challenges.',
      poster_url: '/images/season2-poster.jpg',
      release_date: '2024-06-15',
      episode_count: 12,
      video_id: 'series_1',
      video_title: 'Breaking Bad',
      created_at: '2024-06-10T00:00:00Z',
      updated_at: '2024-06-10T00:00:00Z',
    },
    {
      id: '3',
      season_number: 1,
      title: 'First Season',
      description: 'Introduction to the world of Stranger Things.',
      poster_url: '/images/st-season1-poster.jpg',
      release_date: '2023-07-01',
      episode_count: 8,
      video_id: 'series_2',
      video_title: 'Stranger Things',
      created_at: '2023-06-25T00:00:00Z',
      updated_at: '2023-06-25T00:00:00Z',
    },
  ]

  // Mock data for episodes
  const episodes: Episode[] = [
    {
      id: '1',
      episode_number: 1,
      title_vi: 'Pilot',
      title_en: 'Pilot',
      description_vi: 'Tập đầu tiên giới thiệu về Walter White.',
      description_en: 'The first episode introduces Walter White.',
      duration_minutes: 58,
      video_url: '/videos/bb-s1e1.mp4',
      thumbnail_url: '/images/bb-s1e1-thumb.jpg',
      release_date: '2024-01-15',
      view_count: 1250000,
      season_id: '1',
      season_number: 1,
      video_title: 'Breaking Bad',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      episode_number: 2,
      title_vi: 'Cat\'s in the Bag...',
      title_en: 'Cat\'s in the Bag...',
      description_vi: 'Walter và Jesse phải đối phó với hậu quả.',
      description_en: 'Walter and Jesse deal with the consequences.',
      duration_minutes: 48,
      video_url: '/videos/bb-s1e2.mp4',
      thumbnail_url: '/images/bb-s1e2-thumb.jpg',
      release_date: '2024-01-22',
      view_count: 1180000,
      season_id: '1',
      season_number: 1,
      video_title: 'Breaking Bad',
      created_at: '2024-01-22T00:00:00Z',
      updated_at: '2024-01-22T00:00:00Z',
    },
    {
      id: '3',
      episode_number: 1,
      title_vi: 'Seven Thirty-Seven',
      title_en: 'Seven Thirty-Seven',
      description_vi: 'Mùa 2 bắt đầu với những diễn biến mới.',
      description_en: 'Season 2 begins with new developments.',
      duration_minutes: 47,
      video_url: '/videos/bb-s2e1.mp4',
      thumbnail_url: '/images/bb-s2e1-thumb.jpg',
      release_date: '2024-06-15',
      view_count: 1320000,
      season_id: '2',
      season_number: 2,
      video_title: 'Breaking Bad',
      created_at: '2024-06-15T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z',
    },
  ]

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const filteredSeasons = seasons.filter(season =>
    season.video_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    season.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch = 
      episode.video_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.title_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.title_en?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeason = selectedSeason ? episode.season_id === selectedSeason : true
    
    return matchesSearch && matchesSeason
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seasons & Episodes</h1>
          <p className="text-muted-foreground">
            Quản lý seasons và episodes cho các series
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất dữ liệu
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Seasons</CardTitle>
            <Tv className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seasons.length}</div>
            <p className="text-xs text-muted-foreground">
              Từ {new Set(seasons.map(s => s.video_id)).size} series
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Episodes</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{episodes.length}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {Math.round(episodes.length / seasons.length)} tập/season
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatViews(episodes.reduce((total, ep) => total + ep.view_count, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Từ tất cả episodes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời lượng</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(episodes.reduce((total, ep) => total + ep.duration_minutes, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng thời lượng content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bộ lọc</CardTitle>
              <CardDescription>
                Tìm kiếm và lọc theo seasons hoặc episodes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'seasons' ? 'default' : 'outline'}
                onClick={() => setViewMode('seasons')}
                size="sm"
              >
                <Tv className="mr-2 h-4 w-4" />
                Seasons
              </Button>
              <Button
                variant={viewMode === 'episodes' ? 'default' : 'outline'}
                onClick={() => setViewMode('episodes')}
                size="sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Episodes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Tìm kiếm ${viewMode === 'seasons' ? 'seasons' : 'episodes'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {viewMode === 'episodes' && (
              <select
                value={selectedSeason || 'all'}
                onChange={(e) => setSelectedSeason(e.target.value === 'all' ? null : e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tất cả seasons</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>
                    {season.video_title} - Season {season.season_number}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'seasons' ? (
        <Card>
          <CardHeader>
            <CardTitle>Seasons ({filteredSeasons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSeasons.map((season) => (
                <Card key={season.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{season.video_title}</CardTitle>
                        <Badge variant="secondary">Season {season.season_number}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem episodes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Poster */}
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      {season.poster_url ? (
                        <img 
                          src={season.poster_url} 
                          alt={season.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Tv className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    
                    {season.title && (
                      <div>
                        <h4 className="font-medium">{season.title}</h4>
                        {season.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {season.description}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        <span>{season.episode_count} tập</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {season.release_date 
                            ? new Date(season.release_date).toLocaleDateString('vi-VN')
                            : 'Chưa có'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setViewMode('episodes')
                        setSelectedSeason(season.id)
                      }}
                    >
                      Xem episodes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSeasons.length === 0 && (
              <div className="text-center py-8">
                <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  Không tìm thấy season nào phù hợp
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Episodes ({filteredEpisodes.length})</CardTitle>
            {selectedSeason && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Lọc theo: {seasons.find(s => s.id === selectedSeason)?.video_title} - 
                  Season {seasons.find(s => s.id === selectedSeason)?.season_number}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedSeason(null)}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEpisodes.map((episode) => (
                <div key={episode.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center">
                      {episode.thumbnail_url ? (
                        <img 
                          src={episode.thumbnail_url} 
                          alt={episode.title_vi}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Play className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{episode.title_vi}</h4>
                          <Badge variant="outline" className="text-xs">
                            S{episode.season_number}E{episode.episode_number}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{episode.video_title}</p>
                        {episode.description_vi && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {episode.description_vi}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Xem trước
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(episode.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatViews(episode.view_count)} lượt xem</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {episode.release_date 
                            ? new Date(episode.release_date).toLocaleDateString('vi-VN')
                            : 'Chưa phát hành'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>Chưa có đánh giá</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEpisodes.length === 0 && (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    Không tìm thấy episode nào phù hợp
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
