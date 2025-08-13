import prisma from '../../infra/db';
import cacheService from '../../infra/cache';
import config from '../../config';

export interface CreateGenreRequest {
  nameVi: string;
  nameEn: string;
  slug?: string;
}

export interface UpdateGenreRequest {
  nameVi?: string;
  nameEn?: string;
  slug?: string;
}

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

  async getGenreById(id: string) {
    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        videoGenres: {
          include: {
            video: {
              select: {
                id: true,
                slug: true,
                titleVi: true,
                titleEn: true,
                posterUrl: true,
                year: true,
                isPublished: true,
              }
            }
          }
        },
        _count: {
          select: {
            videoGenres: true
          }
        }
      }
    });

    if (!genre) {
      throw new Error('Genre not found');
    }

    return {
      ...genre,
      videoCount: genre._count.videoGenres,
      videos: genre.videoGenres.map(vg => vg.video)
    };
  }

  async createGenre(data: CreateGenreRequest) {
    // Generate slug if not provided
    const slug = data.slug || this.generateSlug(data.nameEn || data.nameVi);

    // Check if slug already exists
    const existingGenre = await prisma.genre.findUnique({
      where: { slug }
    });

    if (existingGenre) {
      throw new Error('Slug already exists');
    }

    const genre = await prisma.genre.create({
      data: {
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        slug,
      }
    });

    // Clear cache
    await this.clearCache();

    return genre;
  }

  async updateGenre(id: string, data: UpdateGenreRequest) {
    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: { id }
    });

    if (!existingGenre) {
      throw new Error('Genre not found');
    }

    // Check slug uniqueness if provided
    if (data.slug && data.slug !== existingGenre.slug) {
      const slugExists = await prisma.genre.findUnique({
        where: { slug: data.slug }
      });

      if (slugExists) {
        throw new Error('Slug already exists');
      }
    }

    const updatedGenre = await prisma.genre.update({
      where: { id },
      data: {
        ...(data.nameVi && { nameVi: data.nameVi }),
        ...(data.nameEn && { nameEn: data.nameEn }),
        ...(data.slug && { slug: data.slug }),
      }
    });

    // Clear cache
    await this.clearCache();

    return updatedGenre;
  }

  async deleteGenre(id: string) {
    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videoGenres: true
          }
        }
      }
    });

    if (!existingGenre) {
      throw new Error('Genre not found');
    }

    // Check if genre is being used by videos
    if (existingGenre._count.videoGenres > 0) {
      throw new Error('Cannot delete genre that is being used by videos');
    }

    await prisma.genre.delete({
      where: { id }
    });

    // Clear cache
    await this.clearCache();

    return { message: 'Genre deleted successfully' };
  }

  async getGenresWithStats() {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: {
            videoGenres: true
          }
        }
      },
      orderBy: { nameEn: 'asc' }
    });

    return genres.map(genre => ({
      ...genre,
      videoCount: genre._count.videoGenres
    }));
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  private async clearCache() {
    await cacheService.del('genres:all');
  }
}
