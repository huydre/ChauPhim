import prisma from '../../infra/db';
import storageService from '../../infra/storage';
import queueService from '../../infra/queue';
import { AppError } from '../../middlewares/errorHandler';
import { VideoType, AgeRating, VideoQuality } from '@prisma/client';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../config/logger';
import { auditLogger, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/auditLogger';

export interface MovieImage {
  _id?: string;
  path: string;
}

export interface MovieImages {
  posters?: MovieImage[];
  horizontal_posters?: MovieImage[];
  backdrops?: MovieImage[];
  titles?: MovieImage[];
}

export interface CreateMovieData {
  slug?: string;
  titleVi?: string;
  titleEn?: string;
  originalTitle?: string;
  englishTitle?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  overview?: string;
  type?: VideoType;
  year?: number;
  posterUrl?: string;
  backdropUrl?: string;
  images?: MovieImages;
  quality?: string; // VideoQuality enum
  originCountry?: string[];
  imdbRating?: number;
  imdbId?: string;
  imagesJson?: MovieImages; // Complex image data structure
  ageRating?: string;
  durationMinutes?: number;
  genreIds?: string[];
  castIds?: string[];
  rawVideoKey?: string;
}

export interface UpdateMovieData {
  slug?: string;
  titleVi?: string;
  titleEn?: string;
  originalTitle?: string;
  englishTitle?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  overview?: string;
  year?: number;
  posterUrl?: string;
  backdropUrl?: string;
  quality?: string; // VideoQuality enum
  originCountry?: string[];
  imdbRating?: number;
  imdbId?: string;
  imagesJson?: MovieImages; // Complex image data structure
  ageRating?: string;
  durationMinutes?: number;
  genreIds?: string[];
  castIds?: string[];
}

export interface AdminMovieFilters {
  page: number;
  limit: number;
  status?: 'published' | 'unpublished' | 'processing';
  type?: VideoType;
}

export class AdminService {
  async generateUploadUrl(filename: string, contentType: string) {
    try {
      logger.info(`Generating upload URL for: ${filename}, contentType: ${contentType}`);
      
      // Generate unique key for the file
      const videoKey = storageService.generateKey('uploads/raw', filename);
      logger.info(`Generated video key: ${videoKey}`);
      
      // Generate presigned upload URL (expires in 1 hour)
      const uploadUrl = await storageService.getUploadPresignedUrl(videoKey, contentType, 3600);
      logger.info(`Generated upload URL successfully for: ${filename}`);
      
      return {
        uploadUrl,
        videoKey,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error: any) {
      logger.error('Failed to generate upload URL:', {
        error: error.message,
        stack: error.stack,
        filename,
        contentType
      });
      throw new AppError('Failed to generate upload URL: ' + error.message, 500);
    }
  }

  async createMovie(data: CreateMovieData, userId?: string) {
    try {
      // Extract filename info for better defaults
      let filenameInfo = { name: '', ext: '', year: null as number | null };
      if (data.rawVideoKey) {
        const filename = data.rawVideoKey.split('/').pop()?.split('.')[0] || '';
        filenameInfo.name = filename;
        
        // Try to extract year from filename
        const yearMatch = filename.match(/(\d{4})/);
        if (yearMatch && yearMatch[1]) {
          const extractedYear = parseInt(yearMatch[1]);
          if (extractedYear >= 1900 && extractedYear <= new Date().getFullYear() + 2) {
            filenameInfo.year = extractedYear;
          }
        }
      }

      // Generate smart default values
      const currentYear = new Date().getFullYear();
      const defaultTitle = data.titleVi || data.titleEn || filenameInfo.name || 'Untitled Movie';
      const slug = data.slug || this.generateSlug(defaultTitle);
      
      // Check if slug already exists
      const existingVideo = await prisma.video.findUnique({
        where: { slug },
      });

      if (existingVideo) {
        throw new AppError('Movie with this slug already exists', 400);
      }

      // Smart defaults based on video info
      const movieData = {
        slug,
        titleVi: data.titleVi || defaultTitle,
        titleEn: data.titleEn || defaultTitle,
        originalTitle: data.originalTitle,
        englishTitle: data.englishTitle,
        descriptionVi: data.descriptionVi || `Phim ${defaultTitle} - Được upload vào ${new Date().toLocaleDateString('vi-VN')}`,
        descriptionEn: data.descriptionEn || `${defaultTitle} - Uploaded on ${new Date().toLocaleDateString('en-US')}`,
        overview: data.overview,
        type: data.type || 'MOVIE',
        year: data.year || filenameInfo.year || currentYear,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        quality: data.quality || 'HD', // Default to HD
        originCountry: data.originCountry ? JSON.stringify(data.originCountry) : null,
        imdbRating: data.imdbRating,
        imdbId: data.imdbId,
        imagesJson: data.imagesJson ? JSON.stringify(data.imagesJson) : undefined,
        ageRating: this.normalizeAgeRating(data.ageRating),
        durationMinutes: data.durationMinutes || 120, // Default 2 hours
        isPublished: false, // Start as unpublished
        viewsCount: 0,
      };

      // Create video record with enhanced defaults
      const video = await prisma.video.create({
        data: movieData as any, // Type casting until Prisma client is regenerated
      });

      // Create movie source if rawVideoKey is provided
      if (data.rawVideoKey) {
        await prisma.movieSource.create({
          data: {
            videoId: video.id,
            isPublished: false, // Start as unpublished
          },
        });
      }

      // Associate genres if provided, otherwise add default genre
      if (data.genreIds && data.genreIds.length > 0) {
        await prisma.videoGenre.createMany({
          data: data.genreIds.map(genreId => ({
            videoId: video.id,
            genreId,
          })),
          skipDuplicates: true,
        });
      }

      // Associate cast members if provided
      if (data.castIds && data.castIds.length > 0) {
        await prisma.videoCast.createMany({
          data: data.castIds.map(castId => ({
            videoId: video.id,
            castId,
            role: 'ACTOR' as any,
            roleName: 'Actor',
          })),
          skipDuplicates: true,
        });
      }

      logger.info(`Created movie: ${video.titleVi} (${video.id}) with enhanced defaults`);

      // Log audit
      if (userId) {
        await auditLogger.logSuccess({
          userId,
          action: AUDIT_ACTIONS.CREATE_VIDEO,
          resource: AUDIT_RESOURCES.VIDEO,
          resourceId: video.id,
          details: {
            title: video.titleVi,
            type: video.type,
            slug: video.slug,
            hasRawVideo: !!data.rawVideoKey,
          },
        });
      }

      return await this.getMovieById(video.id);
    } catch (error: any) {
      logger.error('Failed to create movie:', error);
      
      // Log failed audit
      if (userId) {
        await auditLogger.logFailure({
          userId,
          action: AUDIT_ACTIONS.CREATE_VIDEO,
          resource: AUDIT_RESOURCES.VIDEO,
          details: {
            error: error.message,
            inputData: {
              titleVi: data.titleVi,
              titleEn: data.titleEn,
              type: data.type,
            },
          },
        });
      }
      
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create movie', 500);
    }
  }

  async updateMovie(id: string, data: UpdateMovieData) {
    try {
      logger.info(`Updating movie ${id} with data:`, data);
      
      const video = await prisma.video.findUnique({
        where: { id },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Update video record
      const updatedVideo = await prisma.video.update({
        where: { id },
        data: {
          slug: data.slug,
          titleVi: data.titleVi,
          titleEn: data.titleEn,
          originalTitle: data.originalTitle,
          englishTitle: data.englishTitle,
          descriptionVi: data.descriptionVi,
          descriptionEn: data.descriptionEn,
          overview: data.overview,
          year: data.year,
          posterUrl: data.posterUrl,
          backdropUrl: data.backdropUrl,
          quality: data.quality as any, // Type casting until Prisma client is regenerated
          originCountry: data.originCountry ? JSON.stringify(data.originCountry) : undefined,
          imdbRating: data.imdbRating,
          imdbId: data.imdbId,
          imagesJson: data.imagesJson ? JSON.stringify(data.imagesJson) : undefined,
          ageRating: data.ageRating as any,
          durationMinutes: data.durationMinutes,
        },
      });

      logger.info(`Video updated successfully: ${updatedVideo.id}`);

      // Update genres if provided
      if (data.genreIds !== undefined) {
        logger.info(`Updating genres for video ${id}:`, data.genreIds);
        
        // Remove existing genres
        await prisma.videoGenre.deleteMany({
          where: { videoId: id },
        });

        // Add new genres
        if (data.genreIds.length > 0) {
          await prisma.videoGenre.createMany({
            data: data.genreIds.map(genreId => ({
              videoId: id,
              genreId,
            })),
          });
        }
        
        logger.info(`Genres updated successfully for video ${id}`);
      }

      // Update cast if provided
      if (data.castIds !== undefined) {
        logger.info(`Updating cast for video ${id}:`, data.castIds);
        
        // Remove existing cast
        await prisma.videoCast.deleteMany({
          where: { videoId: id },
        });

        // Add new cast
        if (data.castIds.length > 0) {
          await prisma.videoCast.createMany({
            data: data.castIds.map(castId => ({
              videoId: id,
              castId,
              role: 'ACTOR' as any,
              roleName: 'Actor',
            })),
          });
        }
        
        logger.info(`Cast updated successfully for video ${id}`);
      }

      logger.info(`Movie update completed: ${updatedVideo.titleEn} (${id})`);

      return await this.getMovieById(id);
    } catch (error: any) {
      logger.error('Failed to update movie:', {
        movieId: id,
        error: error.message,
        stack: error.stack,
        data
      });
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update movie', 500);
    }
  }

  async startTranscoding(videoId: string, rawVideoKey: string, qualities: string[]) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Add transcoding job to queue
      const job = await queueService.addTranscodeJob({
        movieId: videoId,
        rawVideoKey,
        bucket: process.env.S3_BUCKET || 'chauphim-videos',
        qualities: qualities || ['480p', '720p', '1080p'],
      });

      // Save job to database
      await prisma.transcodeJob.create({
        data: {
          videoId,
          jobId: job.id || '',
          status: 'QUEUED',
          progress: 0,
          qualities: qualities || ['480p', '720p', '1080p'],
          inputPath: rawVideoKey,
          outputPath: `videos/${videoId}/hls`,
        },
      });

      logger.info(`Started transcoding for video ${videoId}, job ID: ${job.id}`);

      return {
        jobId: job.id,
        status: 'queued',
        message: 'Transcoding job started successfully',
      };
    } catch (error: any) {
      logger.error('Failed to start transcoding:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to start transcoding', 500);
    }
  }

  async getTranscodingStatus(videoId: string) {
    try {
      logger.info(`Checking transcoding status for video ${videoId}`);

      // Find the most recent transcode job for this video
      const transcodeJob = await prisma.transcodeJob.findFirst({
        where: { videoId },
        orderBy: { createdAt: 'desc' },
      });

      if (!transcodeJob) {
        throw new AppError('No transcoding job found for this video', 404);
      }

      // Get real-time status from queue
      const queueStatus = await queueService.getJobStatus(transcodeJob.jobId);
      
      if (queueStatus) {
        // Update database with current queue status
        const statusMap: { [key: string]: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' } = {
          'waiting': 'QUEUED',
          'active': 'PROCESSING', 
          'completed': 'COMPLETED',
          'failed': 'FAILED',
          'delayed': 'QUEUED',
        };

        const dbStatus = statusMap[queueStatus.status] || 'QUEUED';
        const progress = (typeof queueStatus.progress === 'number') ? queueStatus.progress : transcodeJob.progress;

        // Update job in database
        await prisma.transcodeJob.update({
          where: { id: transcodeJob.id },
          data: {
            status: dbStatus,
            progress: progress,
            ...(dbStatus === 'PROCESSING' && !transcodeJob.startedAt && { startedAt: new Date() }),
            ...(dbStatus === 'COMPLETED' && { completedAt: new Date(), progress: 100 }),
            ...(dbStatus === 'FAILED' && { 
              completedAt: new Date(), 
              errorMessage: queueStatus.failedReason || 'Unknown error'
            }),
          },
        });

        return {
          status: dbStatus.toLowerCase(),
          progress: progress,
          message: this.getStatusMessage(dbStatus, progress),
          jobId: transcodeJob.jobId,
          startedAt: transcodeJob.startedAt,
          completedAt: transcodeJob.completedAt,
          errorMessage: transcodeJob.errorMessage,
          ...(dbStatus === 'COMPLETED' && {
            hlsManifestKey: `${transcodeJob.outputPath}/master.m3u8`
          }),
        };
      }

      // Fallback to database status if queue job not found
      return {
        status: transcodeJob.status.toLowerCase(),
        progress: transcodeJob.progress,
        message: this.getStatusMessage(transcodeJob.status, transcodeJob.progress),
        jobId: transcodeJob.jobId,
        startedAt: transcodeJob.startedAt,
        completedAt: transcodeJob.completedAt,
        errorMessage: transcodeJob.errorMessage,
        ...(transcodeJob.status === 'COMPLETED' && {
          hlsManifestKey: `${transcodeJob.outputPath}/master.m3u8`
        }),
      };
    } catch (error: any) {
      logger.error('Failed to get transcoding status:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get transcoding status', 500);
    }
  }

  async getTranscodeJobs(page: number = 1, limit: number = 20, status?: string) {
    try {
      const skip = (page - 1) * limit;
      
      const where = status ? { status: status as any } : {};
      
      const [jobs, total] = await Promise.all([
        prisma.transcodeJob.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            video: {
              select: {
                titleVi: true,
                titleEn: true,
                slug: true,
                posterUrl: true,
              },
            },
          },
        }),
        prisma.transcodeJob.count({ where }),
      ]);

      // Update status from queue for active jobs
      const updatedJobs = await Promise.all(
        jobs.map(async (job) => {
          if (job.status === 'QUEUED' || job.status === 'PROCESSING') {
            try {
              const queueStatus = await queueService.getJobStatus(job.jobId);
              if (queueStatus) {
                const statusMap: { [key: string]: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' } = {
                  'waiting': 'QUEUED',
                  'active': 'PROCESSING', 
                  'completed': 'COMPLETED',
                  'failed': 'FAILED',
                  'delayed': 'QUEUED',
                };

                const dbStatus = statusMap[queueStatus.status] || job.status;
                const progress = (typeof queueStatus.progress === 'number') ? queueStatus.progress : job.progress;

                // Update in database
                await prisma.transcodeJob.update({
                  where: { id: job.id },
                  data: {
                    status: dbStatus,
                    progress: progress,
                    ...(dbStatus === 'PROCESSING' && !job.startedAt && { startedAt: new Date() }),
                    ...(dbStatus === 'COMPLETED' && { completedAt: new Date(), progress: 100 }),
                    ...(dbStatus === 'FAILED' && { 
                      completedAt: new Date(), 
                      errorMessage: queueStatus.failedReason || 'Unknown error'
                    }),
                  },
                });

                return { ...job, status: dbStatus, progress };
              }
            } catch (error) {
              logger.error(`Failed to get queue status for job ${job.jobId}:`, error);
            }
          }
          return job;
        })
      );

      return {
        data: updatedJobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Failed to get transcode jobs:', error);
      throw new AppError('Failed to get transcode jobs', 500);
    }
  }

  private getStatusMessage(status: string, progress: number): string {
    switch (status) {
      case 'QUEUED':
      case 'queued':
        return 'Transcoding job is queued and waiting to start';
      case 'PROCESSING':
      case 'processing':
        return `Transcoding in progress: ${progress}% completed`;
      case 'COMPLETED':
      case 'completed':
        return 'Transcoding completed successfully';
      case 'FAILED':
      case 'failed':
        return 'Transcoding failed';
      default:
        return 'Unknown status';
    }
  }

  async togglePublishStatus(videoId: string, isPublished: boolean) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          movieSources: true,
        },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // If publishing, ensure transcoding is complete
      if (isPublished && video.movieSources.length === 0) {
        throw new AppError('Cannot publish movie without transcoded video source', 400);
      }

      // Update video publish status
      const updatedVideo = await prisma.video.update({
        where: { id: videoId },
        data: { isPublished },
      });

      // Update movie source publish status
      if (video.movieSources.length > 0) {
        await prisma.movieSource.updateMany({
          where: { videoId },
          data: { isPublished },
        });
      }

      logger.info(`${isPublished ? 'Published' : 'Unpublished'} movie: ${video.titleEn} (${videoId})`);

      return await this.getMovieById(videoId);
    } catch (error: any) {
      logger.error('Failed to toggle publish status:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update publish status', 500);
    }
  }

  async getSubtitleUploadUrl(videoId: string, language: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Generate subtitle key
      const subtitleKey = storageService.generateSubtitleKey(videoId, language);
      
      // Generate presigned upload URL
      const uploadUrl = await storageService.getUploadPresignedUrl(
        subtitleKey,
        'text/vtt',
        3600
      );

      logger.info(`Generated subtitle upload URL for video ${videoId}, language: ${language}`);

      return {
        uploadUrl,
        subtitleKey,
        language,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error: any) {
      logger.error('Failed to generate subtitle upload URL:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate subtitle upload URL', 500);
    }
  }

  // Replace video file for existing movie
  async replaceMovieVideo(videoId: string, newVideoKey: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { movieSources: true },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Update or create movie source with new video
      if (video.movieSources.length > 0) {
        await prisma.movieSource.updateMany({
          where: { videoId },
          data: {
            rawVideoKey: newVideoKey,
            hlsManifestKey: null, // Reset HLS, will need re-transcoding
            isPublished: false, // Unpublish until re-transcoded
          },
        });
      } else {
        await prisma.movieSource.create({
          data: {
            videoId,
            rawVideoKey: newVideoKey,
            isPublished: false,
          },
        });
      }

      logger.info(`Replaced video for movie ${videoId} with new key: ${newVideoKey}`);

      return await this.getMovieById(videoId);
    } catch (error: any) {
      logger.error('Failed to replace movie video:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to replace movie video', 500);
    }
  }

  // Add subtitle to movie using JSON storage
  async addMovieSubtitle(videoId: string, language: string, label: string, subtitleKey: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { movieSources: true },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      if (video.movieSources.length === 0) {
        throw new AppError('Movie has no video source', 400);
      }

      const movieSource = video.movieSources[0];
      
      if (!movieSource) {
        throw new AppError('Movie source not found', 400);
      }
      
      // Get existing subtitles
      const existingSubtitles = movieSource.subtitlesJson as any[] || [];
      
      // Check if subtitle for this language already exists
      const existingIndex = existingSubtitles.findIndex(sub => sub.language === language);
      
      const newSubtitle = {
        language,
        label,
        key: subtitleKey,
        url: storageService.getPublicUrl(subtitleKey),
      };

      if (existingIndex >= 0) {
        // Update existing subtitle
        existingSubtitles[existingIndex] = newSubtitle;
        logger.info(`Updated subtitle for movie ${videoId}, language: ${language}`);
      } else {
        // Add new subtitle
        existingSubtitles.push(newSubtitle);
        logger.info(`Added new subtitle for movie ${videoId}, language: ${language}`);
      }

      // Update movie source with new subtitles
      await prisma.movieSource.update({
        where: { id: movieSource.id },
        data: {
          subtitlesJson: existingSubtitles,
        },
      });

      return await this.getMovieById(videoId);
    } catch (error: any) {
      logger.error('Failed to add movie subtitle:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add movie subtitle', 500);
    }
  }

  // Get all subtitles for a movie
  async getMovieSubtitles(videoId: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { movieSources: true },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      const subtitles = video.movieSources.flatMap(source => 
        (source.subtitlesJson as any[] || [])
      );

      return {
        videoId,
        subtitles: subtitles.map((subtitle, index) => ({
          id: `${videoId}-${subtitle.language}`, // Generate ID for frontend
          language: subtitle.language,
          label: subtitle.label,
          key: subtitle.key,
          url: subtitle.url || storageService.getPublicUrl(subtitle.key),
        })),
      };
    } catch (error: any) {
      logger.error('Failed to get movie subtitles:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get movie subtitles', 500);
    }
  }

  // Delete subtitle
  async deleteMovieSubtitle(videoId: string, language: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { movieSources: true },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      if (video.movieSources.length === 0) {
        throw new AppError('Movie has no video source', 400);
      }

      const movieSource = video.movieSources[0];
      
      if (!movieSource) {
        throw new AppError('Movie source not found', 400);
      }
      
      const existingSubtitles = movieSource.subtitlesJson as any[] || [];
      
      // Find and remove subtitle
      const subtitleIndex = existingSubtitles.findIndex(sub => sub.language === language);
      
      if (subtitleIndex === -1) {
        throw new AppError('Subtitle not found', 404);
      }

      const subtitleToDelete = existingSubtitles[subtitleIndex];
      
      // Remove from array
      existingSubtitles.splice(subtitleIndex, 1);

      // Update movie source
      await prisma.movieSource.update({
        where: { id: movieSource.id },
        data: {
          subtitlesJson: existingSubtitles,
        },
      });

      // Delete subtitle file from storage
      try {
        await storageService.deleteObject(subtitleToDelete.key);
      } catch (error) {
        logger.warn(`Failed to delete subtitle file: ${subtitleToDelete.key}`, error);
      }

      logger.info(`Deleted subtitle ${language} for video ${videoId}`);

      return { message: 'Subtitle deleted successfully' };
    } catch (error: any) {
      logger.error('Failed to delete subtitle:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete subtitle', 500);
    }
  }

  async getImageUploadUrl(videoId: string, filename: string, contentType: string, imageType: 'poster' | 'backdrop') {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Generate image key based on type
      const imageKey = storageService.generateKey(`videos/${videoId}/images/${imageType}`, filename);
      
      // Generate presigned upload URL
      const uploadUrl = await storageService.getUploadPresignedUrl(
        imageKey,
        contentType,
        3600
      );

      logger.info(`Generated ${imageType} upload URL for video ${videoId}, filename: ${filename}`);

      return {
        uploadUrl,
        imageKey,
        imageType,
        filename,
        contentType,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error: any) {
      logger.error('Failed to generate image upload URL:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to generate image upload URL', 500);
    }
  }

  async updateMovieImage(videoId: string, imageType: 'poster' | 'backdrop', imageKey: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Generate public URL for the uploaded image
      const imageUrl = storageService.getPublicUrl(imageKey);
      
      logger.info(`Generated public URL for ${imageType}:`, {
        imageKey,
        imageUrl,
        storageEndpoint: process.env.STORAGE_ENDPOINT,
        bucket: process.env.STORAGE_BUCKET
      });

      // Update the appropriate field
      const updateData: any = {};
      if (imageType === 'poster') {
        updateData.posterUrl = imageUrl;
      } else {
        updateData.backdropUrl = imageUrl;
      }

      const updatedVideo = await prisma.video.update({
        where: { id: videoId },
        data: updateData,
      });

      logger.info(`Updated ${imageType} for video ${videoId}: ${imageUrl}`);

      return {
        message: `${imageType} updated successfully`,
        imageUrl,
        [imageType + 'Url']: imageUrl,
      };
    } catch (error: any) {
      logger.error('Failed to update movie image:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update movie image', 500);
    }
  }

  async uploadSubtitles(videoId: string, language: string, subtitleKey: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          movieSources: true,
        },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      if (video.movieSources.length === 0) {
        throw new AppError('Movie source not found', 404);
      }

      const movieSource = video.movieSources[0]!;
      const currentSubtitles = (movieSource.subtitlesJson as any[]) || [];

      // Check if language already exists
      const existingIndex = currentSubtitles.findIndex(sub => sub.lang === language);
      
      const newSubtitle = {
        lang: language,
        label: this.getLanguageLabel(language),
        key: subtitleKey,
      };

      if (existingIndex >= 0) {
        // Update existing subtitle
        currentSubtitles[existingIndex] = newSubtitle;
      } else {
        // Add new subtitle
        currentSubtitles.push(newSubtitle);
      }

      // Update movie source with new subtitles
      await prisma.movieSource.update({
        where: { id: movieSource.id },
        data: {
          subtitlesJson: currentSubtitles,
        },
      });

      logger.info(`Added subtitle for video ${videoId}, language: ${language}`);

      return {
        message: 'Subtitle uploaded successfully',
        subtitles: currentSubtitles,
      };
    } catch (error: any) {
      logger.error('Failed to upload subtitles:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upload subtitles', 500);
    }
  }

  async getAllMovies(filters: AdminMovieFilters) {
    try {
      const { page, limit, status, type } = filters;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (status) {
        switch (status) {
          case 'published':
            where.isPublished = true;
            break;
          case 'unpublished':
            where.isPublished = false;
            break;
          case 'processing':
            // Videos without movie sources (still processing)
            where.movieSources = { none: {} };
            break;
        }
      }

      if (type) {
        where.type = type;
      }

      const [videos, total] = await Promise.all([
        prisma.video.findMany({
          where,
          include: {
            genres: {
              include: {
                genre: {
                  select: {
                    nameVi: true,
                    nameEn: true,
                  },
                },
              },
            },
            movieSources: {
              select: {
                id: true,
                isPublished: true,
                hlsManifestKey: true,
              },
            },
            _count: {
              select: {
                ratings: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.video.count({ where }),
      ]);

      return {
        data: videos.map(video => {
          // Create images structure from existing data
          const images: MovieImages = {
            posters: [],
            horizontal_posters: [],
            backdrops: [],
            titles: []
          };

          // Add poster if exists
          if (video.posterUrl) {
            images.posters?.push({
              path: video.posterUrl
            });
          }

          // Add backdrop if exists
          if (video.backdropUrl) {
            images.backdrops?.push({
              path: video.backdropUrl
            });
          }

          // Merge with imagesJson if exists
          let parsedImagesJson = null;
          if (video.imagesJson) {
            try {
              parsedImagesJson = JSON.parse(video.imagesJson as string);
              // Merge additional images from imagesJson
              if (parsedImagesJson.posters) {
                images.posters = [...(images.posters || []), ...parsedImagesJson.posters];
              }
              if (parsedImagesJson.horizontal_posters) {
                images.horizontal_posters = [...(images.horizontal_posters || []), ...parsedImagesJson.horizontal_posters];
              }
              if (parsedImagesJson.backdrops) {
                images.backdrops = [...(images.backdrops || []), ...parsedImagesJson.backdrops];
              }
              if (parsedImagesJson.titles) {
                images.titles = [...(images.titles || []), ...parsedImagesJson.titles];
              }
            } catch (error) {
              logger.warn('Failed to parse imagesJson for video:', video.id);
            }
          }

          return {
            ...video,
            originCountry: video.originCountry ? JSON.parse(video.originCountry as string) : null,
            images: images,
            // Keep imagesJson for backward compatibility
            imagesJson: parsedImagesJson,
          };
        }),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error('Failed to get all movies:', error);
      throw new AppError('Failed to get movies', 500);
    }
  }

  async deleteMovie(videoId: string) {
    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new AppError('Movie not found', 404);
      }

      // Delete video and all related data (cascade delete)
      await prisma.video.delete({
        where: { id: videoId },
      });

      logger.info(`Deleted movie: ${video.titleEn} (${videoId})`);

      // TODO: Also delete files from storage in production
      // await storageService.deleteFolder(`videos/${videoId}/`);

    } catch (error: any) {
      logger.error('Failed to delete movie:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete movie', 500);
    }
  }

  async getMovieById(id: string) {
    const movie = await prisma.video.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: {
              select: {
                id: true,
                slug: true,
                nameVi: true,
                nameEn: true,
              },
            },
          },
        },
        casts: {
          include: {
            cast: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        movieSources: {
          select: {
            id: true,
            hlsManifestKey: true,
            isPublished: true,
            subtitlesJson: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            comments: true,
          },
        },
      },
    });

    if (!movie) return null;

    // Create images structure from existing data
    const images: MovieImages = {
      posters: [],
      horizontal_posters: [],
      backdrops: [],
      titles: []
    };

    // Add poster if exists
    if (movie.posterUrl) {
      images.posters?.push({
        path: movie.posterUrl
      });
    }

    // Add backdrop if exists
    if (movie.backdropUrl) {
      images.backdrops?.push({
        path: movie.backdropUrl
      });
    }

    // Merge with imagesJson if exists
    let parsedImagesJson = null;
    if (movie.imagesJson) {
      try {
        parsedImagesJson = JSON.parse(movie.imagesJson as string);
        // Merge additional images from imagesJson
        if (parsedImagesJson.posters) {
          images.posters = [...(images.posters || []), ...parsedImagesJson.posters];
        }
        if (parsedImagesJson.horizontal_posters) {
          images.horizontal_posters = [...(images.horizontal_posters || []), ...parsedImagesJson.horizontal_posters];
        }
        if (parsedImagesJson.backdrops) {
          images.backdrops = [...(images.backdrops || []), ...parsedImagesJson.backdrops];
        }
        if (parsedImagesJson.titles) {
          images.titles = [...(images.titles || []), ...parsedImagesJson.titles];
        }
      } catch (error) {
        logger.warn('Failed to parse imagesJson:', error);
      }
    }

    // Parse and format the response
    return {
      ...movie,
      originCountry: movie.originCountry ? JSON.parse(movie.originCountry as string) : null,
      images: images,
      // Keep imagesJson for backward compatibility
      imagesJson: parsedImagesJson,
    };
  }

  private getLanguageLabel(language: string): string {
    const labels: Record<string, string> = {
      vi: 'Tiếng Việt',
      en: 'English',
      zh: '中文',
      ja: '日本語',
      ko: '한국어',
      th: 'ไทย',
      fr: 'Français',
      es: 'Español',
    };

    return labels[language] || language.toUpperCase();
  }

  private normalizeAgeRating(ageRating?: string): AgeRating {
    if (!ageRating) return 'PG13';
    
    const normalized = ageRating.toUpperCase().replace(/[-\s]/g, '');
    
    // Map various formats to Prisma enum values
    const mapping: Record<string, AgeRating> = {
      'G': 'G',
      'GENERAL': 'G',
      'PG': 'PG',
      'PARENTALGUIDANCE': 'PG',
      'PG13': 'PG13',
      'PARENTALGUIDANCE13': 'PG13',
      'R': 'R',
      'RESTRICTED': 'R',
      'NC17': 'NC17',
      'NOCHILDRENUNDER17': 'NC17',
    };

    return mapping[normalized] || 'PG13'; // Default to PG13 if unknown
  }

  private generateSlug(title: string): string {
    if (!title) {
      return `movie-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }

    return title
      .toLowerCase()
      .normalize('NFD') // Normalize Vietnamese characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd') // Handle Vietnamese đ
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim() // Remove leading/trailing spaces
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      || `movie-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}
