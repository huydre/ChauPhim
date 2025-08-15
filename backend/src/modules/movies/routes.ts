import { Router } from 'express';
import { z } from 'zod';
import { MovieController } from './controller';
import { optionalAuth } from '../../middlewares/auth';
import { 
  validateRequest, 
  movieSearchQuerySchema, 
  slugParamSchema, 
  trendingQuerySchema,
  topRatedQuerySchema,
  commentsQuerySchema,
  genreParamSchema,
  paginationSchema
} from '../../middlewares/validation';

const router = Router();
const movieController = new MovieController();

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get movies with filtering and pagination
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Genre filter (slug)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year filter
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country filter
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popular, new, rating, title]
 *           default: popular
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 24
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 */
router.get('/', 
  optionalAuth,
  validateRequest({ query: movieSearchQuerySchema }),
  movieController.getMovies
);

/**
 * @swagger
 * /movies/trending:
 *   get:
 *     summary: Get trending movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Trending period
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of movies to return
 *     responses:
 *       200:
 *         description: Trending movies retrieved successfully
 */
router.get('/trending', 
  validateRequest({ query: trendingQuerySchema }),
  movieController.getTrendingMovies
);

/**
 * @swagger
 * /movies/top-rated:
 *   get:
 *     summary: Get top rated movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of movies to return
 *     responses:
 *       200:
 *         description: Top rated movies retrieved successfully
 */
router.get('/top-rated', 
  validateRequest({ query: topRatedQuerySchema }),
  movieController.getTopRatedMovies
);

/**
 * @swagger
 * /movies/recent:
 *   get:
 *     summary: Get recently added movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of movies to return
 *     responses:
 *       200:
 *         description: Recent movies retrieved successfully
 */
router.get('/recent', 
  validateRequest({ query: topRatedQuerySchema }),
  movieController.getRecentMovies
);

/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Search movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 24
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', 
  validateRequest({ query: paginationSchema.extend({ q: z.string().min(1) }) }),
  movieController.searchMovies
);

/**
 * @swagger
 * /movies/genre/{genre}:
 *   get:
 *     summary: Get movies by genre
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: genre
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 24
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popular, new, rating, title]
 *           default: popular
 *     responses:
 *       200:
 *         description: Movies by genre retrieved successfully
 */
router.get('/genre/:genre', 
  validateRequest({ 
    params: genreParamSchema,
    query: movieSearchQuerySchema
  }),
  movieController.getMoviesByGenre
);

/**
 * @swagger
 * /movies/country/{country}:
 *   get:
 *     summary: Get movies by country
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country slug (e.g., han-quoc, trung-quoc, my)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 24
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [popular, new, rating, title]
 *           default: popular
 *     responses:
 *       200:
 *         description: Movies by country retrieved successfully
 */
router.get('/country/:country', 
  validateRequest({ 
    params: z.object({ country: z.string() }),
    query: movieSearchQuerySchema
  }),
  movieController.getMoviesByCountry
);

/**
 * @swagger
 * /movies/{slug}:
 *   get:
 *     summary: Get movie by slug
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie slug
 *     responses:
 *       200:
 *         description: Movie retrieved successfully
 *       404:
 *         description: Movie not found
 */
router.get('/:slug', 
  optionalAuth,
  validateRequest({ params: slugParamSchema }),
  movieController.getMovieBySlug
);

/**
 * @swagger
 * /movies/{slug}/recommendations:
 *   get:
 *     summary: Get movie recommendations
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie slug
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
 */
router.get('/:slug/recommendations', 
  validateRequest({ params: slugParamSchema }),
  movieController.getMovieRecommendations
);

/**
 * @swagger
 * /movies/{slug}/cast:
 *   get:
 *     summary: Get movie cast
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie slug
 *     responses:
 *       200:
 *         description: Movie cast retrieved successfully
 */
router.get('/:slug/cast', 
  validateRequest({ params: slugParamSchema }),
  movieController.getMovieCast
);

/**
 * @swagger
 * /movies/{slug}/comments:
 *   get:
 *     summary: Get movie comments
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie slug
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, popular]
 *           default: newest
 *     responses:
 *       200:
 *         description: Movie comments retrieved successfully
 */
router.get('/:slug/comments', 
  validateRequest({ 
    params: slugParamSchema,
    query: commentsQuerySchema
  }),
  movieController.getMovieComments
);

export default router;
