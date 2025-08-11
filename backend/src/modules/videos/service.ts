import prisma from '../../infra/db';
import cacheService from '../../infra/cache';
import { AppError } from '../../middlewares/errorHandler';
import { VideoType } from '@prisma/client';
import config from '../../config';

export interface VideoFilters {
  search?: string;
  type?: VideoType;
  genre?: string;
  year?: number;
  sort: 'popular' | 'new' | 'rating' | 'title';
  page: number;
  limit: number;
  userId?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class VideoService {
  async getVideos(filters: VideoFilters): Promise<PaginatedResult<any>> {
    const { search, type, genre, year, sort, page, limit, userId } = filters;
    const skip = (page - 1) * limit;

    // Build cache key
    const cacheKey = `videos:${JSON.stringify({ search, type, genre, year, sort, page, limit })}`;
    
    // Try to get from cache first
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached && !userId) {
      return cached;
    }

    // Build where clause
    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { titleVi: { contains: search } },
        { titleEn: { contains: search } },
        { descriptionVi: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (genre) {
      where.genres = {
        some: {
          genre: {
            slug: genre,
          },
        },
      };
    }

    if (year) {
      where.year = year;
    }

    // Build order by clause
    let orderBy: any;
    switch (sort) {
      case 'popular':
        orderBy = { viewsCount: 'desc' };
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        // This is a complex query, for simplicity we'll order by views
        orderBy = { viewsCount: 'desc' };
        break;
      case 'title':
        orderBy = { titleEn: 'asc' };
        break;
      default:
        orderBy = { viewsCount: 'desc' };
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
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
          ...(userId && {
            favorites: {
              where: { userId },
              select: { userId: true },
            },
          }),
          _count: {
            select: {
              ratings: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    // Calculate average ratings for each video
    const videosWithRatings = await Promise.all(
      videos.map(async (video) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: video.id },
          _avg: { score: true },
        });

        return {
          ...video,
          averageRating: avgRatingResult._avg.score || 0,
          isFavorited: userId ? video.favorites.length > 0 : false,
          favorites: undefined, // Remove from response
        };
      })
    );

    const result = {
      data: videosWithRatings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result if no user-specific data
    if (!userId) {
      await cacheService.set(cacheKey, result, config.CACHE_TTL_MEDIUM);
    }

    return result;
  }

  async getVideoBySlug(slug: string, userId?: string) {
    const cacheKey = `video:${slug}`;
    
    // Try cache first (without user-specific data)
    if (!userId) {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const video = await prisma.video.findUnique({
      where: { slug, isPublished: true },
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
        seasons: {
          where: { episodes: { some: { isPublished: true } } },
          include: {
            episodes: {
              where: { isPublished: true },
              orderBy: { episodeNumber: 'asc' },
              select: {
                id: true,
                episodeNumber: true,
                titleVi: true,
                titleEn: true,
                synopsisVi: true,
                synopsisEn: true,
                runtimeMinutes: true,
              },
            },
          },
          orderBy: { seasonNumber: 'asc' },
        },
        movieSources: {
          where: { isPublished: true },
          select: {
            id: true,
            hlsManifestKey: true,
            trailerHlsManifestKey: true,
            subtitlesJson: true,
          },
        },
        ...(userId && {
          favorites: {
            where: { userId },
            select: { userId: true },
          },
          ratings: {
            where: { userId },
            select: { id: true, score: true, reviewText: true },
          },
        }),
        _count: {
          select: {
            ratings: true,
            comments: true,
          },
        },
      },
    });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    // Get average rating
    const avgRatingResult = await prisma.rating.aggregate({
      where: { videoId: video.id },
      _avg: { score: true },
    });

    // Increment view count asynchronously
    this.incrementViewCount(video.id);

    const result = {
      ...video,
      averageRating: avgRatingResult._avg.score || 0,
      isFavorited: userId ? video.favorites.length > 0 : false,
      userRating: userId && video.ratings.length > 0 ? video.ratings[0] : null,
      favorites: undefined, // Remove from response
      ratings: undefined, // Remove from response
    };

    // Cache the result if no user-specific data
    if (!userId) {
      await cacheService.set(cacheKey, result, config.CACHE_TTL_LONG);
    }

    return result;
  }

  async getRecommendations(slug: string, limit: number) {
    const cacheKey = `recommendations:${slug}:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const video = await prisma.video.findUnique({
      where: { slug },
      include: {
        genres: {
          select: { genreId: true },
        },
      },
    });

    if (!video) {
      throw new AppError('Video not found', 404);
    }

    const genreIds = video.genres.map((g) => g.genreId);

    // Get recommendations based on shared genres
    const recommendations = await prisma.video.findMany({
      where: {
        id: { not: video.id },
        isPublished: true,
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
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
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      orderBy: { viewsCount: 'desc' },
      take: limit,
    });

    // Calculate average ratings
    const recommendationsWithRatings = await Promise.all(
      recommendations.map(async (video) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: video.id },
          _avg: { score: true },
        });

        return {
          ...video,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    // Cache the result
    await cacheService.set(cacheKey, recommendationsWithRatings, config.CACHE_TTL_LONG);

    return recommendationsWithRatings;
  }

  private async incrementViewCount(videoId: string) {
    try {
      // Use Redis to increment view count (write-behind pattern)
      const key = `views:${videoId}`;
      await cacheService.increment(key);
      
      // Periodically flush to database (this could be done by a separate job)
      // For now, we'll update directly but in production you'd want a job
      await prisma.video.update({
        where: { id: videoId },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      // Don't fail the request if view count fails
      console.error('Failed to increment view count:', error);
    }
  }
}
