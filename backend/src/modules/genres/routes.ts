import { Router } from 'express';
import { GenreController } from './controller';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();
const genreController = new GenreController();

// Validation schemas
const createGenreSchema = {
  body: z.object({
    nameVi: z.string().min(1, 'Vietnamese name is required').max(100),
    nameEn: z.string().min(1, 'English name is required').max(100),
    slug: z.string().min(1).max(100).optional(),
  })
};

const updateGenreSchema = {
  params: z.object({
    id: z.string().uuid('Invalid genre ID format'),
  }),
  body: z.object({
    nameVi: z.string().min(1).max(100).optional(),
    nameEn: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  })
};

const genreParamsSchema = {
  params: z.object({
    id: z.string().uuid('Invalid genre ID format'),
  })
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Genre:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         slug:
 *           type: string
 *         nameVi:
 *           type: string
 *         nameEn:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         videoCount:
 *           type: number
 *           description: Number of videos in this genre (only in stats endpoint)
 *     CreateGenreRequest:
 *       type: object
 *       required:
 *         - nameVi
 *         - nameEn
 *       properties:
 *         nameVi:
 *           type: string
 *           maxLength: 100
 *         nameEn:
 *           type: string
 *           maxLength: 100
 *         slug:
 *           type: string
 *           maxLength: 100
 *           description: Auto-generated if not provided
 *     UpdateGenreRequest:
 *       type: object
 *       properties:
 *         nameVi:
 *           type: string
 *           maxLength: 100
 *         nameEn:
 *           type: string
 *           maxLength: 100
 *         slug:
 *           type: string
 *           maxLength: 100
 */

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Get all genres
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: Genres retrieved successfully
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
 *                     $ref: '#/components/schemas/Genre'
 */
router.get('/', genreController.getGenres);

/**
 * @swagger
 * /genres/stats:
 *   get:
 *     summary: Get all genres with video count statistics (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Genres with stats retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Genre'
 *                       - type: object
 *                         properties:
 *                           videoCount:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticate, requireAdmin, genreController.getGenresWithStats);

/**
 * @swagger
 * /genres/{id}:
 *   get:
 *     summary: Get genre by ID with associated videos (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Genre retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Genre'
 *                     - type: object
 *                       properties:
 *                         videoCount:
 *                           type: number
 *                         videos:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                               titleVi:
 *                                 type: string
 *                               titleEn:
 *                                 type: string
 *                               posterUrl:
 *                                 type: string
 *                               year:
 *                                 type: number
 *                               isPublished:
 *                                 type: boolean
 *       400:
 *         description: Invalid genre ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 */
router.get('/:id', authenticate, requireAdmin, validateRequest(genreParamsSchema), genreController.getGenreById);

/**
 * @swagger
 * /genres:
 *   post:
 *     summary: Create a new genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGenreRequest'
 *     responses:
 *       201:
 *         description: Genre created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticate, requireAdmin, validateRequest(createGenreSchema), genreController.createGenre);

/**
 * @swagger
 * /genres/{id}:
 *   put:
 *     summary: Update a genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGenreRequest'
 *     responses:
 *       200:
 *         description: Genre updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 */
router.put('/:id', authenticate, requireAdmin, validateRequest(updateGenreSchema), genreController.updateGenre);

/**
 * @swagger
 * /genres/{id}:
 *   delete:
 *     summary: Delete a genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Genre deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid genre ID or genre is being used by videos
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 */
router.delete('/:id', authenticate, requireAdmin, validateRequest(genreParamsSchema), genreController.deleteGenre);

/**
 * @swagger
 * /genres:
 *   post:
 *     summary: Create a new genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGenreRequest'
 *     responses:
 *       201:
 *         description: Genre created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticate, requireAdmin, validateRequest(createGenreSchema), genreController.createGenre);

/**
 * @swagger
 * /genres/{id}:
 *   put:
 *     summary: Update a genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGenreRequest'
 *     responses:
 *       200:
 *         description: Genre updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Genre'
 *       400:
 *         description: Validation error or slug already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 */
router.put('/:id', authenticate, requireAdmin, validateRequest(updateGenreSchema), genreController.updateGenre);

/**
 * @swagger
 * /genres/{id}:
 *   delete:
 *     summary: Delete a genre (Admin only)
 *     tags: [Genres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Genre deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid genre ID or genre is being used by videos
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Genre not found
 */
router.delete('/:id', authenticate, requireAdmin, validateRequest(genreParamsSchema), genreController.deleteGenre);

export default router;
