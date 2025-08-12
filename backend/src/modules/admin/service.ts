import prisma from '../../infra/db';
import storageService from '../../infra/storage';
import queueService from '../../infra/queue';
import { AppError } from '../../middlewares/errorHandler';
import { VideoType, AgeRating } from '@prisma/client';
import logger from '../../config/logger';

export interface CreateMovieData {
  slug?: string;
  titleVi?: string;
  titleEn?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  type?: VideoType;
  year?: number;
  posterUrl?: string;
  backdropUrl?: string;
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
  descriptionVi?: string;
  descriptionEn?: string;
  year?: number;
  posterUrl?: string;
  backdropUrl?: string;
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
      // Generate unique key for the file
      const videoKey = storageService.generateKey('uploads/raw', filename);
      
      // Generate presigned upload URL (expires in 1 hour)
      const uploadUrl = await storageService.getUploadPresignedUrl(videoKey, contentType, 3600);
      
      logger.info(`Generated upload URL for file: ${filename}`);
      
      return {
        uploadUrl,
        videoKey,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error: any) {
      logger.error('Failed to generate upload URL:', error);
      throw new AppError('Failed to generate upload URL', 500);
    }
  }

  async createMovie(data: CreateMovieData) {
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
        descriptionVi: data.descriptionVi || `Phim ${defaultTitle} - Được upload vào ${new Date().toLocaleDateString('vi-VN')}`,
        descriptionEn: data.descriptionEn || `${defaultTitle} - Uploaded on ${new Date().toLocaleDateString('en-US')}`,
        type: data.type || 'MOVIE',
        year: data.year || filenameInfo.year || currentYear,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        ageRating: this.normalizeAgeRating(data.ageRating),
        durationMinutes: data.durationMinutes || 120, // Default 2 hours
        isPublished: false, // Start as unpublished
        viewsCount: 0,
      };

      // Create video record with enhanced defaults
      const video = await prisma.video.create({
        data: movieData,
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

      return await this.getMovieById(video.id);
    } catch (error: any) {
      logger.error('Failed to create movie:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create movie', 500);
    }
  }

  async updateMovie(id: string, data: UpdateMovieData) {
    try {
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
          descriptionVi: data.descriptionVi,
          descriptionEn: data.descriptionEn,
          year: data.year,
          posterUrl: data.posterUrl,
          backdropUrl: data.backdropUrl,
          ageRating: data.ageRating as any,
          durationMinutes: data.durationMinutes,
        },
      });

      // Update genres if provided
      if (data.genreIds !== undefined) {
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
      }

      // Update cast if provided
      if (data.castIds !== undefined) {
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
      }

      logger.info(`Updated movie: ${updatedVideo.titleEn} (${id})`);

      return await this.getMovieById(id);
    } catch (error: any) {
      logger.error('Failed to update movie:', error);
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
      const jobId = await queueService.addTranscodeJob({
        videoId,
        inputPath: rawVideoKey,
        outputPath: `videos/${videoId}/hls`,
        qualities: qualities || ['480p', '720p', '1080p'],
      });

      logger.info(`Started transcoding for video ${videoId}, job ID: ${jobId}`);

      return {
        jobId,
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
      // This would typically require storing jobId in database
      // For now, we'll return a mock status
      // In production, you'd store the jobId when starting transcoding
      
      logger.info(`Checking transcoding status for video ${videoId}`);

      // Check if movie source already exists (transcoding completed)
      const movieSource = await prisma.movieSource.findUnique({
        where: { videoId },
      });

      if (movieSource && movieSource.isPublished) {
        return {
          status: 'completed',
          progress: 100,
          message: 'Transcoding completed successfully',
          hlsManifestKey: movieSource.hlsManifestKey,
        };
      }

      // If no movie source, check if transcoding is in progress
      // In a real implementation, you'd query the job queue
      return {
        status: 'processing',
        progress: 45,
        message: 'Transcoding in progress...',
      };
    } catch (error: any) {
      logger.error('Failed to get transcoding status:', error);
      throw new AppError('Failed to get transcoding status', 500);
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
        data: videos,
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

  private async getMovieById(id: string) {
    return await prisma.video.findUnique({
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
