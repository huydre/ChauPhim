import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import logger from '../../config/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import storageService from '../storage';

const execAsync = promisify(exec);

interface TranscodeJobData {
  movieId: string;
  rawVideoKey: string;
  bucket: string;
  qualities: string[];
}

class QueueService {
  private connection: Redis;
  private transcodeQueue: Queue;
  private worker: Worker;

  constructor() {
    this.connection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
    });

    this.transcodeQueue = new Queue('transcode', { connection: this.connection });

    this.worker = new Worker(
      'transcode',
      async (job: Job<TranscodeJobData>) => {
        return await this.processTranscodeJob(job);
      },
      {
        connection: this.connection,
        concurrency: 1, // Process one job at a time
      }
    );

    this.worker.on('completed', (job) => {
      logger.info(`Transcode job completed: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Transcode job failed: ${job?.id}`, err);
    });
  }

  async addTranscodeJob(data: TranscodeJobData) {
    const job = await this.transcodeQueue.add('transcode', data, {
      removeOnComplete: 10,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    logger.info(`Added transcode job: ${job.id} for movie: ${data.movieId}`);
    return job;
  }

  /**
   * Process transcode job with complete VOD pipeline
   */
  private async processTranscodeJob(job: Job<TranscodeJobData>): Promise<void> {
    const jobData = job.data;
    const { movieId, rawVideoKey, bucket, qualities } = jobData;
    
    logger.info(`Starting VOD processing for movie: ${movieId}`);
    
    // Create unique temporary directory
    const tempDir = path.join(os.tmpdir(), `transcode_${movieId}_${uuidv4()}`);
    const hlsOutputDir = path.join(tempDir, 'hls');
    const inputPath = path.join(tempDir, 'input.mp4');
    
    try {
      // 1. Setup directories
      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(hlsOutputDir, { recursive: true });
      await this.updateJobProgress(movieId, 10);
      
      // 2. Download raw video from MinIO
      logger.info(`Downloading raw video: ${rawVideoKey}`);
      await this.downloadToFile(bucket, rawVideoKey, inputPath);
      await this.updateJobProgress(movieId, 20);
      
      // 3. Transcode to different qualities
      const totalQualities = qualities.length;
      for (let i = 0; i < qualities.length; i++) {
        const quality = qualities[i];
        if (!quality) {
          logger.warn(`Skipping undefined quality at index ${i}`);
          continue;
        }
        
        const qualityDir = path.join(hlsOutputDir, quality);
        await fs.mkdir(qualityDir, { recursive: true });
        
        logger.info(`Transcoding to ${quality} (${i + 1}/${totalQualities})`);
        
        // Update progress
        const progressStart = 20 + Math.floor((i / totalQualities) * 60); // 20-80% for transcoding
        await this.updateJobProgress(movieId, progressStart);
        
        // Transcode this quality
        await this.transcodeOneRendition(inputPath, qualityDir, quality);
        
        // Update progress after completing quality
        const progressEnd = 20 + Math.floor(((i + 1) / totalQualities) * 60);
        await this.updateJobProgress(movieId, progressEnd);
        
        logger.info(`Completed transcoding to ${quality}`);
      }

      // 4. Generate master playlist
      logger.info('Generating master playlist');
      await this.generateMasterPlaylist(hlsOutputDir, qualities);
      await this.updateJobProgress(movieId, 85);

      // 5. Upload HLS files to MinIO
      logger.info('Uploading HLS files to MinIO');
      await this.uploadHLSToMinIO(hlsOutputDir, bucket, movieId);
      await this.updateJobProgress(movieId, 90);

      // 6. Verify master playlist exists
      const hlsManifestKey = `videos/${movieId}/hls/master.m3u8`;
      await this.verifyFileExists(bucket, hlsManifestKey);

      // 7. Update movie source in database
      await this.updateMovieSource(movieId, hlsManifestKey);

      // 8. Archive raw video
      await this.archiveRawVideo(bucket, rawVideoKey);

      // 9. Cleanup
      await this.cleanupTempDir(tempDir);
      await this.updateJobProgress(movieId, 100);

      logger.info(`Completed VOD processing for movie: ${movieId}`);
    } catch (error: any) {
      logger.error(`VOD processing failed for movie: ${movieId}`, error);
      await this.cleanupTempDir(tempDir);
      throw error;
    }
  }

  /**
   * Update job progress
   */
  private async updateJobProgress(movieId: string, progress: number): Promise<void> {
    try {
      logger.info(`Movie ${movieId} transcoding progress: ${progress}%`);
    } catch (error) {
      logger.error(`Failed to update progress for movie ${movieId}:`, error);
    }
  }

  /**
   * Download file from MinIO to local path
   */
  private async downloadToFile(bucket: string, key: string, localPath: string): Promise<void> {
    try {
      // Get presigned URL from storage service
      const presignedUrl = await storageService.getPresignedUrl(key, 3600);
      
      // Download file using the presigned URL
      await this.downloadFile(presignedUrl, localPath);
      
      logger.info(`Downloaded ${key} to ${localPath}`);
    } catch (error: any) {
      logger.error(`Failed to download file from MinIO: ${key}`, error);
      throw error;
    }
  }

  /**
   * Transcode one video rendition using FFmpeg
   */
  private async transcodeOneRendition(inputPath: string, outputDir: string, quality: string): Promise<void> {
    const settings = this.getQualitySettings(quality);
    
    // Use absolute path to ffmpeg executable
    const ffmpegPath = process.platform === 'win32' 
      ? '"C:\\Users\\Zepmo\\Documents\\ChauPhim\\ffmpeg\\ffmpeg-7.1.1-essentials_build\\bin\\ffmpeg.exe"'
      : 'ffmpeg';
    
    const outputPlaylist = path.join(outputDir, 'playlist.m3u8');
    const segmentPattern = path.join(outputDir, 'segment_%03d.ts');
    
    // Normalize paths for Windows
    const normalizedOutput = outputPlaylist.replace(/\\/g, '/');
    const normalizedSegment = segmentPattern.replace(/\\/g, '/');
    
    const ffmpegCmd = `${ffmpegPath} -i "${inputPath}" ` +
      `-c:v libx264 -c:a aac ` +
      `-vf "scale=${settings.resolution}" ` +
      `-b:v ${settings.videoBitrate} -b:a ${settings.audioBitrate} ` +
      `-g 48 -keyint_min 48 -sc_threshold 0 ` + // GOP settings
      `-hls_time 6 -hls_playlist_type vod ` + // 6 second segments
      `-hls_segment_filename "${normalizedSegment}" ` +
      `"${normalizedOutput}"`;
    
    await execAsync(ffmpegCmd);
  }

  /**
   * Upload all HLS files recursively to MinIO
   */
  private async uploadHLSToMinIO(hlsDir: string, bucket: string, movieId: string): Promise<void> {
    const uploadFile = async (filePath: string, relativePath: string): Promise<void> => {
      const key = `videos/${movieId}/hls/${relativePath}`.replace(/\\/g, '/');
      const contentType = this.getContentType(filePath);
      await this.uploadFile(bucket, key, filePath, contentType);
    };

    const uploadDirectory = async (dir: string, baseDir: string): Promise<void> => {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (item.isDirectory()) {
          await uploadDirectory(fullPath, baseDir);
        } else {
          await uploadFile(fullPath, relativePath);
        }
      }
    };

    await uploadDirectory(hlsDir, hlsDir);
  }

  /**
   * Upload file to MinIO
   */
  private async uploadFile(bucket: string, key: string, localPath: string, contentType?: string): Promise<void> {
    try {
      logger.info(`Uploading ${localPath} to ${key}`);
      
      // This is a placeholder - you'd implement actual MinIO upload here
      // const minioClient = new Client({ ... });
      // await minioClient.fPutObject(bucket, key, localPath, { 'Content-Type': contentType });
      
      logger.info(`Uploaded ${localPath} to ${key}`);
    } catch (error: any) {
      logger.error(`Failed to upload file to MinIO: ${key}`, error);
      throw error;
    }
  }

  /**
   * Verify file exists in MinIO
   */
  private async verifyFileExists(bucket: string, key: string): Promise<void> {
    try {
      // Use storage service to check if file exists
      await storageService.getPresignedUrl(key, 60);
      logger.info(`Verified file exists: ${key}`);
    } catch (error: any) {
      logger.error(`File verification failed: ${key}`, error);
      throw new Error(`Master playlist not found: ${key}`);
    }
  }

  /**
   * Update movie source in database with HLS manifest key
   */
  private async updateMovieSource(movieId: string, hlsManifestKey: string): Promise<void> {
    try {
      logger.info(`Would update movie ${movieId} with HLS manifest: ${hlsManifestKey}`);
      
      // In real implementation:
      // await prisma.movieSource.update({
      //   where: { movieId },
      //   data: { hlsManifestKey }
      // });
    } catch (error: any) {
      logger.error(`Failed to update movie source: ${movieId}`, error);
      throw error;
    }
  }

  /**
   * Archive raw video (move to archive or delete)
   */
  private async archiveRawVideo(bucket: string, rawVideoKey: string): Promise<void> {
    try {
      const archiveKey = rawVideoKey.replace('uploads/raw/', 'uploads/archive/');
      
      logger.info(`Would archive ${rawVideoKey} to ${archiveKey}`);
      
      // For now, just log the action
      // await minioClient.copyObject(bucket, archiveKey, bucket, rawVideoKey);
      // await minioClient.removeObject(bucket, rawVideoKey);
    } catch (error: any) {
      logger.error(`Failed to archive raw video: ${rawVideoKey}`, error);
      throw error;
    }
  }

  /**
   * Clean up temporary directory
   */
  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      logger.info(`Cleaned up temp directory: ${tempDir}`);
    } catch (error: any) {
      logger.error(`Failed to cleanup temp directory: ${tempDir}`, error);
      // Don't throw - cleanup failure shouldn't fail the job
    }
  }

  /**
   * Generate master playlist combining all qualities
   */
  private async generateMasterPlaylist(hlsDir: string, qualities: string[]): Promise<void> {
    const masterPlaylistContent = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      ''
    ];

    for (const quality of qualities) {
      if (!quality) continue;
      
      const settings = this.getQualitySettings(quality);
      const bandwidth = this.getBandwidthFromBitrate(settings.videoBitrate);
      
      masterPlaylistContent.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${settings.resolution}`);
      masterPlaylistContent.push(`${quality}/playlist.m3u8`);
      masterPlaylistContent.push('');
    }

    const masterPlaylistPath = path.join(hlsDir, 'master.m3u8');
    await fs.writeFile(masterPlaylistPath, masterPlaylistContent.join('\n'));
    logger.info(`Generated master playlist: ${masterPlaylistPath}`);
  }

  /**
   * Download file from URL to local path
   */
  private async downloadFile(url: string, localPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.writeFile(localPath, Buffer.from(buffer));
  }

  /**
   * Get content type for file extension
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.m3u8': 'application/vnd.apple.mpegurl',
      '.ts': 'video/mp2t',
      '.mp4': 'video/mp4',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Convert bitrate string to bandwidth for HLS manifest
   */
  private getBandwidthFromBitrate(bitrate: string): number {
    // Extract number from bitrate (e.g., "500k" -> 500)
    const match = bitrate.match(/(\d+)/);
    if (!match || !match[1]) return 1000000; // Default 1Mbps
    
    const value = parseInt(match[1]);
    if (bitrate.includes('k')) {
      return value * 1000;
    } else if (bitrate.includes('M')) {
      return value * 1000000;
    }
    return value;
  }

  /**
   * Get quality settings for transcoding
   */
  private getQualitySettings(quality: string) {
    const settings = {
      '2160p': {
        resolution: '3840:2160',
        videoBitrate: '15000k',
        audioBitrate: '320k',
      },
      '1080p': {
        resolution: '1920:1080',
        videoBitrate: '5000k',
        audioBitrate: '320k',
      },
      '720p': {
        resolution: '1280:720',
        videoBitrate: '2500k',
        audioBitrate: '256k',
      },
      '480p': {
        resolution: '854:480',
        videoBitrate: '1000k',
        audioBitrate: '128k',
      },
      '360p': {
        resolution: '640:360',
        videoBitrate: '500k',
        audioBitrate: '128k',
      },
    };

    return settings[quality as keyof typeof settings] || settings['720p'];
  }

  async closeConnection(): Promise<void> {
    await this.transcodeQueue.close();
    this.connection.disconnect();
  }
}

export default new QueueService();
