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
    slug: z.string().optional(),
    titleVi: z.string().optional(),
    titleEn: z.string().optional(), 
    originalTitle: z.string().optional(),
    englishTitle: z.string().optional(),
    descriptionVi: z.string().optional(),
    descriptionEn: z.string().optional(),
    overview: z.string().optional(),
    type: z.enum(['MOVIE', 'SERIES']).default('MOVIE'),
    year: z.number().min(1900).max(2030).optional(),
    posterUrl: z.string().url().optional(),
    backdropUrl: z.string().url().optional(),
    quality: z.enum(['CAM', 'HD', 'FHD','2K', '4K']).optional(),
    originCountry: z.array(z.string()).optional(),
    imdbRating: z.number().min(0).max(10).optional(),
    imdbId: z.string().optional(),
    imagesJson: z.any().optional(), // Will store complex image data structure
    ageRating: z.string().optional(),
    durationMinutes: z.number().positive().optional(),
    genreIds: z.array(z.string().uuid()).optional(),
    castIds: z.array(z.string().uuid()).optional(),
    rawVideoKey: z.string().optional(),
  }),
};

const updateMovieSchema = {
  body: z.object({
    slug: z.string().optional(),
    titleVi: z.string().optional(),
    titleEn: z.string().optional(),
    originalTitle: z.string().optional(),
    englishTitle: z.string().optional(),
    descriptionVi: z.string().optional(),
    descriptionEn: z.string().optional(),
    overview: z.string().optional(),
    type: z.enum(['MOVIE', 'SERIES']).optional(),
    year: z.number().min(1900).max(2030).optional(),
    posterUrl: z.string().url().optional(),
    backdropUrl: z.string().url().optional(),
    quality: z.enum(['CAM', 'HD', 'FHD', 'FOURK']).optional(),
    originCountry: z.array(z.string()).optional(),
    imdbRating: z.number().min(0).max(10).optional(),
    imdbId: z.string().optional(),
    imagesJson: z.any().optional(), // Will store complex image data structure
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

const imageUploadSchema = {
  body: z.object({
    filename: z.string().min(1, 'Filename is required'),
    contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid image type'),
    imageType: z.enum(['poster', 'backdrop']),
  }),
};

const replaceVideoSchema = {
  body: z.object({
    videoKey: z.string().min(1, 'Video key is required'),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
};

const movieSubtitleParamsSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

const deleteSubtitleSchema = {
  params: z.object({
    id: z.string().uuid(),
    language: z.string().min(2).max(10),
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
 *   get:
 *     summary: Get movie or series by ID
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
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie retrieved successfully
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
 *                     id:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     titleVi:
 *                       type: string
 *                     titleEn:
 *                       type: string
 *                     descriptionVi:
 *                       type: string
 *                     descriptionEn:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [MOVIE, SERIES]
 *                     year:
 *                       type: number
 *                     ageRating:
 *                       type: string
 *                     durationMinutes:
 *                       type: number
 *                     isPublished:
 *                       type: boolean
 *                     viewsCount:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     genres:
 *                       type: array
 *                       items:
 *                         type: object
 *                     movieSources:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.get('/movies/:id', adminController.getMovieById);

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
router.put('/movies/:id', validateRequest(updateMovieSchema), adminController.updateMovie);

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
 * /admin/transcode-jobs:
 *   get:
 *     summary: Get all transcode jobs with pagination
 *     tags: [Admin - Transcode]
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
 *           enum: [QUEUED, PROCESSING, COMPLETED, FAILED]
 *     responses:
 *       200:
 *         description: List of transcode jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       videoId:
 *                         type: string
 *                       jobId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [QUEUED, PROCESSING, COMPLETED, FAILED]
 *                       progress:
 *                         type: integer
 *                         minimum: 0
 *                         maximum: 100
 *                       qualities:
 *                         type: array
 *                       startedAt:
 *                         type: string
 *                         format: date-time
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       video:
 *                         type: object
 *                         properties:
 *                           titleVi:
 *                             type: string
 *                           titleEn:
 *                             type: string
 *                           slug:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Admin access required
 */
router.get('/transcode-jobs', adminController.getTranscodeJobs);

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
 * /admin/movies/{id}/publish:
 *   put:
 *     summary: Update movie publish status
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
 *             required:
 *               - isPublished
 *     responses:
 *       200:
 *         description: Movie publish status updated successfully
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.put('/movies/:id/publish', 
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
 * /admin/movies/{id}/images/upload-url:
 *   post:
 *     summary: Generate upload URL for movie images (poster/backdrop)
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
 *               filename:
 *                 type: string
 *                 example: "poster.jpg"
 *               contentType:
 *                 type: string
 *                 enum: ["image/jpeg", "image/jpg", "image/png", "image/webp"]
 *                 example: "image/jpeg"
 *               imageType:
 *                 type: string
 *                 enum: ["poster", "backdrop"]
 *                 example: "poster"
 *             required:
 *               - filename
 *               - contentType
 *               - imageType
 *     responses:
 *       200:
 *         description: Image upload URL generated
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
 *                     imageKey:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.post('/movies/:id/images/upload-url', 
  validateRequest(imageUploadSchema),
  adminController.getImageUploadUrl
);

/**
 * @swagger
 * /admin/movies/{id}/images:
 *   put:
 *     summary: Update movie image URL after upload
 *     description: Update the poster or backdrop URL after successful image upload
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageType
 *               - imageKey
 *             properties:
 *               imageType:
 *                 type: string
 *                 enum: [poster, backdrop]
 *                 description: Type of image to update
 *               imageKey:
 *                 type: string
 *                 description: S3 key of the uploaded image
 *     responses:
 *       200:
 *         description: Image URL updated successfully
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
 *                     message:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     posterUrl:
 *                       type: string
 *                     backdropUrl:
 *                       type: string
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.put('/movies/:id/images',
  validateRequest({
    body: z.object({
      imageType: z.enum(['poster', 'backdrop']),
      imageKey: z.string(),
    }),
  }),
  adminController.updateMovieImage
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

// Video replacement and subtitle management routes

/**
 * @swagger
 * /admin/movies/{id}/replace-video:
 *   put:
 *     summary: Replace video file for existing movie
 *     description: Replace the video file with a new one, requires re-transcoding
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
 *             required:
 *               - videoKey
 *             properties:
 *               videoKey:
 *                 type: string
 *                 description: Storage key of the new video file
 *                 example: "uploads/raw/new-movie.mp4"
 *     responses:
 *       200:
 *         description: Video replaced successfully
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
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.put('/movies/:id/replace-video', 
  validateRequest(replaceVideoSchema),
  adminController.replaceMovieVideo
);

/**
 * @swagger
 * /admin/movies/{id}/subtitles:
 *   get:
 *     summary: Get all subtitles for a movie
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
 *         description: Subtitles retrieved successfully
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
 *                     videoId:
 *                       type: string
 *                     subtitles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           language:
 *                             type: string
 *                           label:
 *                             type: string
 *                           key:
 *                             type: string
 *                           url:
 *                             type: string
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.get('/movies/:id/subtitles', 
  validateRequest(movieSubtitleParamsSchema),
  adminController.getMovieSubtitles
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
 *             required:
 *               - language
 *               - label
 *               - subtitleKey
 *             properties:
 *               language:
 *                 type: string
 *                 description: Language code (e.g., 'en', 'vi')
 *                 example: "en"
 *               label:
 *                 type: string
 *                 description: Display label for the subtitle
 *                 example: "English"
 *               subtitleKey:
 *                 type: string
 *                 description: Storage key of the subtitle file
 *                 example: "videos/123/subtitles/en.vtt"
 *     responses:
 *       200:
 *         description: Subtitle added successfully
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
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Invalid input or movie has no video source
 *       404:
 *         description: Movie not found
 *       403:
 *         description: Admin access required
 */
router.post('/movies/:id/subtitles', 
  validateRequest(addSubtitleSchema),
  adminController.addMovieSubtitle
);

/**
 * @swagger
 * /admin/movies/{id}/subtitles/{language}:
 *   delete:
 *     summary: Delete subtitle from movie
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
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *         description: Language code of the subtitle to delete
 *         example: "en"
 *     responses:
 *       200:
 *         description: Subtitle deleted successfully
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
 *         description: Invalid input
 *       404:
 *         description: Movie or subtitle not found
 *       403:
 *         description: Admin access required
 */
router.delete('/movies/:id/subtitles/:language', 
  validateRequest(deleteSubtitleSchema),
  adminController.deleteMovieSubtitle
);

export default router;
