import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { MovieService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class MovieController {
  private movieService: MovieService;

  constructor() {
    this.movieService = new MovieService();
  }

  // Get movies with filters and pagination
  getMovies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      q,
      genre,
      year,
      country,
      sort = 'popular',
      page = 1,
      limit = 24,
    } = req.query as any;

    const result = await this.movieService.getMovies({
      search: q,
      genre,
      year: year ? parseInt(year) : undefined,
      country,
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  // Get movie detail by slug
  getMovieBySlug = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { slug } = req.params;
    
    const movie = await this.movieService.getMovieBySlug(slug!, req.user?.id);
    
    return res.json({
      success: true,
      data: movie,
    });
  });

  // Get movie recommendations
  getMovieRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const recommendations = await this.movieService.getRecommendations(slug!, limit);
    
    return res.json({
      success: true,
      data: recommendations,
    });
  });

  // Get trending movies
  getTrendingMovies = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = (req.query.period as string) || 'week'; // day, week, month
    
    const trending = await this.movieService.getTrendingMovies(limit, period);
    
    return res.json({
      success: true,
      data: trending,
    });
  });

  // Get top rated movies
  getTopRatedMovies = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const topRated = await this.movieService.getTopRatedMovies(limit);
    
    return res.json({
      success: true,
      data: topRated,
    });
  });

  // Get recently added movies
  getRecentMovies = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const recent = await this.movieService.getRecentMovies(limit);
    
    return res.json({
      success: true,
      data: recent,
    });
  });

  // Get movie by genres
  getMoviesByGenre = asyncHandler(async (req: Request, res: Response) => {
    const { genre } = req.params;
    const {
      page = 1,
      limit = 24,
      sort = 'popular',
    } = req.query as any;

    const result = await this.movieService.getMoviesByGenre(genre!, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  // Get movies by country
  getMoviesByCountry = asyncHandler(async (req: Request, res: Response) => {
    const { country } = req.params;
    const {
      page = 1,
      limit = 24,
      sort = 'popular',
    } = req.query as any;

    const result = await this.movieService.getMoviesByCountry(country!, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  // Get movie cast details
  getMovieCast = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    
    const cast = await this.movieService.getMovieCast(slug!);
    
    return res.json({
      success: true,
      data: cast,
    });
  });

  // Get movie comments with pagination
  getMovieComments = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 20,
      sort = 'newest',
    } = req.query as any;

    const result = await this.movieService.getMovieComments(slug!, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  // Search movies
  searchMovies = asyncHandler(async (req: Request, res: Response) => {
    const {
      q,
      page = 1,
      limit = 24,
    } = req.query as any;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const result = await this.movieService.searchMovies(q, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });
}
