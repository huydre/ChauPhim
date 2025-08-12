'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Tv,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileVideo,
  Play
} from 'lucide-react'
import { getAuthenticatedApiClient } from '@/lib/auth-utils'
import { API_BASE_URL } from '@/lib/config'
import { 
  useGenerateMovieUploadUrl, 
  useCreateMovie, 
  useStartTranscoding,
  useTranscodingStatus,
  usePublishMovie 
} from '@/hooks/api'

interface VideoForm {
  slug: string
  titleVi: string
  titleEn: string
  descriptionVi: string
  descriptionEn: string
  type: 'MOVIE' | 'SERIES'
  year: number
  ageRating: string
  durationMinutes: number
  posterUrl: string
  backdropUrl: string
  genreIds: string[]
  castIds: string[]
  rawVideoKey: string
  rawVideoUrl: string
}

interface UploadState {
  isUploading: boolean
  progress: number
  step: 'idle' | 'uploading-video' | 'creating-movie' | 'transcoding' | 'completed'
  error: string | null
}

interface TranscodingStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  message: string
  hlsManifestKey?: string
}

export default function NewVideoPage() {
  const router = useRouter()
  const videoFileRef = useRef<HTMLInputElement>(null)
  const [movieId, setMovieId] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    step: 'idle',
    error: null
  })
  const [currentTab, setCurrentTab] = useState('video')

  // Mutations
  const generateUploadUrlMutation = useGenerateMovieUploadUrl()
  const createMovieMutation = useCreateMovie()
  const startTranscodingMutation = useStartTranscoding()
  const publishMovieMutation = usePublishMovie()

  // Query for transcoding status
  const transcodingQuery = useTranscodingStatus(
    movieId || '', 
    !!movieId && uploadState.step === 'transcoding'
  )

  const transcodingStatus = transcodingQuery.data?.data

  const [formData, setFormData] = useState<VideoForm>({
    slug: '',
    titleVi: '',
    titleEn: '',
    descriptionVi: '',
    descriptionEn: '',
    type: 'MOVIE',
    year: new Date().getFullYear(),
    ageRating: 'PG-13',
    durationMinutes: 0,
    posterUrl: '',
    backdropUrl: '',
    genreIds: [],
    castIds: [],
    rawVideoKey: '',
    rawVideoUrl: ''
  })

  const [newGenre, setNewGenre] = useState('')
  const [newCastMember, setNewCastMember] = useState('')

  // Mock data
  const availableGenres = ['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller']
  const availableCastMembers = ['Brad Pitt', 'Angelina Jolie', 'Leonardo DiCaprio', 'Scarlett Johansson']
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-MA']

  // Effect to update upload status based on transcoding progress
  useEffect(() => {
    if (transcodingStatus) {
      setUploadState(prev => ({
        ...prev,
        progress: transcodingStatus.progress
      }))

      if (transcodingStatus.status === 'completed') {
        setUploadState(prev => ({ ...prev, step: 'completed', isUploading: false }))
      } else if (transcodingStatus.status === 'failed') {
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false, 
          step: 'idle', 
          error: 'Transcoding failed: ' + transcodingStatus.message 
        }))
      }
    }
  }, [transcodingStatus])

  const handleInputChange = (field: keyof VideoForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from titleVi
    if (field === 'titleVi' && value) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const addItem = (field: 'genreIds' | 'castIds', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeItem = (field: 'genreIds' | 'castIds', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }))
  }

  // Step 1: Generate upload URL and upload video file
  const handleVideoUpload = async (file: File) => {
    try {
      setUploadState(prev => ({ ...prev, isUploading: true, step: 'uploading-video', error: null, progress: 0 }))

      // Generate upload URL using mutation
      const uploadResponse = await generateUploadUrlMutation.mutateAsync({
        filename: file.name,
        contentType: file.type
      })

      const { uploadUrl, videoKey } = uploadResponse.data

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadState(prev => ({ ...prev, progress }))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setFormData(prev => ({ ...prev, rawVideoKey: videoKey, rawVideoUrl: uploadUrl }))
            setUploadState(prev => ({ ...prev, step: 'creating-movie', progress: 100 }))
            
            // Auto-fill form with filename if no title provided
            if (!formData.titleVi && !formData.titleEn && videoKey) {
              const filename = videoKey.split('/').pop()?.split('.')[0] || ''
              if (filename) {
                const cleanTitle = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                setFormData(prev => ({ 
                  ...prev, 
                  titleVi: cleanTitle,
                  titleEn: cleanTitle 
                }))
              }
            }
            
            // Auto switch to basic info tab after upload
            setTimeout(() => {
              setCurrentTab('basic')
            }, 1000)
            
            resolve(videoKey)
          } else {
            reject(new Error('Upload failed'))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload error'))
        })

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        step: 'idle', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }))
      throw error
    }
  }

  // Step 2: Create movie metadata
  const handleCreateMovie = async () => {
    try {
      // Prepare data with smart defaults
      const movieData = {
        slug: formData.slug || undefined, // Let server generate if empty
        titleVi: formData.titleVi || undefined, // Let server generate from filename
        titleEn: formData.titleEn || undefined,
        descriptionVi: formData.descriptionVi || undefined, // Server will generate default
        descriptionEn: formData.descriptionEn || undefined,
        type: formData.type,
        year: formData.year || undefined, // Server may extract from filename
        posterUrl: formData.posterUrl || undefined,
        backdropUrl: formData.backdropUrl || undefined,
        ageRating: formData.ageRating || 'PG13',
        durationMinutes: formData.durationMinutes || undefined, // Server will set default
        genreIds: formData.genreIds.length > 0 ? formData.genreIds : undefined,
        castIds: formData.castIds.length > 0 ? formData.castIds : undefined,
        rawVideoKey: formData.rawVideoKey
      }

      const response = await createMovieMutation.mutateAsync(movieData)
      const movieId = response.data.id
      setMovieId(movieId)
      setUploadState(prev => ({ ...prev, step: 'transcoding' }))
      
      return movieId
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        step: 'idle', 
        error: error instanceof Error ? error.message : 'Failed to create movie' 
      }))
      throw error
    }
  }

  // Step 3: Start transcoding
  const handleStartTranscoding = async (movieId: string) => {
    try {
      await startTranscodingMutation.mutateAsync({
        movieId,
        rawVideoKey: formData.rawVideoKey,
        qualities: ['480p', '720p', '1080p']
      })

      // Transcoding status will be polled automatically by the query
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        step: 'idle', 
        error: error instanceof Error ? error.message : 'Failed to start transcoding' 
      }))
      throw error
    }
  }

  // Complete upload process
  const handleCompleteUpload = async (file: File) => {
    try {
      // Step 1: Upload video
      await handleVideoUpload(file)
      
      // Step 2: Create movie
      const movieId = await handleCreateMovie()
      
      // Step 3: Start transcoding
      await handleStartTranscoding(movieId)
      
    } catch (error) {
      console.error('Upload process failed:', error)
    }
  }

  // Publish movie
  const handlePublish = async () => {
    if (!movieId) return

    try {
      await publishMovieMutation.mutateAsync({ movieId, isPublished: true })
      
      // Redirect to movie detail or list
      router.push(`/videos`)
    } catch (error) {
      console.error('Failed to publish movie:', error)
    }
  }

  const handleImageUpload = async (type: 'poster' | 'backdrop', file: File) => {
    // Mock upload for images
    const mockUrl = `${API_BASE_URL}/uploads/${type}/${file.name}`
    handleInputChange(`${type}Url` as keyof VideoForm, mockUrl)
  }

  const isFormValid = formData.rawVideoKey || (formData.titleVi.trim() && formData.descriptionVi.trim())
  const isVideoUploaded = uploadState.step === 'completed'
  const canPublish = isVideoUploaded && transcodingStatus?.status === 'completed'

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
              Upload và tạo video mới theo quy trình hoàn chỉnh
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {formData.rawVideoKey && uploadState.step === 'idle' && (
            <Button 
              onClick={async () => {
                try {
                  const movieId = await handleCreateMovie()
                  await handleStartTranscoding(movieId)
                } catch (error) {
                  console.error('Failed to process video:', error)
                }
              }}
              variant="outline"
              disabled={uploadState.isUploading}
            >
              <Film className="mr-2 h-4 w-4" />
              Xử lý Video
            </Button>
          )}
          {canPublish && (
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              <Eye className="mr-2 h-4 w-4" />
              Xuất bản
            </Button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {uploadState.step === 'uploading-video' && <Upload className="h-5 w-5 text-blue-500" />}
                {uploadState.step === 'creating-movie' && <Film className="h-5 w-5 text-orange-500" />}
                {uploadState.step === 'transcoding' && <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />}
                {uploadState.step === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                
                <div className="flex-1">
                  <p className="font-medium">
                    {uploadState.step === 'uploading-video' && 'Đang upload video...'}
                    {uploadState.step === 'creating-movie' && 'Đang tạo thông tin phim...'}
                    {uploadState.step === 'transcoding' && 'Đang xử lý video...'}
                    {uploadState.step === 'completed' && 'Hoàn thành!'}
                  </p>
                  {transcodingStatus && (
                    <p className="text-sm text-muted-foreground">
                      {transcodingStatus.message} - {transcodingStatus.progress}%
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium">{uploadState.progress}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {uploadState.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {uploadState.step === 'completed' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Video đã được upload và xử lý thành công! Bạn có thể xuất bản ngay bây giờ.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="video">
            <FileVideo className="mr-2 h-4 w-4" />
            Upload Video
          </TabsTrigger>
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
        </TabsList>

        {/* Video Upload Tab */}
        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video File</CardTitle>
              <CardDescription>
                Chọn file video để upload. Hệ thống sẽ tự động xử lý và tạo các version chất lượng khác nhau.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!formData.rawVideoKey ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12">
                  <div className="text-center">
                    <FileVideo className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Upload video file</h3>
                        <p className="text-muted-foreground">
                          Chọn file video định dạng MP4, MOV, AVI (khuyến nghị MP4)
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="relative"
                        disabled={uploadState.isUploading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Chọn file video
                        <input
                          ref={videoFileRef}
                          type="file"
                          accept="video/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleCompleteUpload(file)
                          }}
                        />
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Hỗ trợ: MP4, MOV, AVI. Tối đa 5GB.
                        <br />
                        Khuyến nghị: H.264 codec, độ phân giải tối thiểu 720p
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {uploadState.step === 'completed' ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <FileVideo className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Video đã upload</h3>
                      <p className="text-sm text-muted-foreground">
                        Key: {formData.rawVideoKey}
                      </p>
                      {transcodingStatus && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            Trạng thái: <Badge variant={
                              transcodingStatus.status === 'completed' ? 'default' :
                              transcodingStatus.status === 'failed' ? 'destructive' : 'secondary'
                            }>
                              {transcodingStatus.status === 'completed' && 'Hoàn thành'}
                              {transcodingStatus.status === 'processing' && 'Đang xử lý'}
                              {transcodingStatus.status === 'queued' && 'Đang chờ'}
                              {transcodingStatus.status === 'failed' && 'Thất bại'}
                            </Badge>
                          </p>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, rawVideoKey: '', rawVideoUrl: '' }))
                        setUploadState({ isUploading: false, progress: 0, step: 'idle', error: null })
                        setMovieId(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Basic Info Tab */}
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
                  <Label htmlFor="titleVi">Tiêu đề (Tiếng Việt) *</Label>
                  <Input
                    id="titleVi"
                    value={formData.titleVi}
                    onChange={(e) => handleInputChange('titleVi', e.target.value)}
                    placeholder="Nhập tiêu đề tiếng Việt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleEn">Tiêu đề (English)</Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) => handleInputChange('titleEn', e.target.value)}
                    placeholder="Enter English title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug (tự động tạo) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="avengers-endgame"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionVi">Mô tả (Tiếng Việt) *</Label>
                <Textarea
                  id="descriptionVi"
                  value={formData.descriptionVi}
                  onChange={(e) => handleInputChange('descriptionVi', e.target.value)}
                  placeholder="Nhập mô tả về video..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">Mô tả (English)</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
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
                  <Label htmlFor="ageRating">Phân loại độ tuổi</Label>
                  <select
                    id="ageRating"
                    value={formData.ageRating}
                    onChange={(e) => handleInputChange('ageRating', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {ageRatings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Thời lượng (phút)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
                    placeholder="120"
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media & Assets</CardTitle>
              <CardDescription>
                Upload poster và backdrop cho video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Poster Upload */}
              <div className="space-y-2">
                <Label>Poster</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {formData.posterUrl ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={formData.posterUrl} 
                        alt="Poster" 
                        className="w-20 h-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Poster đã upload</p>
                        <p className="text-xs text-muted-foreground">{formData.posterUrl}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('posterUrl', '')}
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
                              if (file) handleImageUpload('poster', file)
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
                  {formData.backdropUrl ? (
                    <div className="flex items-center gap-4">
                      <img 
                        src={formData.backdropUrl} 
                        alt="Backdrop" 
                        className="w-32 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Backdrop đã upload</p>
                        <p className="text-xs text-muted-foreground">{formData.backdropUrl}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('backdropUrl', '')}
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
                              if (file) handleImageUpload('backdrop', file)
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Thêm thể loại và diễn viên cho video
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
                        addItem('genreIds', newGenre)
                        setNewGenre('')
                      }
                    }}
                    disabled={!newGenre}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.genreIds.map(genreId => (
                    <Badge key={genreId} variant="secondary" className="flex items-center gap-1">
                      {genreId}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('genreIds', genreId)}
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
                        addItem('castIds', newCastMember)
                        setNewCastMember('')
                      }
                    }}
                    disabled={!newCastMember}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.castIds.map(castId => (
                    <Badge key={castId} variant="secondary" className="flex items-center gap-1">
                      {castId}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeItem('castIds', castId)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <Separator />
              <div className="space-y-4">
                <Label>Tóm tắt thông tin</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiêu đề:</span>
                      <span>{formData.titleVi || 'Chưa nhập'}</span>
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
                      <span>{formData.ageRating}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời lượng:</span>
                      <span>{formData.durationMinutes > 0 ? `${formData.durationMinutes} phút` : 'Chưa nhập'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thể loại:</span>
                      <span>{formData.genreIds.length} thể loại</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diễn viên:</span>
                      <span>{formData.castIds.length} người</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Video:</span>
                      <span>{formData.rawVideoKey ? 'Đã upload' : 'Chưa upload'}</span>
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
