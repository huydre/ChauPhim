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
  Star,
  MoreHorizontal, 
  Eye,
  Trash2,
  Flag,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Filter,
  Download,
  BarChart,
  User,
  Calendar
} from 'lucide-react'

interface Rating {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  video_id: string
  video_title: string
  video_poster?: string
  rating: number
  review?: string
  is_verified: boolean
  helpful_count: number
  unhelpful_count: number
  created_at: string
  updated_at: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
}

export default function RatingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')

  // Mock data for ratings
  const ratings: Rating[] = [
    {
      id: '1',
      user_id: '1',
      user_name: 'Nguyễn Văn A',
      user_avatar: '/avatars/user1.jpg',
      video_id: 'video_1',
      video_title: 'The Avengers: Endgame',
      video_poster: '/posters/avengers-endgame.jpg',
      rating: 5,
      review: 'Bộ phim tuyệt vời! Kết thúc hoàn hảo cho saga Infinity. Cảm động và hành động đỉnh cao.',
      is_verified: true,
      helpful_count: 125,
      unhelpful_count: 8,
      created_at: '2025-08-10T14:30:00Z',
      updated_at: '2025-08-10T14:30:00Z',
      status: 'APPROVED'
    },
    {
      id: '2',
      user_id: '2',
      user_name: 'Trần Thị B',
      user_avatar: '/avatars/user2.jpg',
      video_id: 'video_2',
      video_title: 'Parasite',
      video_poster: '/posters/parasite.jpg',
      rating: 4,
      review: 'Phim hay, nội dung sâu sắc về vấn đề xã hội. Diễn xuất tốt.',
      is_verified: false,
      helpful_count: 89,
      unhelpful_count: 12,
      created_at: '2025-08-09T10:15:00Z',
      updated_at: '2025-08-09T10:15:00Z',
      status: 'APPROVED'
    },
    {
      id: '3',
      user_id: '3',
      user_name: 'Lê Văn C',
      video_id: 'video_1',
      video_title: 'The Avengers: Endgame',
      video_poster: '/posters/avengers-endgame.jpg',
      rating: 2,
      review: 'Quá dài và nhàm chán. Nhiều phần không cần thiết.',
      is_verified: false,
      helpful_count: 23,
      unhelpful_count: 67,
      created_at: '2025-08-08T16:45:00Z',
      updated_at: '2025-08-08T16:45:00Z',
      status: 'PENDING'
    },
    {
      id: '4',
      user_id: '4',
      user_name: 'Phạm Thị D',
      user_avatar: '/avatars/user4.jpg',
      video_id: 'video_3',
      video_title: 'Inception',
      video_poster: '/posters/inception.jpg',
      rating: 5,
      review: 'Kiệt tác của Christopher Nolan! Cốt truyện phức tạp nhưng rất hấp dẫn.',
      is_verified: true,
      helpful_count: 156,
      unhelpful_count: 4,
      created_at: '2025-08-07T09:20:00Z',
      updated_at: '2025-08-07T09:20:00Z',
      status: 'APPROVED'
    },
    {
      id: '5',
      user_id: '5',
      user_name: 'Hoàng Văn E',
      video_id: 'video_2',
      video_title: 'Parasite',
      video_poster: '/posters/parasite.jpg',
      rating: 1,
      review: 'Phim tệ, không hiểu được nội dung. Lãng phí thời gian.',
      is_verified: false,
      helpful_count: 5,
      unhelpful_count: 78,
      created_at: '2025-08-06T20:10:00Z',
      updated_at: '2025-08-06T20:10:00Z',
      status: 'REJECTED'
    }
  ]

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case 'PENDING':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getRatingStats = () => {
    const total = ratings.length
    const approved = ratings.filter(r => r.status === 'APPROVED').length
    const pending = ratings.filter(r => r.status === 'PENDING').length
    const rejected = ratings.filter(r => r.status === 'REJECTED').length
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / total

    return { total, approved, pending, rejected, avgRating }
  }

  const filteredRatings = ratings.filter(rating => {
    const matchesSearch = 
      rating.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.video_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.review?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = ratingFilter === 'all' || rating.rating.toString() === ratingFilter
    const matchesStatus = statusFilter === 'all' || rating.status === statusFilter
    
    return matchesSearch && matchesRating && matchesStatus
  })

  const sortedRatings = [...filteredRatings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      case 'helpful':
        return b.helpful_count - a.helpful_count
      default:
        return 0
    }
  })

  const stats = getRatingStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đánh giá & Reviews</h1>
          <p className="text-muted-foreground">
            Quản lý đánh giá và nhận xét của người dùng về các video
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Phân tích
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đánh giá</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(stats.avgRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.approved / stats.total * 100)}% tổng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Flag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Cần xem xét
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Vi phạm quy định
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc đánh giá theo tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên user, video, nội dung review..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả điểm</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
              <option value="helpful">Hữu ích nhất</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đánh giá ({sortedRatings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedRatings.map((rating) => (
              <div key={rating.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {rating.user_avatar ? (
                      <img 
                        src={rating.user_avatar} 
                        alt={rating.user_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rating.user_name}</span>
                        {rating.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        {getStatusBadge(rating.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{rating.video_title}</span>
                        <span>•</span>
                        <span>{new Date(rating.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
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
                          Xem chi tiết
                        </DropdownMenuItem>
                        {rating.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem className="text-green-600">
                              <Eye className="mr-2 h-4 w-4" />
                              Duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Flag className="mr-2 h-4 w-4" />
                              Từ chối
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {renderStars(rating.rating, 'md')}
                    <span className="font-medium text-lg">{rating.rating}/5</span>
                  </div>
                  
                  {rating.review && (
                    <p className="text-sm leading-relaxed">{rating.review}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{rating.helpful_count} hữu ích</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />
                      <span>{rating.unhelpful_count} không hữu ích</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>Phản hồi</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-16 h-24 bg-muted rounded-lg flex items-center justify-center">
                    {rating.video_poster ? (
                      <img 
                        src={rating.video_poster} 
                        alt={rating.video_title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Star className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sortedRatings.length === 0 && (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  Không tìm thấy đánh giá nào phù hợp với bộ lọc
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
