'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Upload, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useReplaceVideo, useUploadUrl } from '@/hooks/api';

interface VideoReplacementProps {
  movieId: string;
  currentVideoKey?: string;
  onSuccess?: () => void;
}

export default function VideoReplacement({ movieId, currentVideoKey, onSuccess }: VideoReplacementProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const replaceVideo = useReplaceVideo();
  const uploadUrl = useUploadUrl();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setErrorMessage('Vui lòng chọn file video hợp lệ');
        return;
      }
      
      // Validate file size (max 10GB)
      if (file.size > 10 * 1024 * 1024 * 1024) {
        setErrorMessage('File quá lớn. Kích thước tối đa là 10GB');
        return;
      }

      setSelectedFile(file);
      setErrorMessage('');
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Generate upload URL
      const uploadResponse = await uploadUrl.mutateAsync({
        filename: selectedFile.name,
        contentType: selectedFile.type
      });

      const { uploadUrl: presignedUrl, key } = uploadResponse.data;

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
        
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        xhr.send(selectedFile);
      });

      // Replace video
      await replaceVideo.mutateAsync({
        movieId,
        videoKey: key
      });

      setUploadStatus('success');
      setSelectedFile(null);
      onSuccess?.();
      
    } catch (error) {
      console.error('Replace video error:', error);
      setUploadStatus('error');
      setErrorMessage('Có lỗi xảy ra khi thay thế video');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Thay thế Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVideoKey && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <div>
              <p className="font-medium">Video hiện tại:</p>
              <p className="text-sm text-gray-600 font-mono">{currentVideoKey}</p>
            </div>
          </Alert>
        )}

        {uploadStatus === 'idle' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-file">Chọn video mới</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ: MP4, MOV, AVI, MKV... (Tối đa 10GB)
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <p>{errorMessage}</p>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadUrl.isPending || replaceVideo.isPending}
                className="flex-1"
              >
                {uploadUrl.isPending || replaceVideo.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Thay thế Video
              </Button>
              {selectedFile && (
                <Button variant="outline" onClick={resetUpload}>
                  Hủy
                </Button>
              )}
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
              {uploadProgress < 100 ? 'Đang upload video...' : 'Đang xử lý...'}
            </p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <div>
              <p className="font-medium">Thay thế video thành công!</p>
              <p className="text-sm text-gray-600">
                Video đã được thay thế và sẽ được transcode lại.
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
            <Button variant="outline" onClick={resetUpload}>
              Thử lại
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
