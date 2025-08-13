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
import { useUsers, useUpdateUserRole, useUpdateUserStatus } from '@/hooks/api'
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Ban, 
  CheckCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'USER' | 'ADMIN'>('all')

  const { data: usersResponse, isLoading } = useUsers({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    role: roleFilter === 'all' ? undefined : roleFilter,
  })

  const users = usersResponse?.data || []
  const total = usersResponse?.pagination?.total || 0

  const updateUserRoleMutation = useUpdateUserRole()
  const updateUserStatusMutation = useUpdateUserStatus()

  const handleRoleChange = async (userId: string, role: 'USER' | 'ADMIN') => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role })
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleStatusChange = async (userId: string, status: 'active' | 'banned') => {
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status })
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="h-4 w-4" />
      case 'USER':
        return <Shield className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoạt động</Badge>
      case 'banned':
        return <Badge variant="destructive">Bị cấm</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản người dùng, phân quyền và trạng thái
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc người dùng theo tiêu chí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'banned')}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="banned">Bị cấm</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'USER' | 'ADMIN')}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="USER">Người dùng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Người dùng</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Vai trò</th>
                  <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày tham gia</th>
                  <th className="text-left py-3 px-4 font-medium">Hoạt động cuối</th>
                  <th className="text-right py-3 px-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <div className="bg-primary/10 text-primary text-sm font-medium h-full w-full rounded-full flex items-center justify-center">
                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'Chưa có tên'}</div>
                          <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm">
                          {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString('vi-VN')
                        : 'Chưa đăng nhập'
                      }
                    </td>
                    <td className="py-3 px-4 text-right">
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
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          
                          {/* Role Management */}
                          {user.role === 'USER' ? (
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
                              disabled={updateUserRoleMutation.isPending}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Nâng cấp Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, 'USER')}
                              disabled={updateUserRoleMutation.isPending}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Hạ cấp User
                            </DropdownMenuItem>
                          )}

                          {/* Status Management */}
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user.id, 'banned')}
                              disabled={updateUserStatusMutation.isPending}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cấm tài khoản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user.id, 'active')}
                              disabled={updateUserStatusMutation.isPending}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Kích hoạt tài khoản
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa người dùng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Không tìm thấy người dùng nào</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
