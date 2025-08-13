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
import { useCreateUploadUrl } from '@/hooks/api'
import { 
  Search, 
  Upload, 
  MoreHorizontal, 
  Download,
  Eye,
  Trash2,
  HardDrive,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  FolderOpen,
  Plus,
  RefreshCw
} from 'lucide-react'

interface StorageFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  created_at: string
  updated_at: string
}

export default function StoragePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  // Mock data for storage files
  const storageFiles: StorageFile[] = [
    {
      id: '1',
      name: 'movie-poster-1.jpg',
      type: 'image/jpeg',
      size: 1024000,
      url: '/uploads/posters/movie-poster-1.jpg',
      created_at: '2025-08-10T10:00:00Z',
      updated_at: '2025-08-10T10:00:00Z',
    },
    {
      id: '2',
      name: 'trailer-video.mp4',
      type: 'video/mp4',
      size: 50000000,
      url: '/uploads/videos/trailer-video.mp4',
      created_at: '2025-08-09T15:30:00Z',
      updated_at: '2025-08-09T15:30:00Z',
    },
    {
      id: '3',
      name: 'soundtrack.mp3',
      type: 'audio/mpeg',
      size: 5000000,
      url: '/uploads/audio/soundtrack.mp3',
      created_at: '2025-08-08T20:15:00Z',
      updated_at: '2025-08-08T20:15:00Z',
    },
  ]

  const createUploadUrlMutation = useCreateUploadUrl()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-600" />
    } else if (type.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-600" />
    } else if (type.startsWith('audio/')) {
      return <Music className="h-5 w-5 text-green-600" />
    } else if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="h-5 w-5 text-red-600" />
    } else if (type.includes('zip') || type.includes('rar')) {
      return <Archive className="h-5 w-5 text-orange-600" />
    } else {
      return <File className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    if (type.startsWith('image/')) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Hình ảnh</Badge>
    } else if (type.startsWith('video/')) {
      return <Badge variant="default" className="bg-purple-100 text-purple-800">Video</Badge>
    } else if (type.startsWith('audio/')) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Âm thanh</Badge>
    } else {
      return <Badge variant="secondary">Khác</Badge>
    }
  }

  const filteredFiles = storageFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'image' && file.type.startsWith('image/')) ||
      (typeFilter === 'video' && file.type.startsWith('video/')) ||
      (typeFilter === 'audio' && file.type.startsWith('audio/')) ||
      (typeFilter === 'document' && (file.type.includes('pdf') || file.type.includes('document')))
    
    return matchesSearch && matchesType
  })

  const totalSize = storageFiles.reduce((total, file) => total + file.size, 0)
  const usedStorage = totalSize
  const totalStorage = 100 * 1024 * 1024 * 1024 // 100GB
  const storagePercent = (usedStorage / totalStorage) * 100

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of files) {
      try {
        const uploadData = await createUploadUrlMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          file_size: file.size,
        })
        
        // Upload file to the pre-signed URL
        const formData = new FormData()
        Object.entries(uploadData.fields).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append('file', file)

        await fetch(uploadData.url, {
          method: 'POST',
          body: formData,
        })

        console.log('File uploaded successfully:', file.name)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý lưu trữ</h1>
          <p className="text-muted-foreground">
            Quản lý files, hình ảnh, video và tài liệu của hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Tải lên
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
          </Button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng dung lượng</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalStorage)}</div>
            <p className="text-xs text-muted-foreground">
              Đã sử dụng {storagePercent.toFixed(1)}%
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã sử dụng</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(usedStorage)}</div>
            <p className="text-xs text-muted-foreground">
              Trong {storageFiles.length} files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files hình ảnh</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageFiles.filter(f => f.type.startsWith('image/')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(
                storageFiles
                  .filter(f => f.type.startsWith('image/'))
                  .reduce((sum, f) => sum + f.size, 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageFiles.filter(f => f.type.startsWith('video/')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(
                storageFiles
                  .filter(f => f.type.startsWith('video/'))
                  .reduce((sum, f) => sum + f.size, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc files theo loại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Tất cả loại</option>
              <option value="image">Hình ảnh</option>
              <option value="video">Video</option>
              <option value="audio">Âm thanh</option>
              <option value="document">Tài liệu</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Files ({filteredFiles.length})</CardTitle>
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Đã chọn {selectedFiles.length} files
              </span>
              <Button size="sm" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa đã chọn
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" title={file.name}>
                          {file.name}
                        </p>
                        {getTypeBadge(file.type)}
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
                          Xem
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Tải xuống
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
                <CardContent className="pt-0">
                  {/* Preview */}
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Kích thước:</span>
                      <span className="font-medium">{formatFileSize(file.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loại:</span>
                      <span className="font-medium">{file.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tải lên:</span>
                      <span className="font-medium">
                        {new Date(file.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Không tìm thấy file nào phù hợp' 
                  : 'Chưa có file nào'
                }
              </div>
              {!searchTerm && typeFilter === 'all' && (
                <Button className="mt-4 relative">
                  <Plus className="mr-2 h-4 w-4" />
                  Tải lên file đầu tiên
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
