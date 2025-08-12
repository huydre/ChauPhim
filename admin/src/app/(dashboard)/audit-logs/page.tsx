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
  MoreHorizontal
} from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  user_name: string
  user_email: string
  action: string
  resource_type: string
  resource_id?: string
  ip_address: string
  user_agent: string
  timestamp: string
  status: 'SUCCESS' | 'FAILED' | 'WARNING'
  details: Record<string, any>
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'FAILED' | 'WARNING'>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')

  // Mock data for audit logs
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      user_id: '1',
      user_name: 'Admin User',
      user_email: 'admin@chauphim.com',
      action: 'CREATE_VIDEO',
      resource_type: 'video',
      resource_id: 'video_123',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-11T10:30:00Z',
      status: 'SUCCESS',
      details: {
        title: 'New Movie Upload',
        genre: 'Action',
        size: '2.5GB'
      }
    },
    {
      id: '2',
      user_id: '2',
      user_name: 'Editor User',
      user_email: 'editor@chauphim.com',
      action: 'UPDATE_USER',
      resource_type: 'user',
      resource_id: 'user_456',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2025-08-11T09:15:00Z',
      status: 'SUCCESS',
      details: {
        field_changed: 'role',
        old_value: 'USER',
        new_value: 'EDITOR'
      }
    },
    {
      id: '3',
      user_id: '1',
      user_name: 'Admin User',
      user_email: 'admin@chauphim.com',
      action: 'DELETE_COMMENT',
      resource_type: 'comment',
      resource_id: 'comment_789',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2025-08-11T08:45:00Z',
      status: 'SUCCESS',
      details: {
        reason: 'Inappropriate content',
        video_id: 'video_123'
      }
    },
    {
      id: '4',
      user_id: '3',
      user_name: 'Unknown User',
      user_email: 'unknown@example.com',
      action: 'LOGIN_ATTEMPT',
      resource_type: 'auth',
      ip_address: '203.113.123.45',
      user_agent: 'curl/7.68.0',
      timestamp: '2025-08-11T07:20:00Z',
      status: 'FAILED',
      details: {
        reason: 'Invalid credentials',
        attempts_count: 3
      }
    },
    {
      id: '5',
      user_id: '2',
      user_name: 'Editor User',
      user_email: 'editor@chauphim.com',
      action: 'UPLOAD_FILE',
      resource_type: 'file',
      resource_id: 'file_999',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2025-08-11T06:10:00Z',
      status: 'WARNING',
      details: {
        filename: 'large_video.mp4',
        size: '8GB',
        warning: 'File size exceeds recommended limit'
      }
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-100 text-green-800">Thành công</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Thất bại</Badge>
      case 'WARNING':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>
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
      'LOGIN_ATTEMPT': 'Thử đăng nhập',
      'LOGOUT': 'Đăng xuất',
      'UPLOAD_FILE': 'Tải lên file',
      'DELETE_FILE': 'Xóa file',
      'CHANGE_SETTINGS': 'Thay đổi cài đặt'
    }
    return actionMap[action] || action
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN')
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    
    return matchesSearch && matchesStatus && matchesAction
  })

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))]

  const exportLogs = () => {
    // Export logs to CSV
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_name,
        log.action,
        log.resource_type,
        log.status,
        log.ip_address
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
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
          <Button variant="outline" onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
              {Math.round(auditLogs.filter(log => log.status === 'SUCCESS').length / auditLogs.length * 100)}% tổng
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
              {new Set(auditLogs.map(log => log.user_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Người dùng duy nhất
            </p>
          </CardContent>
        </Card>
      </div>

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
              <option value="WARNING">Cảnh báo</option>
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
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="all">Tất cả</option>
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
          <div className="space-y-4">
            {filteredLogs.map((log) => (
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
                      <span>{log.user_name} ({log.user_email})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>IP: {log.ip_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-3 w-3" />
                      <span>
                        {log.resource_type}
                        {log.resource_id && ` (${log.resource_id})`}
                      </span>
                    </div>
                  </div>
                  
                  {Object.keys(log.details).length > 0 && (
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

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">
                  Không tìm thấy nhật ký nào phù hợp với bộ lọc
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
