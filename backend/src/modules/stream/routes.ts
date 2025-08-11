import { Router } from 'express';
import { StreamController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest, idParamSchema } from '../../middlewares/validation';

const router = Router();
const streamController = new StreamController();

// All streaming routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /stream/{videoId}:
 *   get:
 *     summary: Get streaming URL for a movie
 *     tags: [Stream]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Streaming URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     streamUrl:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Video not found
 *       403:
 *         description: Access denied
 */
router.get('/:videoId', 
  validateRequest({ params: idParamSchema }),
  streamController.getMovieStream
);

/**
 * @swagger
 * /stream/episode/{episodeId}:
 *   get:
 *     summary: Get streaming URL for an episode
 *     tags: [Stream]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: episodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Episode ID
 *     responses:
 *       200:
 *         description: Streaming URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     streamUrl:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/episode/:episodeId', 
  validateRequest({ params: idParamSchema }),
  streamController.getEpisodeStream
);

/**
 * @swagger
 * /stream/subtitles/{key}:
 *   get:
 *     summary: Get subtitle file URL
 *     tags: [Stream]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtitle file key
 *     responses:
 *       200:
 *         description: Subtitle URL generated successfully
 *       404:
 *         description: Subtitle not found
 */
router.get('/subtitles/:key', streamController.getSubtitles);

export default router;
