import prisma from '../../infra/db';
import { AppError } from '../../middlewares/errorHandler';
import config from '../../config';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user;
  }

  async getWatchHistory(userId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    
    const [watchHistory, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId },
        include: {
          video: {
            select: {
              id: true,
              slug: true,
              titleVi: true,
              titleEn: true,
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
        where: { userId },
      }),
    ]);

    return {
      data: watchHistory,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFavorites(userId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
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
              backdropUrl: true,
              type: true,
              year: true,
              ageRating: true,
              durationMinutes: true,
              viewsCount: true,
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favorite.count({
        where: { userId },
      }),
    ]);

    return {
      data: favorites.map(fav => fav.video),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleFavorite(userId: string, videoId: string): Promise<{ added: boolean }> {
    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favorite.delete({
        where: {
          userId_videoId: {
            userId,
            videoId,
          },
        },
      });
      return { added: false };
    } else {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId,
          videoId,
        },
      });
      return { added: true };
    }
  }

  async getRatings(userId: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    
    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { userId },
        include: {
          video: {
            select: {
              id: true,
              slug: true,
              titleVi: true,
              titleEn: true,
              posterUrl: true,
              type: true,
              year: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rating.count({
        where: { userId },
      }),
    ]);

    return {
      data: ratings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
