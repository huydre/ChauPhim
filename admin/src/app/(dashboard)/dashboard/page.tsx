'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Video, 
  Star, 
  TrendingUp, 
  Plus,
  BarChart3,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { getAuthenticatedApiClient } from '@/lib/auth-utils'
import type { DashboardStats } from '@/types/api'

// Mock data for now - will be replaced with real API calls
const mockStats: DashboardStats = {
  total_views: 125340,
  active_users: 2847,
  average_rating: 4.3,
  new_videos: 23,
  views_chart: [
    { date: '2024-01-01', views: 1200 },
    { date: '2024-01-02', views: 1350 },
    { date: '2024-01-03', views: 1100 },
    { date: '2024-01-04', views: 1480 },
    { date: '2024-01-05', views: 1650 },
    { date: '2024-01-06', views: 1320 },
    { date: '2024-01-07', views: 1890 },
  ],
  genre_distribution: [
    { genre: 'Action', count: 45 },
    { genre: 'Drama', count: 38 },
    { genre: 'Comedy', count: 32 },
    { genre: 'Horror', count: 28 },
    { genre: 'Romance', count: 22 },
  ],
  trending_videos: [
    {
      video: {
        id: '1',
        slug: 'avengers-endgame',
        title_vi: 'Avengers: Endgame',
        title_en: 'Avengers: Endgame',
        type: 'MOVIE',
        year: 2019,
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        genres: [],
        cast: [],
      },
      views: 15420
    },
    {
      video: {
        id: '2',
        slug: 'stranger-things',
        title_vi: 'Stranger Things',
        title_en: 'Stranger Things',
        type: 'SERIES',
        year: 2016,
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        genres: [],
        cast: [],
      },
      views: 12380
    },
  ]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with real API call
      // const apiClient = getAuthenticatedApiClient()
      // const data = await apiClient.get<DashboardStats>('/admin/dashboard/stats')
      // setStats(data)
      
      // For now, use mock data
      setTimeout(() => {
        setStats(mockStats)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to ChauPhim Admin Panel</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/videos/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_views)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.active_users)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_videos}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Genre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.genre_distribution.map((genre) => (
                <div key={genre.genre} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{genre.genre}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ 
                          width: `${(genre.count / Math.max(...stats.genre_distribution.map(g => g.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{genre.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.trending_videos.map((item, index) => (
                <div key={item.video.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.video.title_vi}</p>
                      <p className="text-xs text-gray-500">
                        {item.video.type} • {item.video.year}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatNumber(item.views)}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/analytics">
                View Full Analytics
                <TrendingUp className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/dashboard/videos/new">
                <Video className="h-6 w-6" />
                Create Video
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/dashboard/users">
                <Users className="h-6 w-6" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/dashboard/comments">
                <Star className="h-6 w-6" />
                Review Comments
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href="/dashboard/jobs">
                <TrendingUp className="h-6 w-6" />
                View Jobs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
