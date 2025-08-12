'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Play, 
  Eye, 
  MessageSquare,
  Calendar,
  Clock,
  Star,
  Download,
  Plus,
  Activity,
  DollarSign,
  Video,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data for dashboard stats
  const stats = {
    totalVideos: 1247,
    totalUsers: 25840,
    totalViews: 2450000,
    revenue: 125000,
    growth: {
      videos: 12.5,
      users: 8.3,
      views: 23.1,
      revenue: 15.7
    }
  }

  const recentActivities = [
    {
      id: '1',
      type: 'video_upload',
      user: 'Admin User',
      action: 'uploaded new video',
      target: 'Avengers: Endgame',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'user_register',
      user: 'System',
      action: 'new user registered',
      target: 'john.doe@example.com',
      time: '5 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'comment_report',
      user: 'Moderation',
      action: 'comment reported',
      target: 'Inappropriate content',
      time: '10 minutes ago',
      status: 'warning'
    },
    {
      id: '4',
      type: 'payment',
      user: 'System',
      action: 'payment received',
      target: '$99.99 subscription',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'video_delete',
      user: 'Editor User',
      action: 'deleted video',
      target: 'Old Movie (2010)',
      time: '30 minutes ago',
      status: 'danger'
    }
  ]

  const topVideos = [
    {
      id: '1',
      title: 'Avengers: Endgame',
      views: 125000,
      rating: 4.8,
      revenue: 15000,
      thumbnail: '/thumbnails/avengers.jpg'
    },
    {
      id: '2',
      title: 'Parasite',
      views: 98000,
      rating: 4.9,
      revenue: 12000,
      thumbnail: '/thumbnails/parasite.jpg'
    },
    {
      id: '3',
      title: 'Inception',
      views: 87000,
      rating: 4.7,
      revenue: 10500,
      thumbnail: '/thumbnails/inception.jpg'
    },
    {
      id: '4',
      title: 'The Dark Knight',
      views: 76000,
      rating: 4.8,
      revenue: 9200,
      thumbnail: '/thumbnails/dark-knight.jpg'
    }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount * 1000)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video_upload':
        return <Video className="h-4 w-4 text-blue-600" />
      case 'user_register':
        return <Users className="h-4 w-4 text-green-600" />
      case 'comment_report':
        return <MessageSquare className="h-4 w-4 text-yellow-600" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'video_delete':
        return <Video className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Thành công</Badge>
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>
      case 'danger':
        return <Badge variant="destructive">Lỗi</Badge>
      default:
        return <Badge variant="secondary">Khác</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan hệ thống ChauPhim VOD
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button asChild>
            <Link href="/videos/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm video mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalVideos)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.growth.videos}%</span>
              <span className="ml-1">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.growth.users}%</span>
              <span className="ml-1">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.growth.views}%</span>
              <span className="ml-1">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{stats.growth.revenue}%</span>
              <span className="ml-1">từ tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Videos</CardTitle>
            <CardDescription>
              Videos có lượt xem cao nhất tuần này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVideos.map((video, index) => (
                <div key={video.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(video.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{video.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(video.revenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>
            Các chức năng thường dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/videos/new">
                <Video className="h-6 w-6 mb-2" />
                <span>Thêm Video</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/users">
                <Users className="h-6 w-6 mb-2" />
                <span>Quản lý Users</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/comments">
                <MessageSquare className="h-6 w-6 mb-2" />
                <span>Kiểm duyệt</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/analytics">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>Báo cáo</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
