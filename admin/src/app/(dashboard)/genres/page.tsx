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
import { useGenres, useCreateGenre, useUpdateGenre, useDeleteGenre } from '@/hooks/api'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Tag,
  Eye,
  Calendar
} from 'lucide-react'
import type { Genre } from '@/types/api'

export default function GenresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newGenre, setNewGenre] = useState({ name_vi: '', name_en: '', description: '' })

  const { data: genresResponse, isLoading } = useGenres({
    search: searchTerm,
  })

  const genres = genresResponse?.data || []
  const total = genresResponse?.pagination?.total || 0

  const createGenreMutation = useCreateGenre()
  const updateGenreMutation = useUpdateGenre()
  const deleteGenreMutation = useDeleteGenre()

  const handleCreateGenre = async () => {
    if (!newGenre.name_vi.trim()) return

    try {
      await createGenreMutation.mutateAsync(newGenre)
      setNewGenre({ name_vi: '', name_en: '', description: '' })
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating genre:', error)
    }
  }

  const handleUpdateGenre = async () => {
    if (!editingGenre) return

    try {
      await updateGenreMutation.mutateAsync({
        genreId: editingGenre.id,
        data: editingGenre,
      })
      setEditingGenre(null)
    } catch (error) {
      console.error('Error updating genre:', error)
    }
  }

  const handleDeleteGenre = async (genreId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return

    try {
      await deleteGenreMutation.mutateAsync(genreId)
    } catch (error) {
      console.error('Error deleting genre:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý thể loại</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý thể loại</h1>
          <p className="text-muted-foreground">
            Quản lý các thể loại phim và chương trình truyền hình
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thể loại
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
          <CardDescription>
            Tìm kiếm thể loại theo tên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(isCreating || editingGenre) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Thêm thể loại mới' : 'Chỉnh sửa thể loại'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên tiếng Việt*</label>
                <Input
                  value={isCreating ? newGenre.name_vi : editingGenre?.name_vi || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewGenre(prev => ({ ...prev, name_vi: e.target.value }))
                    } else if (editingGenre) {
                      setEditingGenre(prev => prev ? { ...prev, name_vi: e.target.value } : null)
                    }
                  }}
                  placeholder="Ví dụ: Hành động"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên tiếng Anh</label>
                <Input
                  value={isCreating ? newGenre.name_en : editingGenre?.name_en || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewGenre(prev => ({ ...prev, name_en: e.target.value }))
                    } else if (editingGenre) {
                      setEditingGenre(prev => prev ? { ...prev, name_en: e.target.value } : null)
                    }
                  }}
                  placeholder="Ví dụ: Action"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Input
                  value={isCreating ? newGenre.description : editingGenre?.description || ''}
                  onChange={(e) => {
                    if (isCreating) {
                      setNewGenre(prev => ({ ...prev, description: e.target.value }))
                    } else if (editingGenre) {
                      setEditingGenre(prev => prev ? { ...prev, description: e.target.value } : null)
                    }
                  }}
                  placeholder="Mô tả về thể loại này..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={isCreating ? handleCreateGenre : handleUpdateGenre}
                disabled={createGenreMutation.isPending || updateGenreMutation.isPending}
              >
                {isCreating ? 'Thêm' : 'Cập nhật'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false)
                  setEditingGenre(null)
                  setNewGenre({ name_vi: '', name_en: '', description: '' })
                }}
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Genres Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {genres.map((genre) => (
          <Card key={genre.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{genre.name_vi}</CardTitle>
                    {genre.name_en && (
                      <p className="text-sm text-muted-foreground">{genre.name_en}</p>
                    )}
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
                    <DropdownMenuItem onClick={() => setEditingGenre(genre)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteGenre(genre.id)}
                      className="text-destructive"
                      disabled={deleteGenreMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {genre.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {genre.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(genre.created_at).toLocaleDateString('vi-VN')}
                </div>
                <Badge variant="secondary" className="text-xs">
                  ID: {genre.id.slice(-6)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {genres.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy thể loại nào' : 'Chưa có thể loại nào'}
              </div>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm thể loại đầu tiên
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
              Tổng cộng: <span className="font-medium">{total}</span> thể loại
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
