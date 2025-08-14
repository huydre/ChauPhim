import prisma from '../../infra/db';
import cacheService from '../../infra/cache';
import { AppError } from '../../middlewares/errorHandler';
import { VideoType, Prisma } from '@prisma/client';
import config from '../../config';

export interface MovieFilters {
  search?: string;
  genre?: string;
  year?: number;
  country?: string;
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

export interface CommentFilters {
  page: number;
  limit: number;
  sort: 'newest' | 'oldest' | 'popular';
}

export interface SearchFilters {
  page: number;
  limit: number;
}

export class MovieService {
  async getMovies(filters: MovieFilters): Promise<PaginatedResult<any>> {
    const { search, genre, year, country, sort, page, limit, userId } = filters;
    const skip = (page - 1) * limit;

    // Build cache key
    const cacheKey = `movies:${JSON.stringify({ search, genre, year, country, sort, page, limit })}`;
    
    // Try to get from cache first
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached && !userId) {
      return cached;
    }

    // Build where clause
    const where: any = {
      isPublished: true,
      type: VideoType.MOVIE,
    };

    if (search) {
      where.OR = [
        { titleVi: { contains: search } },
        { titleEn: { contains: search } },
        { originalTitle: { contains: search } },
        { descriptionVi: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
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

    if (country) {
      where.originCountry = {
        path: '$',
        array_contains: country,
      };
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
        orderBy = { imdbRating: 'desc' };
        break;
      case 'title':
        orderBy = { titleEn: 'asc' };
        break;
      default:
        orderBy = { viewsCount: 'desc' };
    }

    const [movies, total] = await Promise.all([
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
          casts: {
            take: 5, // Limit cast members for list view
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
          ...(userId && {
            favorites: {
              where: { userId },
              select: { userId: true },
            },
          }),
          _count: {
            select: {
              ratings: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    // Calculate average ratings for each movie
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
          isFavorited: userId ? movie.favorites.length > 0 : false,
          favorites: undefined, // Remove from response
        };
      })
    );

    const result = {
      data: moviesWithRatings,
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

  async getMovieBySlug(slug: string, userId?: string) {
    const cacheKey = `movie:${slug}`;
    
    // Try cache first (without user-specific data)
    if (!userId) {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const movie = await prisma.video.findUnique({
      where: { 
        slug, 
        isPublished: true,
        type: VideoType.MOVIE,
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
            favorites: true,
          },
        },
      },
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Get average rating
    const avgRatingResult = await prisma.rating.aggregate({
      where: { videoId: movie.id },
      _avg: { score: true },
    });

    // Increment view count asynchronously
    this.incrementViewCount(movie.id);

    const result = {
      ...movie,
      averageRating: avgRatingResult._avg.score || 0,
      isFavorited: userId ? movie.favorites.length > 0 : false,
      userRating: userId && movie.ratings.length > 0 ? movie.ratings[0] : null,
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
    const cacheKey = `movie-recommendations:${slug}:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const movie = await prisma.video.findUnique({
      where: { slug, type: VideoType.MOVIE },
      include: {
        genres: {
          select: { genreId: true },
        },
      },
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const genreIds = movie.genres.map((g) => g.genreId);

    // Get recommendations based on shared genres
    const recommendations = await prisma.video.findMany({
      where: {
        id: { not: movie.id },
        isPublished: true,
        type: VideoType.MOVIE,
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
      recommendations.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    // Cache the result
    await cacheService.set(cacheKey, recommendationsWithRatings, config.CACHE_TTL_LONG);

    return recommendationsWithRatings;
  }

  async getTrendingMovies(limit: number, period: string = 'week') {
    const cacheKey = `trending-movies:${period}:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const trending = await prisma.video.findMany({
      where: {
        isPublished: true,
        type: VideoType.MOVIE,
        createdAt: {
          gte: startDate,
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
      orderBy: [
        { viewsCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Calculate average ratings
    const trendingWithRatings = await Promise.all(
      trending.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    // Cache the result
    await cacheService.set(cacheKey, trendingWithRatings, config.CACHE_TTL_MEDIUM);

    return trendingWithRatings;
  }

  async getTopRatedMovies(limit: number) {
    const cacheKey = `top-rated-movies:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get movies with highest average ratings
    const topRated = await prisma.$queryRaw`
      SELECT v.*, AVG(r.score) as avg_rating, COUNT(r.id) as rating_count
      FROM videos v
      LEFT JOIN ratings r ON v.id = r.video_id
      WHERE v.is_published = true AND v.type = 'MOVIE'
      GROUP BY v.id
      HAVING rating_count >= 10
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT ${limit}
    `;

    // Get full movie data with relations
    const movieIds = (topRated as any[]).map(movie => movie.id);
    
    const movies = await prisma.video.findMany({
      where: {
        id: { in: movieIds },
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
    });

    // Merge with ratings and maintain order
    const result = movieIds.map(id => {
      const movie = movies.find(m => m.id === id);
      const ratingData = (topRated as any[]).find(r => r.id === id);
      
      return {
        ...movie,
        averageRating: parseFloat(ratingData.avg_rating) || 0,
      };
    });

    // Cache the result
    await cacheService.set(cacheKey, result, config.CACHE_TTL_LONG);

    return result;
  }

  async getRecentMovies(limit: number) {
    const cacheKey = `recent-movies:${limit}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const recent = await prisma.video.findMany({
      where: {
        isPublished: true,
        type: VideoType.MOVIE,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate average ratings
    const recentWithRatings = await Promise.all(
      recent.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    // Cache the result
    await cacheService.set(cacheKey, recentWithRatings, config.CACHE_TTL_MEDIUM);

    return recentWithRatings;
  }

  async getMoviesByGenre(genreSlug: string, filters: { page: number; limit: number; sort: string }) {
    const { page, limit, sort } = filters;
    const skip = (page - 1) * limit;

    const cacheKey = `movies-by-genre:${genreSlug}:${JSON.stringify(filters)}`;
    
    // Try cache first
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
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
        orderBy = { imdbRating: 'desc' };
        break;
      case 'title':
        orderBy = { titleEn: 'asc' };
        break;
      default:
        orderBy = { viewsCount: 'desc' };
    }

    const where = {
      isPublished: true,
      type: VideoType.MOVIE,
      genres: {
        some: {
          genre: {
            slug: genreSlug,
          },
        },
      },
    };

    const [movies, total] = await Promise.all([
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

    // Calculate average ratings
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    const result = {
      data: moviesWithRatings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await cacheService.set(cacheKey, result, 3600); // 1 hour TTL

    return result;
  }

  async getMoviesByCountry(countrySlug: string, filters: { page: number; limit: number; sort: string }) {
    const { page, limit, sort } = filters;
    const skip = (page - 1) * limit;

    console.log(`=== getMoviesByCountry called with countrySlug: ${countrySlug} ===`);

    const cacheKey = `movies-by-country:${countrySlug}:${JSON.stringify(filters)}`;
    
    // Skip cache for debugging
    console.log('Skipping cache for debugging');
    
    // Try cache first
    // const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    // if (cached) {
    //   console.log('Returning cached result');
    //   return cached;
    // }

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
        orderBy = { imdbRating: 'desc' };
        break;
      case 'title':
        orderBy = { titleEn: 'asc' };
        break;
      default:
        orderBy = { viewsCount: 'desc' };
    }

    // Map country slugs to originCountry values
    const countryMapping: { [key: string]: string } = {
      'han-quoc': 'Hàn Quốc',
      'trung-quoc': 'Trung Quốc', 
      'my': 'Mỹ',
      'nhat-ban': 'Nhật Bản',
      'thai-lan': 'Thái Lan',
      'an-do': 'Ấn Độ',
      'hong-kong': 'Hồng Kông',
      'dai-loan': 'Đài Loan',
      'phap': 'Pháp',
      'anh': 'Anh',
      'duc': 'Đức',
      'canada': 'Canada',
      'uc': 'Úc',
    };

    const countryName = countryMapping[countrySlug] || countrySlug;
    console.log(`Mapped ${countrySlug} to ${countryName}`);

    // Determine order by clause for raw SQL
    let orderBySQL = 'v.views_count DESC';
    switch (sort) {
      case 'popular':
        orderBySQL = 'v.views_count DESC';
        break;
      case 'new':
        orderBySQL = 'v.created_at DESC';
        break;
      case 'rating':
        orderBySQL = 'v.imdb_rating DESC';
        break;
      case 'title':
        orderBySQL = 'v.title_en ASC';
        break;
      default:
        orderBySQL = 'v.views_count DESC';
    }

    // Use raw SQL for JSON search since Prisma doesn't support JSON array contains directly
    console.log(`Searching for country: ${countryName}, pattern: %"${countryName}"%`);
    
    // Debug: First check all movies
    const allMovies = await prisma.$queryRaw<any[]>`
      SELECT id, title_vi, origin_country
      FROM videos v  
      WHERE v.is_published = true AND v.type = 'MOVIE'
    `;
    console.log('All published movies:', allMovies);
    
    const movies = await prisma.$queryRaw<any[]>`
      SELECT v.*, 
             (SELECT COUNT(*) FROM ratings r WHERE r.video_id = v.id) as rating_count
      FROM videos v
      WHERE v.is_published = true 
        AND v.type = 'MOVIE'
        AND v.origin_country LIKE ${`%"${countryName}"%`}
      ORDER BY ${Prisma.raw(orderBySQL)}
      LIMIT ${limit} OFFSET ${skip}
    `;

    console.log(`Found ${movies.length} movies for pattern %"${countryName}"%`);

    const totalResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM videos v
      WHERE v.is_published = true 
        AND v.type = 'MOVIE'
        AND v.origin_country LIKE ${`%"${countryName}"%`}
    `;

    const total = Number(totalResult[0].count);

    // Calculate average ratings
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    const result = {
      data: moviesWithRatings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await cacheService.set(cacheKey, result, 3600); // 1 hour TTL
    await cacheService.set(cacheKey, result, config.CACHE_TTL_MEDIUM);

    return result;
  }

  async getMovieCast(slug: string) {
    const cacheKey = `movie-cast:${slug}`;
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const movie = await prisma.video.findUnique({
      where: { 
        slug,
        type: VideoType.MOVIE,
        isPublished: true,
      },
      include: {
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
      },
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const cast = movie.casts.map(castMember => ({
      id: castMember.cast.id,
      name: castMember.cast.name,
      avatarUrl: castMember.cast.avatarUrl,
      character: castMember.roleName,
    }));

    // Cache the result
    await cacheService.set(cacheKey, cast, config.CACHE_TTL_LONG);

    return cast;
  }

  async getMovieComments(slug: string, filters: CommentFilters): Promise<PaginatedResult<any>> {
    const { page, limit, sort } = filters;
    const skip = (page - 1) * limit;

    const movie = await prisma.video.findUnique({
      where: { 
        slug,
        type: VideoType.MOVIE,
        isPublished: true,
      },
      select: { id: true },
    });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Build order by clause
    let orderBy: any;
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'popular':
        // For now, order by creation date. Later you can add likes count
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const where = {
      videoId: movie.id,
      parentId: null, // Only get top-level comments
      isDeleted: false,
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          replies: {
            where: { isDeleted: false },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 3, // Limit replies for performance
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchMovies(query: string, filters: SearchFilters): Promise<PaginatedResult<any>> {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const cacheKey = `search-movies:${query}:${JSON.stringify(filters)}`;
    
    // Try cache first
    const cached = await cacheService.get<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = {
      isPublished: true,
      type: VideoType.MOVIE,
      OR: [
        { titleVi: { contains: query } },
        { titleEn: { contains: query } },
        { originalTitle: { contains: query } },
        { descriptionVi: { contains: query } },
        { descriptionEn: { contains: query } },
      ],
    };

    const [movies, total] = await Promise.all([
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
          _count: {
            select: {
              ratings: true,
            },
          },
        },
        orderBy: [
          { viewsCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    // Calculate average ratings
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        const avgRatingResult = await prisma.rating.aggregate({
          where: { videoId: movie.id },
          _avg: { score: true },
        });

        return {
          ...movie,
          averageRating: avgRatingResult._avg.score || 0,
        };
      })
    );

    const result = {
      data: moviesWithRatings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await cacheService.set(cacheKey, result, config.CACHE_TTL_SHORT);

    return result;
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
