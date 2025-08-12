'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAdminMovie, useUpdateMovie, useAllGenres, useAllCasts, useDeleteMovie } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  Plus,
  Search,
  ImageIcon
} from 'lucide-react';

interface EditMovieForm {
  titleVi: string;
  titleEn: string;
  slug: string;
  descriptionVi: string;
  descriptionEn: string;
  year: number;
  durationMinutes: number;
  ageRating: string;
  posterUrl: string;
  backdropUrl: string;
  isPublished: boolean;
  type: 'MOVIE' | 'SERIES';
  genreIds: string[];
  castIds: string[];
}

export default function MovieEditPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;
  
  const { data: movie, isLoading, error } = useAdminMovie(movieId);
  const { data: genres = [] } = useAllGenres();
  const { data: casts = [] } = useAllCasts();
  const updateMovie = useUpdateMovie();
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCasts, setSelectedCasts] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState('');
  const [castSearch, setCastSearch] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<EditMovieForm>();

  const formValues = watch();

  // Initialize form when movie data is loaded
  useEffect(() => {
    if (movie) {
      setValue('titleVi', movie.titleVi || '');
      setValue('titleEn', movie.titleEn || '');
      setValue('slug', movie.slug || '');
      setValue('descriptionVi', movie.descriptionVi || '');
      setValue('descriptionEn', movie.descriptionEn || '');
      setValue('year', movie.year || new Date().getFullYear());
      setValue('durationMinutes', movie.durationMinutes || 0);
      setValue('ageRating', movie.ageRating || '');
      setValue('posterUrl', movie.posterUrl || '');
      setValue('backdropUrl', movie.backdropUrl || '');
      setValue('isPublished', movie.isPublished);
      setValue('type', movie.type);
      
      // Set selected genres and casts
      const movieGenreIds = movie.genres?.map((g: any) => g.genre?.id || g.id) || [];
      const movieCastIds = movie.casts?.map((c: any) => c.cast?.id || c.id) || [];
      setSelectedGenres(movieGenreIds);
      setSelectedCasts(movieCastIds);
      setValue('genreIds', movieGenreIds);
      setValue('castIds', movieCastIds);
    }
  }, [movie, setValue]);

  const onSubmit = async (data: EditMovieForm) => {
    try {
      await updateMovie.mutateAsync({
        id: movieId,
        ...data,
        genreIds: selectedGenres,
        castIds: selectedCasts,
      });
      router.push(`/videos/${movieId}`);
    } catch (error) {
      console.error('Failed to update movie:', error);
    }
  };

  const addGenre = (genreId: string) => {
    if (!selectedGenres.includes(genreId)) {
      const newGenres = [...selectedGenres, genreId];
      setSelectedGenres(newGenres);
      setValue('genreIds', newGenres);
    }
  };

  const removeGenre = (genreId: string) => {
    const newGenres = selectedGenres.filter(id => id !== genreId);
    setSelectedGenres(newGenres);
    setValue('genreIds', newGenres);
  };

  const addCast = (castId: string) => {
    if (!selectedCasts.includes(castId)) {
      const newCasts = [...selectedCasts, castId];
      setSelectedCasts(newCasts);
      setValue('castIds', newCasts);
    }
  };

  const removeCast = (castId: string) => {
    const newCasts = selectedCasts.filter(id => id !== castId);
    setSelectedCasts(newCasts);
    setValue('castIds', newCasts);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string, field: 'titleVi' | 'titleEn') => {
    setValue(field, title);
    if (title && !formValues.slug) {
      setValue('slug', generateSlug(title));
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa phim
            </h1>
            <p className="text-gray-500 mt-1">
              {movie.titleVi || movie.titleEn}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="submit" 
            disabled={!isDirty || updateMovie.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMovie.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleVi">Tiêu đề (Tiếng Việt)</Label>
                  <Input
                    id="titleVi"
                    {...register('titleVi', { required: 'Tiêu đề tiếng Việt là bắt buộc' })}
                    onChange={(e) => handleTitleChange(e.target.value, 'titleVi')}
                  />
                  {errors.titleVi && (
                    <p className="text-red-500 text-sm mt-1">{errors.titleVi.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="titleEn">Tiêu đề (Tiếng Anh)</Label>
                  <Input
                    id="titleEn"
                    {...register('titleEn')}
                    onChange={(e) => handleTitleChange(e.target.value, 'titleEn')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  {...register('slug', { required: 'Slug là bắt buộc' })}
                  className="font-mono text-sm"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Năm phát hành</Label>
                  <Input
                    id="year"
                    type="number"
                    {...register('year', { valueAsNumber: true, min: 1900, max: 2030 })}
                  />
                </div>
                <div>
                  <Label htmlFor="durationMinutes">Thời lượng (phút)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    {...register('durationMinutes', { valueAsNumber: true, min: 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="ageRating">Độ tuổi</Label>
                  <select
                    id="ageRating"
                    {...register('ageRating')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn độ tuổi</option>
                    <option value="G">G - Tất cả mọi lứa tuổi</option>
                    <option value="PG">PG - Hướng dẫn của phụ huynh</option>
                    <option value="PG13">PG-13 - Từ 13 tuổi trở lên</option>
                    <option value="R">R - Từ 17 tuổi trở lên</option>
                    <option value="NC17">NC-17 - Chỉ người lớn</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="type">Loại phim</Label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MOVIE">Phim lẻ</option>
                  <option value="SERIES">Phim bộ</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descriptionVi">Mô tả (Tiếng Việt)</Label>
                <Textarea
                  id="descriptionVi"
                  {...register('descriptionVi')}
                  rows={4}
                  placeholder="Nhập mô tả phim bằng tiếng Việt..."
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn">Mô tả (Tiếng Anh)</Label>
                <Textarea
                  id="descriptionEn"
                  {...register('descriptionEn')}
                  rows={4}
                  placeholder="Enter movie description in English..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Hình ảnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Poster</Label>
                <ImageUpload
                  movieId={movieId}
                  imageType="poster"
                  currentImageUrl={formValues.posterUrl}
                  onImageUpdate={(imageUrl) => setValue('posterUrl', imageUrl)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Backdrop</Label>
                <ImageUpload
                  movieId={movieId}
                  imageType="backdrop"
                  currentImageUrl={formValues.backdropUrl}
                  onImageUpdate={(imageUrl) => setValue('backdropUrl', imageUrl)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Genres */}
          <Card>
            <CardHeader>
              <CardTitle>Thể loại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search genres */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm thể loại..."
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected genres */}
              {selectedGenres.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Đã chọn:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGenres.map((genreId) => {
                      const genre = genres.find((g: any) => g.id === genreId);
                      return genre ? (
                        <Badge key={genreId} variant="default" className="flex items-center gap-1">
                          {genre.nameVi}
                          <button
                            type="button"
                            onClick={() => removeGenre(genreId)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Available genres */}
              <div>
                <Label className="text-sm font-medium">Thêm thể loại:</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {genres
                    .filter((genre: any) => 
                      !selectedGenres.includes(genre.id) &&
                      (genre.nameVi.toLowerCase().includes(genreSearch.toLowerCase()) ||
                       genre.nameEn.toLowerCase().includes(genreSearch.toLowerCase()))
                    )
                    .map((genre: any) => (
                      <Badge
                        key={genre.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => addGenre(genre.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {genre.nameVi}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cast */}
          <Card>
            <CardHeader>
              <CardTitle>Diễn viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search cast */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm diễn viên..."
                  value={castSearch}
                  onChange={(e) => setCastSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected cast */}
              {selectedCasts.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Đã chọn:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCasts.map((castId) => {
                      const cast = casts.find((c: any) => c.id === castId);
                      return cast ? (
                        <Badge key={castId} variant="default" className="flex items-center gap-1">
                          {cast.name}
                          <button
                            type="button"
                            onClick={() => removeCast(castId)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Available cast */}
              <div>
                <Label className="text-sm font-medium">Thêm diễn viên:</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                  {casts
                    .filter((cast: any) => 
                      !selectedCasts.includes(cast.id) &&
                      cast.name.toLowerCase().includes(castSearch.toLowerCase())
                    )
                    .map((cast: any) => (
                      <Badge
                        key={cast.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => addCast(cast.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {cast.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trạng thái xuất bản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  {...register('isPublished')}
                  checked={formValues.isPublished}
                  onCheckedChange={(checked) => setValue('isPublished', checked)}
                />
                <Label htmlFor="isPublished">
                  {formValues.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Current Poster */}
          {movie.posterUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Poster hiện tại</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={movie.posterUrl}
                  alt={movie.titleVi || movie.titleEn}
                  className="w-full aspect-[2/3] object-cover rounded"
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={!isDirty || updateMovie.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/videos/${movieId}`)}
              >
                Xem chi tiết
              </Button>
              <Separator />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload video mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
