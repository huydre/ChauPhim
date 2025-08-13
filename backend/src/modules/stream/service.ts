import prisma from '../../infra/db';
import storageService from '../../infra/storage';
import { AppError } from '../../middlewares/errorHandler';
import logger from '../../config/logger';

export class StreamService {
  async getMovieStreamUrl(videoId: string, userId: string) {
    // Verify user has access to the video
    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        isPublished: true,
      },
      include: {
        movieSources: {
          where: { isPublished: true },
          select: {
            hlsManifestKey: true,
            trailerHlsManifestKey: true,
            subtitlesJson: true,
          },
        },
      },
    });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    if (video.type !== 'MOVIE') {
      throw new AppError('This endpoint is for movies only', 400);
    }

    const movieSource = video.movieSources[0];
    if (!movieSource || !movieSource.hlsManifestKey) {
      throw new AppError('Video stream not available', 404);
    }

    // Check user subscription/permissions (simplified for demo)
    const canAccess = await this.checkUserAccess(userId, video.id);
    if (!canAccess) {
      throw new AppError('Access denied. Premium subscription required', 403);
    }

    // Generate presigned URL (expires in 15 minutes)
    const streamUrl = await storageService.getPresignedUrl(movieSource.hlsManifestKey, 900);
    
    // Record watch history
    await this.recordWatchHistory(userId, video.id);

    logger.info(`Movie stream access granted`, { userId, videoId, title: video.titleEn });

    return {
      streamUrl,
      subtitles: movieSource.subtitlesJson || [],
      expiresAt: new Date(Date.now() + 900 * 1000).toISOString(),
    };
  }

  async getEpisodeStreamUrl(episodeId: string, userId: string) {
    // Verify user has access to the episode
    const episode = await prisma.episode.findUnique({
      where: { 
        id: episodeId,
        isPublished: true,
      },
      include: {
        season: {
          include: {
            video: {
              select: {
                id: true,
                titleEn: true,
                titleVi: true,
                isPublished: true,
              },
            },
          },
        },
      },
    });

    if (!episode || !episode.season.video.isPublished) {
      throw new AppError('Episode not found', 404);
    }

    if (!episode.hlsManifestKey) {
      throw new AppError('Episode stream not available', 404);
    }

    // Check user subscription/permissions
    const canAccess = await this.checkUserAccess(userId, episode.season.video.id);
    if (!canAccess) {
      throw new AppError('Access denied. Premium subscription required', 403);
    }

    // Generate presigned URL (expires in 15 minutes)
    const streamUrl = await storageService.getPresignedUrl(episode.hlsManifestKey, 900);
    
    // Record watch history
    await this.recordWatchHistory(userId, episode.season.video.id, episode.id);

    logger.info(`Episode stream access granted`, { 
      userId, 
      videoId: episode.season.video.id,
      episodeId,
      title: episode.season.video.titleEn 
    });

    return {
      streamUrl,
      subtitles: episode.subtitlesJson || [],
      expiresAt: new Date(Date.now() + 900 * 1000).toISOString(),
    };
  }

  async getSubtitleUrl(key: string) {
    try {
      // Generate presigned URL for subtitle file (expires in 1 hour)
      const subtitleUrl = await storageService.getPresignedUrl(key, 3600);
      
      return {
        subtitleUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error) {
      throw new AppError('Subtitle not found', 404);
    }
  }

  private async checkUserAccess(userId: string, videoId: string): Promise<boolean> {
    // Get user subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endAt: { gt: new Date() },
          },
          orderBy: { endAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return false;
    }

    // For demo purposes, allow all users access
    // In production, you would check subscription tiers, user roles, etc.
    return true;

    // Example premium access check:
    // const hasActiveSubscription = user.subscriptions.length > 0;
    // const isPremiumUser = user.subscriptions.some(sub => sub.plan === 'PREMIUM');
    // return hasActiveSubscription && isPremiumUser;
  }

  private async recordWatchHistory(userId: string, videoId: string, episodeId?: string) {
    try {
      // Check if watch history already exists
      const existingHistory = await prisma.watchHistory.findFirst({
        where: {
          userId,
          videoId,
          ...(episodeId && { episodeId }),
        },
      });

      if (existingHistory) {
        // Update last watched time
        await prisma.watchHistory.update({
          where: { id: existingHistory.id },
          data: { lastWatchedAt: new Date() },
        });
      } else {
        // Create new watch history entry
        await prisma.watchHistory.create({
          data: {
            userId,
            videoId,
            episodeId,
            progressSeconds: 0,
            lastWatchedAt: new Date(),
          },
        });
      }
    } catch (error) {
      // Don't fail the stream request if watch history fails
      logger.error('Failed to record watch history:', error);
    }
  }
}
