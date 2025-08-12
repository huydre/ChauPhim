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
import { useJobs } from '@/hooks/api'
import { 
  Search, 
  MoreHorizontal, 
  Briefcase,
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw,
  Filter
} from 'lucide-react'
import type { Job } from '@/types/api'

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'video_processing' | 'thumbnail_generation' | 'email_sending'>('all')

  const { data: jobsResponse, isLoading } = useJobs({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const jobs = jobsResponse?.data || []
  const total = jobsResponse?.pagination?.total || 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case 'PROCESSING':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Đang xử lý</Badge>
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Thất bại</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'CANCELLED':
        return <X className="h-4 w-4 text-gray-600" />
      default:
        return <Briefcase className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video_processing':
        return <Play className="h-4 w-4 text-purple-600" />
      case 'thumbnail_generation':
        return <Zap className="h-4 w-4 text-orange-600" />
      case 'email_sending':
        return <Briefcase className="h-4 w-4 text-blue-600" />
      default:
        return <Briefcase className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'video_processing':
        return 'Xử lý video'
      case 'thumbnail_generation':
        return 'Tạo thumbnail'
      case 'email_sending':
        return 'Gửi email'
      default:
        return type
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const duration = end.getTime() - start.getTime()
    
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Giám sát công việc</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Giám sát công việc</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các background jobs của hệ thống
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc công việc theo trạng thái và loại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo ID, loại công việc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="failed">Thất bại</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tất cả loại</option>
                <option value="video_processing">Xử lý video</option>
                <option value="thumbnail_generation">Tạo thumbnail</option>
                <option value="email_sending">Gửi email</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                    {getTypeIcon(job.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{getTypeName(job.type)}</h4>
                      {getStatusIcon(job.status)}
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>ID: {job.id}</span>
                        <span>Tạo: {new Date(job.created_at).toLocaleString('vi-VN')}</span>
                        {job.started_at && (
                          <span>Bắt đầu: {new Date(job.started_at).toLocaleString('vi-VN')}</span>
                        )}
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
                      <Play className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    
                    {job.status === 'PENDING' && (
                      <DropdownMenuItem className="text-blue-600">
                        <Play className="mr-2 h-4 w-4" />
                        Chạy ngay
                      </DropdownMenuItem>
                    )}
                    
                    {job.status === 'PROCESSING' && (
                      <DropdownMenuItem className="text-orange-600">
                        <Pause className="mr-2 h-4 w-4" />
                        Tạm dừng
                      </DropdownMenuItem>
                    )}
                    
                    {job.status === 'FAILED' && (
                      <DropdownMenuItem className="text-green-600">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Thử lại
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <X className="mr-2 h-4 w-4" />
                      Hủy job
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Progress */}
                {job.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tiến độ</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Job Input */}
                {job.input && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Dữ liệu đầu vào:</div>
                    <div className="bg-muted/50 rounded p-2 text-xs font-mono">
                      {typeof job.input === 'string' 
                        ? job.input 
                        : JSON.stringify(job.input, null, 2)
                      }
                    </div>
                  </div>
                )}

                {/* Job Output */}
                {job.output && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Kết quả:</div>
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-xs font-mono">
                      {typeof job.output === 'string' 
                        ? job.output 
                        : JSON.stringify(job.output, null, 2)
                      }
                    </div>
                  </div>
                )}

                {/* Error */}
                {job.error && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-red-600">Lỗi:</div>
                    <div className="bg-red-50 border border-red-200 rounded p-2 text-xs font-mono text-red-800">
                      {job.error}
                    </div>
                  </div>
                )}

                {/* Timing */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span>Preset: {job.preset || 'Mặc định'}</span>
                    {job.started_at && job.completed_at && (
                      <span>Thời gian: {formatDuration(job.started_at, job.completed_at)}</span>
                    )}
                    {job.started_at && !job.completed_at && job.status === 'PROCESSING' && (
                      <span>Đã chạy: {formatDuration(job.started_at)}</span>
                    )}
                  </div>
                  {job.completed_at && (
                    <span>
                      Hoàn thành: {new Date(job.completed_at).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Không tìm thấy công việc nào phù hợp' 
                  : 'Chưa có công việc nào'
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
              Tổng cộng: <span className="font-medium">{total}</span> công việc
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
