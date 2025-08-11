import { Router } from 'express';
import { WatchController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest, progressSchema, paginationSchema } from '../../middlewares/validation';

const router = Router();
const watchController = new WatchController();

// All watch routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /watch/progress:
 *   post:
 *     summary: Update watch progress
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *               - progressSeconds
 *             properties:
 *               videoId:
 *                 type: string
 *                 format: uuid
 *               episodeId:
 *                 type: string
 *                 format: uuid
 *               progressSeconds:
 *                 type: number
 *                 minimum: 0
 *               completed:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.post('/progress', 
  validateRequest({ body: progressSchema }),
  watchController.updateProgress
);

/**
 * @swagger
 * /watch/continue:
 *   get:
 *     summary: Get continue watching list
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Continue watching list retrieved successfully
 */
router.get('/continue', 
  validateRequest({ query: paginationSchema }),
  watchController.getContinueWatching
);

export default router;
