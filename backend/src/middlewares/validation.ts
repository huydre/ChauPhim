import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../config/logger';

export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
      } else {
        logger.error('Validation middleware error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
    }
  };
};

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const videoIdParamSchema = z.object({
  videoId: z.string().uuid(),
});

export const episodeIdParamSchema = z.object({
  episodeId: z.string().uuid(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(['MOVIE', 'SERIES']).optional(),
  genre: z.string().optional(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 5).optional(),
  sort: z.enum(['popular', 'new', 'rating', 'title']).default('popular'),
  ...paginationSchema.shape,
});

export const ratingSchema = z.object({
  score: z.number().min(1).max(10),
  reviewText: z.string().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

export const progressSchema = z.object({
  videoId: z.string().uuid(),
  episodeId: z.string().uuid().optional(),
  progressSeconds: z.number().min(0),
  completed: z.boolean().default(false),
});

// Admin video replacement and subtitle management schemas
export const replaceVideoSchema = z.object({
  videoKey: z.string().min(1, 'Video key is required'),
});

export const addSubtitleSchema = z.object({
  language: z.string().min(2).max(10),
  label: z.string().min(1).max(100),
  subtitleKey: z.string().min(1, 'Subtitle key is required'),
});

export const movieIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const subtitleLanguageParamSchema = z.object({
  id: z.string().uuid(),
  language: z.string().min(2).max(10),
});
