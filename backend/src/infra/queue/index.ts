import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../../config';
import logger from '../../config/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface TranscodeJobData {
  videoId: string;
  inputPath: string;
  outputPath: string;
  qualities: string[];
}

class QueueService {
  private connection: Redis;
  private transcodeQueue: Queue;

  constructor() {
    this.connection = new Redis(config.REDIS_URL, {
      password: config.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });

    this.transcodeQueue = new Queue('transcode', {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.initWorkers();
  }

  private initWorkers(): void {
    // Transcode worker
    new Worker(
      'transcode',
      async (job: Job<TranscodeJobData>) => {
        logger.info(`Processing transcode job ${job.id} for video ${job.data.videoId}`);
        await this.processTranscodeJob(job.data);
      },
      {
        connection: this.connection,
        concurrency: 2, // Process 2 jobs simultaneously
      }
    );
  }

  async addTranscodeJob(data: TranscodeJobData): Promise<string> {
    const job = await this.transcodeQueue.add('transcode-video', data);
    logger.info(`Added transcode job ${job.id} for video ${data.videoId}`);
    return job.id!;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.transcodeQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      state: await job.getState(),
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }

  private async processTranscodeJob(data: TranscodeJobData): Promise<void> {
    const { videoId, inputPath, outputPath, qualities } = data;

    try {
      // Create output directory
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Generate HLS for different qualities
      for (let i = 0; i < qualities.length; i++) {
        const quality = qualities[i];
        const qualityOutputPath = path.join(path.dirname(outputPath), quality!);
        
        await fs.mkdir(qualityOutputPath, { recursive: true });
        
        logger.info(`Transcoding video ${videoId} to ${quality}`);
        
        // FFmpeg command for HLS generation
        const ffmpegCmd = this.buildFFmpegCommand(inputPath, qualityOutputPath, quality!);
        
        await execAsync(ffmpegCmd);
        
        logger.info(`Completed transcoding video ${videoId} to ${quality}`);
      }

      // Generate master playlist
      await this.generateMasterPlaylist(outputPath, qualities);
      
      logger.info(`Transcode job completed for video ${videoId}`);
    } catch (error: any) {
      logger.error(`Transcode job failed for video ${videoId}:`, error);
      throw error;
    }
  }

  private buildFFmpegCommand(inputPath: string, outputPath: string, quality: string): string {
    const qualitySettings = this.getQualitySettings(quality);
    
    return `ffmpeg -i "${inputPath}" ` +
      `-c:v libx264 -c:a aac ` +
      `-vf "scale=${qualitySettings.resolution}" ` +
      `-b:v ${qualitySettings.videoBitrate} -b:a ${qualitySettings.audioBitrate} ` +
      `-hls_time 10 -hls_playlist_type vod ` +
      `-hls_segment_filename "${outputPath}/segment_%03d.ts" ` +
      `"${outputPath}/playlist.m3u8"`;
  }

  private getQualitySettings(quality: string) {
    const settings = {
      '360p': {
        resolution: '640:360',
        videoBitrate: '800k',
        audioBitrate: '128k',
      },
      '480p': {
        resolution: '854:480',
        videoBitrate: '1400k',
        audioBitrate: '128k',
      },
      '720p': {
        resolution: '1280:720',
        videoBitrate: '2800k',
        audioBitrate: '192k',
      },
      '1080p': {
        resolution: '1920:1080',
        videoBitrate: '5000k',
        audioBitrate: '256k',
      },
    };

    return settings[quality as keyof typeof settings] || settings['720p'];
  }

  private async generateMasterPlaylist(outputPath: string, qualities: string[]): Promise<void> {
    let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (const quality of qualities) {
      const qualitySettings = this.getQualitySettings(quality);
      const bandwidth = parseInt(qualitySettings.videoBitrate.replace('k', '')) * 1000;
      const resolution = qualitySettings.resolution.replace(':', 'x');
      
      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n`;
      masterPlaylist += `${quality}/playlist.m3u8\n\n`;
    }

    await fs.writeFile(path.join(path.dirname(outputPath), 'master.m3u8'), masterPlaylist);
  }

  async closeConnection(): Promise<void> {
    await this.transcodeQueue.close();
    this.connection.disconnect();
  }
}

export default new QueueService();
