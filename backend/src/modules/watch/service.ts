import prisma from '../../infra/db';
import { AppError } from '../../middlewares/errorHandler';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class WatchService {
  async updateProgress(
    userId: string,
    videoId: string,
    progressSeconds: number,
    completed: boolean,
    episodeId?: string
  ) {
    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId, isPublished: true },
    });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // If episodeId is provided, verify it exists
    if (episodeId) {
      const episode = await prisma.episode.findUnique({
        where: { id: episodeId, isPublished: true },
      });

      if (!episode) {
        throw new AppError('Episode not found', 404);
      }
    }

    // Check if watch history already exists
    const existingHistory = await prisma.watchHistory.findFirst({
      where: {
        userId,
        videoId,
        episodeId: episodeId || null,
      },
    });

    if (existingHistory) {
      // Update existing history
      await prisma.watchHistory.update({
        where: { id: existingHistory.id },
        data: {
          progressSeconds,
          completed,
          lastWatchedAt: new Date(),
        },
      });
    } else {
      // Create new history entry
      await prisma.watchHistory.create({
        data: {
          userId,
          videoId,
          episodeId,
          progressSeconds,
          completed,
          lastWatchedAt: new Date(),
        },
      });
    }
  }

  async getContinueWatching(userId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    
    // Get watch history that is not completed and has some progress
    const [watchHistory, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: {
          userId,
          completed: false,
          progressSeconds: { gt: 0 },
        },
        include: {
          video: {
            select: {
              id: true,
              slug: true,
              titleVi: true,
              titleEn: true,
              descriptionVi: true,
              descriptionEn: true,
              posterUrl: true,
              type: true,
              year: true,
              durationMinutes: true,
            },
          },
          episode: {
            select: {
              id: true,
              episodeNumber: true,
              titleVi: true,
              titleEn: true,
              runtimeMinutes: true,
              season: {
                select: {
                  seasonNumber: true,
                },
              },
            },
          },
        },
        orderBy: { lastWatchedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.watchHistory.count({
        where: {
          userId,
          completed: false,
          progressSeconds: { gt: 0 },
        },
      }),
    ]);

    // Calculate watch progress percentage
    const watchHistoryWithProgress = watchHistory.map((history) => {
      let totalDuration = 0;
      
      if (history.episode) {
        totalDuration = history.episode.runtimeMinutes * 60; // Convert to seconds
      } else if (history.video.durationMinutes) {
        totalDuration = history.video.durationMinutes * 60; // Convert to seconds
      }

      const progressPercentage = totalDuration > 0 
        ? Math.round((history.progressSeconds / totalDuration) * 100)
        : 0;

      return {
        ...history,
        progressPercentage,
      };
    });

    return {
      data: watchHistoryWithProgress,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
