'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { useGenerateImageUploadUrl, useUpdateMovieImage } from '@/hooks/api'

interface ImageUploadProps {
  movieId: string
  imageType: 'poster' | 'backdrop'
  currentImageUrl?: string
  onImageUpdate: (imageUrl: string) => void
  className?: string
}

export function ImageUpload({
  movieId,
  imageType,
  currentImageUrl,
  onImageUpdate,
  className = ''
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)

  const generateUploadUrl = useGenerateImageUploadUrl()
  const updateMovieImage = useUpdateMovieImage()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Step 1: Get upload URL
      const uploadUrlResponse = await generateUploadUrl.mutateAsync({
        movieId,
        filename: file.name,
        contentType: file.type,
        imageType,
      })

      const { uploadUrl, imageKey } = uploadUrlResponse.data

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      setUploadProgress(100)

      // Step 3: Update movie with new image URL
      const updateResponse = await updateMovieImage.mutateAsync({
        movieId,
        imageType,
        imageKey,
      })

      const newImageUrl = updateResponse.data.imageUrl
      onImageUpdate(newImageUrl)
      setPreviewUrl(newImageUrl)

      // Clean up object URL
      URL.revokeObjectURL(objectUrl)
      
    } catch (err: unknown) {
      console.error('Upload failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [movieId, imageType, generateUploadUrl, updateMovieImage, onImageUpdate, currentImageUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    disabled: isUploading
  })

  const removeImage = () => {
    setPreviewUrl(null)
    onImageUpdate('')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt={`${imageType} preview`}
              className={`
                max-w-full rounded-lg shadow-lg
                ${imageType === 'poster' ? 'max-h-64 w-auto' : 'max-h-48 w-auto'}
              `}
            />
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="py-8">
            {isUploading ? (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Uploading...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Image className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'Drop the image here' : `Upload ${imageType}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports: JPEG, PNG, WebP (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
