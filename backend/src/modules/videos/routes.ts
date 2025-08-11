import { Router } from 'express';
import { VideoController } from './controller';
import { optionalAuth } from '../../middlewares/auth';
import { validateRequest, searchQuerySchema, idParamSchema, slugParamSchema } from '../../middlewares/validation';

const router = Router();
const videoController = new VideoController();

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get videos with filtering and pagination
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MOVIE, SERIES]
 *         description: Video type filter
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
 *         description: Videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', 
  optionalAuth,
  validateRequest({ query: searchQuerySchema }),
  videoController.getVideos
);

/**
 * @swagger
 * /videos/{slug}:
 *   get:
 *     summary: Get video by slug
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Video slug
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */
router.get('/:slug', 
  optionalAuth,
  validateRequest({ params: slugParamSchema }),
  videoController.getVideoBySlug
);

/**
 * @swagger
 * /videos/{slug}/recommendations:
 *   get:
 *     summary: Get video recommendations
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Video slug
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
  videoController.getRecommendations
);

export default router;
