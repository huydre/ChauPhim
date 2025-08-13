import { Router } from 'express';
import { UserController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/', userController.getProfile);

/**
 * @swagger
 * /me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/', 
  validateRequest({ body: updateProfileSchema }), 
  userController.updateProfile
);

/**
 * @swagger
 * /me/history:
 *   get:
 *     summary: Get user watch history
 *     tags: [Users]
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
 *         description: Watch history retrieved successfully
 */
router.get('/history', userController.getWatchHistory);

/**
 * @swagger
 * /me/favorites:
 *   get:
 *     summary: Get user favorites (watchlist)
 *     tags: [Users]
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
 *         description: Favorites retrieved successfully
 */
router.get('/favorites', userController.getFavorites);

/**
 * @swagger
 * /me/favorites/{videoId}:
 *   post:
 *     summary: Toggle video in favorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Favorite toggled successfully
 */
router.post('/favorites/:videoId', userController.toggleFavorite);

/**
 * @swagger
 * /me/ratings:
 *   get:
 *     summary: Get user ratings
 *     tags: [Users]
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
 *         description: Ratings retrieved successfully
 */
router.get('/ratings', userController.getRatings);

export default router;
