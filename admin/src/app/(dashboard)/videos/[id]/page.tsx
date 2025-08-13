'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminMovie, useUpdateMovieStatus, useDeleteMovie } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import VideoReplacement from '@/components/video/VideoReplacement';
import SubtitleManagement from '@/components/video/SubtitleManagement';
import { 
  Edit, 
  Trash2, 
  Play, 
  Eye, 
  Clock, 
  Calendar,
  Star,
  MessageSquare,
  Users,
  Video,
  FileText,
  Settings,
  Download,
  Upload,
  ArrowLeft,
  RefreshCw,
  Subtitles
} from 'lucide-react';

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;
  
  const { data: movie, isLoading, error } = useAdminMovie(movieId);
  const updateMovieStatus = useUpdateMovieStatus();
  const deleteMovie = useDeleteMovie();
  
  const [isPublished, setIsPublished] = useState(movie?.isPublished || false);

  const handlePublishToggle = async (checked: boolean) => {
    try {
      await updateMovieStatus.mutateAsync({
        id: movieId,
        isPublished: checked
      });
      setIsPublished(checked);
    } catch (error) {
      console.error('Failed to update movie status:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/videos/${movieId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa phim này không?')) {
      try {
        await deleteMovie.mutateAsync(movieId);
        router.push('/videos');
      } catch (error) {
        console.error('Failed to delete movie:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy phim
            </h3>
            <p className="text-gray-500 mb-4">
              Phim này có thể đã bị xóa hoặc không tồn tại.
            </p>
            <Button onClick={() => router.push('/videos')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {movie.titleVi || movie.titleEn}
            </h1>
            <p className="text-gray-500 mt-1">
              Chi tiết phim • {movie.type === 'MOVIE' ? 'Phim lẻ' : 'Phim bộ'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={movie.isPublished}
            onCheckedChange={handlePublishToggle}
            disabled={updateMovieStatus.isPending}
          />
          <span className="text-sm text-gray-600">
            {movie.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
          </span>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="sources">Video Sources</TabsTrigger>
              <TabsTrigger value="video-replacement">Thay Video</TabsTrigger>
              <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
              <TabsTrigger value="transcode">Transcode Jobs</TabsTrigger>
              <TabsTrigger value="analytics">Thống kê</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Movie Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Thông tin phim
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tiêu đề (VI)</label>
                      <p className="text-gray-900">{movie.titleVi || 'Chưa có'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tiêu đề (EN)</label>
                      <p className="text-gray-900">{movie.titleEn || 'Chưa có'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Slug</label>
                      <p className="text-gray-900 font-mono text-sm">{movie.slug}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Năm phát hành</label>
                      <p className="text-gray-900">{movie.year || 'Chưa có'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Thời lượng</label>
                      <p className="text-gray-900">
                        {movie.durationMinutes ? `${movie.durationMinutes} phút` : 'Chưa có'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Độ tuổi</label>
                      <p className="text-gray-900">{movie.ageRating || 'Chưa có'}</p>
                    </div>
                  </div>
                  
                  {movie.descriptionVi && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mô tả (VI)</label>
                      <p className="text-gray-900 mt-1">{movie.descriptionVi}</p>
                    </div>
                  )}
                  
                  {movie.descriptionEn && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mô tả (EN)</label>
                      <p className="text-gray-900 mt-1">{movie.descriptionEn}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thể loại</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre: any) => (
                        <Badge key={genre.id || genre.genre?.id} variant="secondary">
                          {genre.nameVi || genre.nameEn || genre.genre?.nameVi || genre.genre?.nameEn}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Diễn viên
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {movie.cast.map((cast: any) => (
                        <div key={cast.id || cast.cast?.id} className="flex items-center gap-3">
                          {(cast.avatarUrl || cast.cast?.avatarUrl) && (
                            <img
                              src={cast.avatarUrl || cast.cast?.avatarUrl}
                              alt={cast.name || cast.cast?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm">{cast.name || cast.cast?.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {movie.movieSources && movie.movieSources.length > 0 ? (
                    <div className="space-y-4">
                      {movie.movieSources.map((source, index) => (
                        <div key={source.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Source #{index + 1}</h4>
                            <Badge variant={source.isPublished ? "default" : "secondary"}>
                              {source.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">HLS Manifest:</span>
                              <p className="font-mono text-xs mt-1">
                                {source.hlsManifestKey || 'Chưa có'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Subtitles:</span>
                              <p className="text-xs mt-1">
                                {(source as any).subtitlesJson ? 'Có' : 'Không'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Chưa có video source nào
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video-replacement" className="space-y-4">
              <VideoReplacement 
                movieId={movieId}
                currentVideoKey={movie.movieSources?.[0]?.rawVideoKey}
                onSuccess={() => window.location.reload()}
              />
            </TabsContent>

            <TabsContent value="subtitles" className="space-y-4">
              <SubtitleManagement movieId={movieId} />
            </TabsContent>

            <TabsContent value="transcode" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Transcode Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Transcode jobs sẽ được hiển thị ở đây
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div className="ml-2">
                        <p className="text-xs font-medium leading-none">
                          Lượt xem
                        </p>
                        <p className="text-2xl font-bold">
                          {movie.viewsCount || '0'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <div className="ml-2">
                        <p className="text-xs font-medium leading-none">
                          Đánh giá
                        </p>
                        <p className="text-2xl font-bold">
                          {movie._count?.ratings || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div className="ml-2">
                        <p className="text-xs font-medium leading-none">
                          Bình luận
                        </p>
                        <p className="text-2xl font-bold">
                          {movie._count?.comments || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Poster */}
          <Card>
            <CardContent className="p-4">
              <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.titleVi || movie.titleEn}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Play className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={() => window.open(movie.posterUrl, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                Xem poster
              </Button>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Xuất bản</span>
                <Badge variant={movie.isPublished ? "default" : "secondary"}>
                  {movie.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loại</span>
                <Badge variant="outline">
                  {movie.type === 'MOVIE' ? 'Phim lẻ' : 'Phim bộ'}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Tạo: {new Date(movie.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Cập nhật: {new Date(movie.updatedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa phim
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Switch to video replacement tab
                  const tabTrigger = document.querySelector('[value="video-replacement"]') as HTMLElement;
                  if (tabTrigger) tabTrigger.click();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thay thế video
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  // Switch to subtitles tab
                  const tabTrigger = document.querySelector('[value="subtitles"]') as HTMLElement;
                  if (tabTrigger) tabTrigger.click();
                }}
              >
                <Subtitles className="w-4 h-4 mr-2" />
                Quản lý subtitle
              </Button>
              <Separator />
              <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa phim
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
