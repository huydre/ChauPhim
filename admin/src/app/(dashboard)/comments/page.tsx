'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useComments, useUpdateCommentStatus } from '@/hooks/api'
import { 
  Search, 
  MoreHorizontal, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Flag,
  Trash2,
  Clock,
  User
} from 'lucide-react'
import type { Comment } from '@/types/api'

export default function CommentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const { data: commentsResponse, isLoading } = useComments({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const comments = commentsResponse?.data || []
  const total = commentsResponse?.pagination?.total || 0

  const updateCommentStatusMutation = useUpdateCommentStatus()

  const handleStatusChange = async (commentId: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await updateCommentStatusMutation.mutateAsync({ commentId, status })
    } catch (error) {
      console.error('Error updating comment status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case 'rejected':
        return <Badge variant="destructive">Từ chối</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Kiểm duyệt bình luận</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kiểm duyệt bình luận</h1>
          <p className="text-muted-foreground">
            Quản lý và kiểm duyệt bình luận của người dùng
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc bình luận theo trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nội dung bình luận..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <div className="bg-primary/10 text-primary text-sm font-medium h-full w-full rounded-full flex items-center justify-center">
                      {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{comment.user?.name || 'Người dùng ẩn danh'}</h4>
                      {getStatusIcon(comment.status)}
                      {getStatusBadge(comment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Video: {comment.video?.title_vi || 'Không xác định'}</span>
                        <span>{new Date(comment.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
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
                    <DropdownMenuSeparator />
                    
                    {comment.status !== 'approved' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        disabled={updateCommentStatusMutation.isPending}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Duyệt bình luận
                      </DropdownMenuItem>
                    )}
                    
                    {comment.status !== 'rejected' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                        disabled={updateCommentStatusMutation.isPending}
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Từ chối bình luận
                      </DropdownMenuItem>
                    )}
                    
                    {comment.status !== 'pending' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(comment.id, 'pending')}
                        disabled={updateCommentStatusMutation.isPending}
                        className="text-yellow-600"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Đặt chờ duyệt
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-4 w-4" />
                      Báo cáo spam
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa bình luận
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
                
                {comment.parent_id && (
                  <div className="border-l-2 border-muted pl-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      Trả lời bình luận
                    </div>
                    <div className="bg-muted/30 rounded p-2 text-sm">
                      {/* Parent comment content would be shown here */}
                      <span className="text-muted-foreground">Bình luận gốc...</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>ID người dùng: {comment.user_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>ID: {comment.id.slice(-6)}</span>
                    </div>
                  </div>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-muted-foreground">
                      Chỉnh sửa: {new Date(comment.updated_at).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Không tìm thấy bình luận nào phù hợp' 
                  : 'Chưa có bình luận nào'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground text-center">
              Tổng cộng: <span className="font-medium">{total}</span> bình luận
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
