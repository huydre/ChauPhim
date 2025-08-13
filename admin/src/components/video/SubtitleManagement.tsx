'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Subtitles, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Download
} from 'lucide-react';
import { useGetMovieSubtitles, useAddMovieSubtitle, useDeleteMovieSubtitle, useGenerateSubtitleUploadUrl } from '@/hooks/api';

interface SubtitleManagementProps {
  movieId: string;
}

const LANGUAGE_OPTIONS = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'th', label: 'ไทย' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
];

export default function SubtitleManagement({ movieId }: SubtitleManagementProps) {
  const [isAddingSubtitle, setIsAddingSubtitle] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: subtitlesData, isLoading, refetch } = useGetMovieSubtitles(movieId);
  const addSubtitle = useAddMovieSubtitle();
  const deleteSubtitle = useDeleteMovieSubtitle();
  const generateUploadUrl = useGenerateSubtitleUploadUrl();

  const subtitles = subtitlesData?.data?.subtitles || [];
  const existingLanguages = subtitles.map(sub => sub.language);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.vtt') && !file.name.endsWith('.srt')) {
        setErrorMessage('Vui lòng chọn file subtitle (.vtt hoặc .srt)');
        return;
      }
      
      setSelectedFile(file);
      setErrorMessage('');
      setUploadStatus('idle');
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    const languageOption = LANGUAGE_OPTIONS.find(opt => opt.code === language);
    if (languageOption && !customLabel) {
      setCustomLabel(languageOption.label);
    }
  };

  const handleAddSubtitle = async () => {
    if (!selectedFile || !selectedLanguage) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Generate upload URL
      const uploadResponse = await generateUploadUrl.mutateAsync({
        movieId,
        language: selectedLanguage
      });

      const { uploadUrl, subtitleKey } = uploadResponse.data;

      // Upload file to storage
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        xhr.send(selectedFile);
      });

      // Add subtitle to movie
      await addSubtitle.mutateAsync({
        movieId,
        language: selectedLanguage,
        label: customLabel || LANGUAGE_OPTIONS.find(opt => opt.code === selectedLanguage)?.label || selectedLanguage,
        subtitleKey
      });

      setUploadStatus('success');
      resetForm();
      refetch();
      
    } catch (error) {
      console.error('Add subtitle error:', error);
      setUploadStatus('error');
      setErrorMessage('Có lỗi xảy ra khi thêm subtitle');
    }
  };

  const handleDeleteSubtitle = async (language: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa subtitle ${language}?`)) return;

    try {
      await deleteSubtitle.mutateAsync({ movieId, language });
      refetch();
    } catch (error) {
      console.error('Delete subtitle error:', error);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedLanguage('');
    setCustomLabel('');
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setIsAddingSubtitle(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Subtitles className="w-5 h-5" />
            Quản lý Subtitle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Subtitles className="w-5 h-5" />
            Quản lý Subtitle
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsAddingSubtitle(true)}
            disabled={isAddingSubtitle}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Subtitle
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Subtitles */}
        {subtitles.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Subtitles hiện có:</h4>
            {subtitles.map((subtitle) => (
              <div key={subtitle.language} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{subtitle.language.toUpperCase()}</Badge>
                  <span className="text-sm font-medium">{subtitle.label}</span>
                  <span className="text-xs text-gray-500 font-mono">{subtitle.key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(subtitle.url, '_blank')}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Tải về
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteSubtitle(subtitle.language)}
                    disabled={deleteSubtitle.isPending}
                  >
                    {deleteSubtitle.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Subtitles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có subtitle nào</p>
          </div>
        )}

        {/* Add Subtitle Form */}
        {isAddingSubtitle && (
          <>
            <Separator />
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900">Thêm Subtitle Mới</h4>
              
              {uploadStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ngôn ngữ</Label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn ngôn ngữ</option>
                        {LANGUAGE_OPTIONS
                          .filter(option => !existingLanguages.includes(option.code))
                          .map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.label} ({option.code})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label>Tên hiển thị</Label>
                      <Input
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder="Ví dụ: Tiếng Việt"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>File Subtitle</Label>
                    <Input
                      type="file"
                      accept=".vtt,.srt"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hỗ trợ: .vtt, .srt
                    </p>
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <p>{errorMessage}</p>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddSubtitle}
                      disabled={!selectedFile || !selectedLanguage || addSubtitle.isPending || generateUploadUrl.isPending}
                      className="flex-1"
                    >
                      {addSubtitle.isPending || generateUploadUrl.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Thêm Subtitle
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Đang upload...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {uploadProgress < 100 ? 'Đang upload subtitle...' : 'Đang xử lý...'}
                  </p>
                </div>
              )}

              {uploadStatus === 'success' && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Thêm subtitle thành công!</p>
                    <p className="text-sm text-gray-600">
                      Subtitle đã được thêm vào phim.
                    </p>
                  </div>
                </Alert>
              )}

              {uploadStatus === 'error' && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <p>{errorMessage}</p>
                  </Alert>
                  <Button variant="outline" onClick={resetForm}>
                    Thử lại
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
