import prisma from '../../infra/db';
import cacheService from '../../infra/cache';
import config from '../../config';

export class GenreService {
  async getGenres() {
    const cacheKey = 'genres:all';
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const genres = await prisma.genre.findMany({
      orderBy: { nameEn: 'asc' },
    });

    // Cache the result
    await cacheService.set(cacheKey, genres, config.CACHE_TTL_LONG);

    return genres;
  }
}
