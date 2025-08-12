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
  Filter, 
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import { useAuditLogs, useAuditLogStats, useExportAuditLogs } from '@/hooks/api'
import { AuditLog } from '@/types/api'

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'FAILED'>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Build API parameters
  const apiParams = {
    page: page.toString(),
    limit: limit.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(actionFilter !== 'all' && { action: actionFilter }),
  }

  // Fetch data from API
  const { data: auditLogsResponse, isLoading, error } = useAuditLogs(apiParams)
  const { data: statsResponse, isLoading: statsLoading } = useAuditLogStats(dateRange)
  const exportMutation = useExportAuditLogs()

  const auditLogs = auditLogsResponse?.data || []
  const totalLogs = auditLogsResponse?.pagination?.total || 0
  const totalPages = auditLogsResponse?.pagination?.pages || 1
  const stats = statsResponse?.data

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Thành công</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Thất bại</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getActionDescription = (action: string) => {
    const actionMap: Record<string, string> = {
      'CREATE_VIDEO': 'Tạo video mới',
      'UPDATE_VIDEO': 'Cập nhật video',
      'DELETE_VIDEO': 'Xóa video',
      'CREATE_USER': 'Tạo người dùng',
      'UPDATE_USER': 'Cập nhật người dùng',
      'DELETE_USER': 'Xóa người dùng',
      'CREATE_COMMENT': 'Tạo bình luận',
      'UPDATE_COMMENT': 'Cập nhật bình luận',
      'DELETE_COMMENT': 'Xóa bình luận',
      'LOGIN_SUCCESS': 'Đăng nhập thành công',
      'LOGIN_FAILED': 'Đăng nhập thất bại',
      'LOGOUT': 'Đăng xuất',
      'UPLOAD_FILE': 'Tải lên file',
      'DELETE_FILE': 'Xóa file',
      'CHANGE_SETTINGS': 'Thay đổi cài đặt',
      'PUBLISH_VIDEO': 'Xuất bản video',
      'UNPUBLISH_VIDEO': 'Hủy xuất bản video',
      'TRANSCODE_VIDEO': 'Chuyển đổi video',
    }
    return actionMap[action] || action
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN')
  }

  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.ip || '').includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesStatus && matchesAction
  })

  const uniqueActions = [...new Set(auditLogs.map((log: AuditLog) => log.action))]

  const handleExport = (format: 'csv' | 'json' = 'csv') => {
    exportMutation.mutate({
      format,
      filters: {
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(actionFilter !== 'all' && { action: actionFilter }),
      }
    })
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-muted-foreground">Không thể tải audit logs. Vui lòng thử lại sau.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Nhật ký hệ thống</h1>
          <p className="text-muted-foreground">
            Theo dõi và kiểm tra hoạt động của người dùng trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalLogs}</div>
              <p className="text-xs text-muted-foreground">
                Trong {dateRange === '24h' ? '24 giờ qua' : dateRange === '7d' ? '7 ngày qua' : '30 ngày qua'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thành công</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.summary.successCount}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(stats.summary.successRate)}% tổng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.summary.failedCount}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.summary.failedCount / stats.summary.totalLogs) * 100)}% tổng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.uniqueUsersCount}</div>
              <p className="text-xs text-muted-foreground">
                Người dùng duy nhất
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                Trong 7 ngày qua
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thành công</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {auditLogs.filter(log => log.status === 'SUCCESS').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {auditLogs.length > 0 ? Math.round(auditLogs.filter(log => log.status === 'SUCCESS').length / auditLogs.length * 100) : 0}% tổng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {auditLogs.filter(log => log.status === 'FAILED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Cần chú ý
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(auditLogs.map(log => log.userId)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Người dùng duy nhất
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Lọc nhật ký theo tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo người dùng, hành động, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILED">Thất bại</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả hành động</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {getActionDescription(action)}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký hoạt động ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có logs</h3>
              <p className="text-muted-foreground">Không tìm thấy logs nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log: AuditLog) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(log.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {getActionDescription(log.action)}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
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
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Xuất thông tin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{log.userName} ({log.userEmail})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>IP: {log.ip || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>
                          {log.resource}
                          {log.resourceId && ` (${log.resourceId})`}
                        </span>
                      </div>
                    </div>
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Chi tiết: </span>
                        {Object.entries(log.details).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {page} của {totalPages} ({totalLogs} logs)
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i + 1))
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
