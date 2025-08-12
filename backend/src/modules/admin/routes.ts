import { Router } from 'express';
import { AdminController } from './controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validation';
import { z } from 'zod';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication
router.use(authenticate);

// Validation schemas
const uploadUrlSchema = {
  body: z.object({
    filename: z.string().min(1, 'Filename is required'),
    contentType: z.string().min(1, 'Content type is required'),
  }),
};

const createMovieSchema = {
  body: z.object({
    slug: z.string().min(1, 'Slug is required'),
    titleVi: z.string().min(1, 'Vietnamese title is required'),
    titleEn: z.string().min(1, 'English title is required'),
    descriptionVi: z.string().min(1, 'Vietnamese description is required'),
    descriptionEn: z.string().min(1, 'English description is required'),
    type: z.enum(['MOVIE', 'SERIES']),
    year: z.number().min(1900).max(2030),
    posterUrl: z.string().url().optional(),
    backdropUrl: z.string().url().optional(),
    ageRating: z.string().optional(),
    durationMinutes: z.number().positive().optional(),
    genreIds: z.array(z.string().uuid()).optional(),
    castIds: z.array(z.string().uuid()).optional(),
    rawVideoKey: z.string().optional(),
  }),
};

const transcodeSchema = {
  body: z.object({
    rawVideoKey: z.string().min(1, 'Raw video key is required'),
    qualities: z.array(z.enum(['360p', '480p', '720p', '1080p'])).optional(),
  }),
};

const publishSchema = {
  body: z.object({
    isPublished: z.boolean(),
  }),
};

const subtitleUploadSchema = {
  body: z.object({
    language: z.string().min(2).max(5, 'Language code is required'),
  }),
};

const addSubtitleSchema = {
  body: z.object({
    language: z.string().min(2).max(5, 'Language code is required'),
    subtitleKey: z.string().min(1, 'Subtitle key is required'),
  }),
};

/**
 * @swagger
 * /admin/movies/upload-url:
 *   post:
 *     summary: Generate presigned upload URL for video files
 *     tags: [Admin - Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 example: "movie.mp4"
 *               contentType:
 *                 type: string
 *                 example: "video/mp4"
 *             required:
 *               - filename
 *               - contentType
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
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
 *                     uploadUrl:
 *                       type: string
 *                     videoKey:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Admin access required
 */
router.post('/movies/upload-url', 
  validateRequest(uploadUrlSchema),
  adminController.generateUploadUrl
);

/**
 * @swagger
 * /admin/movies:
 *   post:
 *     summary: Create new movie or series
 *     tags: [Admin - Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 example: "avengers-endgame"
 *               titleVi:
 *                 type: string
 *                 example: "Biệt Đội Siêu Anh Hùng: Hồi Kết"
 *               titleEn:
 *                 type: string
 *                 example: "Avengers: Endgame"
 *               descriptionVi:
 *                 type: string
 *                 example: "Cuộc chiến cuối cùng..."
 *               descriptionEn:
 *                 type: string
 *                 example: "The final battle..."
 *               type:
 *                 type: string
 *                 enum: [MOVIE, SERIES]
 *               year:
 *                 type: integer
 *                 example: 2019
 *               posterUrl:
 *                 type: string
 *                 format: uri
 *               backdropUrl:
 *                 type: string
 *                 format: uri
 *               ageRating:
 *                 type: string
 *                 example: "PG13"
 *               durationMinutes:
 *                 type: integer
 *                 example: 181
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               castIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               rawVideoKey:
 *                 type: string
 *                 example: "uploads/raw/movie.mp4"
 *             required:
 *               - slug
 *               - titleVi
 *               - titleEn
 *               - descriptionVi
 *               - descriptionEn
 *               - type
 *               - year
 *     responses:
 *       200:
 *         description: Movie created successfully
 *       400:
 *         description: Movie with slug already exists
 *       403:
 *         description: Admin access required
 */
router.post('/movies', 
  validateRequest(createMovieSchema),
  adminController.createMovie
);

/**
 * @swagger
 * /admin/movies:
 *   get:
 *     summary: Get all movies for admin dashboard
 *     tags: [Admin - Movies]
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
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, unpublished, processing]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MOVIE, SERIES]
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
 *       403:
 *         description: Admin access required
 */
router.get('/movies', adminController.getAllMovies);

/**
 * @swagger
 * /admin/movies/{id}:
 *   put:
 *     summary: Update movie or series
 *     tags: [Admin - Movies]
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
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *               titleVi:
 *                 type: string
 *               titleEn:
 *                 type: string
 *               descriptionVi:
 *                 type: string
 *               descriptionEn:
 *                 type: string
 *               year:
 *                 type: integer
 *               posterUrl:
 *                 type: string
 *               backdropUrl:
 *                 type: string
 *               ageRating:
 *                 type: string
 *               durationMinutes:
 *                 type: integer
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               castIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.put('/movies/:id', adminController.updateMovie);

/**
 * @swagger
 * /admin/movies/{id}/transcode:
 *   post:
 *     summary: Start video transcoding
 *     tags: [Admin - Movies]
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
 *             type: object
 *             properties:
 *               rawVideoKey:
 *                 type: string
 *                 example: "uploads/raw/movie.mp4"
 *               qualities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: ["360p", "480p", "720p", "1080p"]
 *                 example: ["720p", "1080p"]
 *             required:
 *               - rawVideoKey
 *     responses:
 *       200:
 *         description: Transcoding started successfully
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.post('/movies/:id/transcode', 
  validateRequest(transcodeSchema),
  adminController.startTranscoding
);

/**
 * @swagger
 * /admin/movies/{id}/transcode/status:
 *   get:
 *     summary: Check transcoding status
 *     tags: [Admin - Movies]
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
 *         description: Transcoding status retrieved
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
 *                     status:
 *                       type: string
 *                       enum: [queued, processing, completed, failed]
 *                     progress:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     message:
 *                       type: string
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.get('/movies/:id/transcode/status', adminController.getTranscodingStatus);

/**
 * @swagger
 * /admin/movies/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish movie
 *     tags: [Admin - Movies]
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
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - isPublished
 *     responses:
 *       200:
 *         description: Publish status updated successfully
 *       400:
 *         description: Cannot publish without transcoded video
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.patch('/movies/:id/publish', 
  validateRequest(publishSchema),
  adminController.togglePublishStatus
);

/**
 * @swagger
 * /admin/movies/{id}/subtitles/upload-url:
 *   post:
 *     summary: Generate upload URL for subtitle files
 *     tags: [Admin - Movies]
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
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 example: "vi"
 *                 description: "Language code (vi, en, etc.)"
 *             required:
 *               - language
 *     responses:
 *       200:
 *         description: Subtitle upload URL generated
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.post('/movies/:id/subtitles/upload-url', 
  validateRequest(subtitleUploadSchema),
  adminController.getSubtitleUploadUrl
);

/**
 * @swagger
 * /admin/movies/{id}/subtitles:
 *   post:
 *     summary: Add subtitle to movie
 *     tags: [Admin - Movies]
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
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 example: "vi"
 *               subtitleKey:
 *                 type: string
 *                 example: "videos/movie-1/subtitles/vi.vtt"
 *             required:
 *               - language
 *               - subtitleKey
 *     responses:
 *       200:
 *         description: Subtitle added successfully
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.post('/movies/:id/subtitles', 
  validateRequest(addSubtitleSchema),
  adminController.uploadSubtitles
);

/**
 * @swagger
 * /admin/movies/{id}:
 *   delete:
 *     summary: Delete movie
 *     tags: [Admin - Movies]
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
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.delete('/movies/:id', adminController.deleteMovie);

export default router;
