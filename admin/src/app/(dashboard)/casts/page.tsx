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
import { useCastMembers } from '@/hooks/api'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  Eye,
  Calendar,
  MapPin,
  Award,
  Star
} from 'lucide-react'
import type { CastMember } from '@/types/api'

export default function CastPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'actor' | 'director' | 'producer'>('all')

  const { data: castResponse, isLoading } = useCastMembers({
    search: searchTerm,
    role: roleFilter === 'all' ? undefined : roleFilter,
  })

  const castMembers = castResponse?.data || []
  const total = castResponse?.pagination?.total || 0

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'actor':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Diễn viên</Badge>
      case 'director':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Đạo diễn</Badge>
      case 'producer':
        return <Badge variant="default" className="bg-green-100 text-green-800">Nhà sản xuất</Badge>
      default:
        return <Badge variant="secondary">Khác</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'actor':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'director':
        return <Award className="h-4 w-4 text-purple-600" />
      case 'producer':
        return <Star className="h-4 w-4 text-green-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý diễn viên & đoàn phim</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý diễn viên & đoàn phim</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin diễn viên, đạo diễn và đoàn làm phim
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thành viên
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc thành viên theo vai trò
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'actor' | 'director' | 'producer')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="actor">Diễn viên</option>
              <option value="director">Đạo diễn</option>
              <option value="producer">Nhà sản xuất</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cast Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {castMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.name}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="bg-primary/10 text-primary text-lg font-medium h-full w-full rounded-full flex items-center justify-center">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(member.role)}
                      {getRoleBadge(member.role)}
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
            <CardContent>
              <div className="space-y-3">
                {member.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {member.bio}
                  </p>
                )}
                
                <div className="space-y-2">
                  {member.birth_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Sinh: {new Date(member.birth_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  
                  {member.nationality && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{member.nationality}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{member.video_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Phim tham gia</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {member.awards_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Giải thưởng</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <span>ID: {member.id.slice(-6)}</span>
                  <span>
                    {new Date(member.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {castMembers.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Không tìm thấy thành viên nào phù hợp' 
                  : 'Chưa có thành viên nào'
                }
              </div>
              {!searchTerm && roleFilter === 'all' && (
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm thành viên đầu tiên
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground text-center">
              Tổng cộng: <span className="font-medium">{total}</span> thành viên
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
