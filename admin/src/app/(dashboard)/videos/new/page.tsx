'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Save,
  Upload,
  Plus,
  X,
  Film,
  Image,
  Clock,
  Globe,
  Eye,
  Calendar,
  Tag,
  Users,
  Star,
  Settings,
  Tv
} from 'lucide-react'

interface VideoForm {
  title_vi: string
  title_en: string
  description_vi: string
  description_en: string
  type: 'MOVIE' | 'SERIES'
  year: number
  age_rating: string
  duration_minutes: number
  release_date: string
  poster_url: string
  backdrop_url: string
  trailer_url: string
  is_published: boolean
  is_featured: boolean
  genres: string[]
  cast_members: string[]
  tags: string[]
}

export default function NewVideoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentTab, setCurrentTab] = useState('basic')

  const [formData, setFormData] = useState<VideoForm>({
    title_vi: '',
    title_en: '',
    description_vi: '',
    description_en: '',
    type: 'MOVIE',
    year: new Date().getFullYear(),
    age_rating: 'PG-13',
    duration_minutes: 0,
    release_date: '',
    poster_url: '',
    backdrop_url: '',
    trailer_url: '',
    is_published: false,
    is_featured: false,
    genres: [],
    cast_members: [],
    tags: []
  })

  const [newTag, setNewTag] = useState('')
  const [newGenre, setNewGenre] = useState('')
  const [newCastMember, setNewCastMember] = useState('')

  // Mock data
  const availableGenres = ['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller']
  const availableCastMembers = ['Brad Pitt', 'Angelina Jolie', 'Leonardo DiCaprio', 'Scarlett Johansson']
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-MA']

  const handleInputChange = (field: keyof VideoForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addItem = (field: 'genres' | 'cast_members' | 'tags', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeItem = (field: 'genres' | 'cast_members' | 'tags', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }))
  }

  const handleFileUpload = async (type: 'poster' | 'backdrop' | 'trailer', file: File) => {
    setIsLoading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Mock upload URL
    setTimeout(() => {
      const mockUrl = `/uploads/${type}/${file.name}`
      handleInputChange(`${type}_url` as keyof VideoForm, mockUrl)
      clearInterval(interval)
      setIsLoading(false)
      setUploadProgress(0)
    }, 2000)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Video data:', formData)
      
      // Redirect to videos list
      router.push('/videos')
    } catch (error) {
      console.error('Error creating video:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.title_vi.trim() && formData.type

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tạo video mới</h1>
            <p className="text-muted-foreground">
              Thêm video mới vào hệ thống
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang lưu...' : 'Lưu video'}
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <Film className="mr-2 h-4 w-4" />
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="mr-2 h-4 w-4" />
            Media & Assets
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Tag className="mr-2 h-4 w-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản về video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title_vi">Tiêu đề (Tiếng Việt) *</Label>
                  <Input
                    id="title_vi"
                    value={formData.title_vi}
                    onChange={(e) => handleInputChange('title_vi', e.target.value)}
                    placeholder="Nhập tiêu đề tiếng Việt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_en">Tiêu đề (English)</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => handleInputChange('title_en', e.target.value)}
                    placeholder="Enter English title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_vi">Mô tả (Tiếng Việt)</Label>
                <Textarea
                  id="description_vi"
                  value={formData.description_vi}
                  onChange={(e) => handleInputChange('description_vi', e.target.value)}
                  placeholder="Nhập mô tả về video..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Mô tả (English)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => handleInputChange('description_en', e.target.value)}
                  placeholder="Enter video description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại video *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="MOVIE">Phim lẻ</option>
                    <option value="SERIES">Phim bộ</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Năm sản xuất</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear() + 5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_rating">Phân loại độ tuổi</Label>
                  <select
                    id="age_rating"
                    value={formData.age_rating}
                    onChange={(e) => handleInputChange('age_rating', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {ageRatings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Thời lượng (phút)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                    placeholder="120"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="release_date">Ngày phát hành</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => handleInputChange('release_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media & Assets</CardTitle>
              <CardDescription>
                Upload poster, backdrop và trailer cho video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Poster Upload */}
              <div className="space-y-2">
                <Label>Poster</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {formData.poster_url ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={formData.poster_url} 
                        alt="Poster" 
                        className="w-20 h-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Poster đã upload</p>
                        <p className="text-xs text-muted-foreground">{formData.poster_url}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('poster_url', '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Button variant="outline" className="relative">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Poster
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload('poster', file)
                            }}
                          />
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        PNG, JPG lên đến 10MB. Khuyến nghị: 300x450px
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Backdrop Upload */}
              <div className="space-y-2">
                <Label>Backdrop</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {formData.backdrop_url ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={formData.backdrop_url} 
                        alt="Backdrop" 
                        className="w-32 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Backdrop đã upload</p>
                        <p className="text-xs text-muted-foreground">{formData.backdrop_url}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('backdrop_url', '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Button variant="outline" className="relative">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Backdrop
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload('backdrop', file)
                            }}
                          />
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        PNG, JPG lên đến 10MB. Khuyến nghị: 1920x1080px
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trailer URL */}
              <div className="space-y-2">
                <Label htmlFor="trailer_url">Trailer URL</Label>
                <Input
                  id="trailer_url"
                  value={formData.trailer_url}
                  onChange={(e) => handleInputChange('trailer_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {isLoading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Đang upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Thêm thể loại, diễn viên và tags cho video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Genres */}
              <div className="space-y-2">
                <Label>Thể loại</Label>
                <div className="flex gap-2">
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Chọn thể loại</option>
                    {availableGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => {
                      if (newGenre) {
                        addItem('genres', newGenre)
                        setNewGenre('')
                      }
                    }}
                    disabled={!newGenre}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map(genre => (
                    <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                      {genre}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('genres', genre)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cast Members */}
              <div className="space-y-2">
                <Label>Diễn viên</Label>
                <div className="flex gap-2">
                  <select
                    value={newCastMember}
                    onChange={(e) => setNewCastMember(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Chọn diễn viên</option>
                    {availableCastMembers.map(cast => (
                      <option key={cast} value={cast}>{cast}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => {
                      if (newCastMember) {
                        addItem('cast_members', newCastMember)
                        setNewCastMember('')
                      }
                    }}
                    disabled={!newCastMember}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.cast_members.map(cast => (
                    <Badge key={cast} variant="secondary" className="flex items-center gap-1">
                      {cast}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('cast_members', cast)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nhập tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newTag.trim()) {
                          addItem('tags', newTag)
                          setNewTag('')
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newTag.trim()) {
                        addItem('tags', newTag)
                        setNewTag('')
                      }
                    }}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('tags', tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt xuất bản</CardTitle>
              <CardDescription>
                Cấu hình trạng thái và quyền truy cập của video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Xuất bản</Label>
                  <p className="text-sm text-muted-foreground">
                    Video sẽ hiển thị công khai cho người dùng
                  </p>
                </div>
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nổi bật</Label>
                  <p className="text-sm text-muted-foreground">
                    Video sẽ được hiển thị trong mục nổi bật
                  </p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Tóm tắt thông tin</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiêu đề:</span>
                      <span>{formData.title_vi || 'Chưa nhập'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại:</span>
                      <span>{formData.type === 'MOVIE' ? 'Phim lẻ' : 'Phim bộ'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Năm:</span>
                      <span>{formData.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phân loại:</span>
                      <span>{formData.age_rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời lượng:</span>
                      <span>{formData.duration_minutes > 0 ? `${formData.duration_minutes} phút` : 'Chưa nhập'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thể loại:</span>
                      <span>{formData.genres.length} thể loại</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diễn viên:</span>
                      <span>{formData.cast_members.length} người</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tags:</span>
                      <span>{formData.tags.length} tags</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
