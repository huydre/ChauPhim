import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../../config';
import logger from '../../config/logger';

class StorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = config.STORAGE_BUCKET;
    this.s3Client = new S3Client({
      endpoint: config.STORAGE_ENDPOINT,
      region: config.STORAGE_REGION,
      credentials: {
        accessKeyId: config.STORAGE_ACCESS_KEY,
        secretAccessKey: config.STORAGE_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async getPresignedUrl(key: string, expiresIn = 900): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: any) {
      logger.error('Storage getPresignedUrl error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async getUploadPresignedUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: any) {
      logger.error('Storage getUploadPresignedUrl error:', error);
      throw new Error('Failed to generate upload presigned URL');
    }
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      logger.info(`File uploaded successfully: ${key}`);
    } catch (error: any) {
      logger.error('Storage upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  getPublicUrl(key: string): string {
    if (config.CDN_BASE_URL) {
      return `${config.CDN_BASE_URL}/${key}`;
    }
    // For MinIO, the URL format is: http://endpoint/bucket/key
    return `${config.STORAGE_ENDPOINT}/${this.bucket}/${key}`;
  }

  generateKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = filename.split('.').pop();
    return `${prefix}/${timestamp}-${randomString}.${extension}`;
  }

  generateHLSKey(videoId: string, quality?: string): string {
    const qualityStr = quality ? `_${quality}` : '';
    return `videos/${videoId}/hls${qualityStr}/playlist.m3u8`;
  }

  generateSubtitleKey(videoId: string, language: string): string {
    return `videos/${videoId}/subtitles/${language}.vtt`;
  }
}

export default new StorageService();
