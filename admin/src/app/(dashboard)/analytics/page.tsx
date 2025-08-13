'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Download
} from 'lucide-react'

export default function AnalyticsPage() {
  // Mock data for analytics
  const metrics = {
    totalViews: 1250000,
    totalUsers: 45680,
    totalVideos: 850,
    totalComments: 12340,
    viewsGrowth: 15.2,
    usersGrowth: 8.7,
    videosGrowth: 5.1,
    commentsGrowth: 22.3,
  }

  const topVideos = [
    { id: '1', title: 'Avengers: Endgame', views: 125000, rating: 9.1 },
    { id: '2', title: 'Spider-Man: No Way Home', views: 98000, rating: 8.8 },
    { id: '3', title: 'The Batman', views: 87000, rating: 8.5 },
    { id: '4', title: 'Doctor Strange 2', views: 76000, rating: 7.9 },
    { id: '5', title: 'Thor: Love and Thunder', views: 65000, rating: 7.2 },
  ]

  const recentActivity = [
    { type: 'video', action: 'Đã tải lên video mới', title: 'The Flash', time: '2 giờ trước' },
    { type: 'user', action: 'Người dùng mới đăng ký', title: 'user@example.com', time: '3 giờ trước' },
    { type: 'comment', action: 'Bình luận mới', title: 'Avatar 2', time: '4 giờ trước' },
    { type: 'video', action: 'Video được duyệt', title: 'John Wick 4', time: '5 giờ trước' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4 text-blue-600" />
      case 'user':
        return <Users className="h-4 w-4 text-green-600" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phân tích</h1>
          <p className="text-muted-foreground">
            Thống kê và phân tích dữ liệu hệ thống
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalViews)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.viewsGrowth}%</span>
              <span className="ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.usersGrowth}%</span>
              <span className="ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng video</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalVideos)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.videosGrowth}%</span>
              <span className="ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bình luận</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalComments)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.commentsGrowth}%</span>
              <span className="ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Video hàng đầu</CardTitle>
            <CardDescription>
              Top 5 video có lượt xem cao nhất tháng này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVideos.map((video, index) => (
                <div key={video.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{video.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(video.views)} lượt xem
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{video.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trên hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{activity.action}</div>
                    <div className="font-medium truncate">{activity.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Views Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ lượt xem</CardTitle>
            <CardDescription>
              Lượt xem video theo thời gian (30 ngày qua)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] bg-muted/50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  Biểu đồ sẽ được hiển thị ở đây
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Cần tích hợp thư viện charts như Chart.js hoặc Recharts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Registration Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Người dùng mới</CardTitle>
            <CardDescription>
              Số lượng người dùng đăng ký mới (30 ngày qua)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] bg-muted/50 rounded-lg">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  Biểu đồ sẽ được hiển thị ở đây
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Có thể sử dụng Chart.js, Recharts, hoặc D3.js
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái hệ thống</CardTitle>
          <CardDescription>
            Tình trạng hoạt động của các dịch vụ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">API Server</div>
                <div className="text-sm text-muted-foreground">Hoạt động bình thường</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-muted-foreground">Kết nối ổn định</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <div className="font-medium">Storage</div>
                <div className="text-sm text-muted-foreground">Sử dụng 78%</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="font-medium">CDN</div>
                <div className="text-sm text-muted-foreground">Tốc độ tối ưu</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
