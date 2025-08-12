import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { AdminService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // Generate presigned upload URL for video files
  generateUploadUrl = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { filename, contentType } = req.body;
    const result = await this.adminService.generateUploadUrl(filename, contentType);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Create new movie/series
  createMovie = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const movieData = req.body;
    
    // Validate at least one title is provided
    if (!movieData.titleVi && !movieData.titleEn && !movieData.rawVideoKey) {
      return res.status(400).json({
        success: false,
        message: 'At least one title (titleVi or titleEn) or video file must be provided',
      });
    }

    try {
      const result = await this.adminService.createMovie(movieData, req.user!.id);
      
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Create movie error:', error);
      
      // Return more detailed error information
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create movie',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  });

  // Update movie/series
  updateMovie = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const updateData = req.body;
    const result = await this.adminService.updateMovie(id!, updateData);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Start video transcoding
  startTranscoding = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { qualities, rawVideoKey } = req.body;
    const result = await this.adminService.startTranscoding(id!, rawVideoKey, qualities);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Check transcoding status
  getTranscodingStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const result = await this.adminService.getTranscodingStatus(id!);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Publish/unpublish movie
  togglePublishStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { isPublished } = req.body;
    const result = await this.adminService.togglePublishStatus(id!, isPublished);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Upload subtitles
  uploadSubtitles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { language, subtitleKey } = req.body;
    const result = await this.adminService.uploadSubtitles(id!, language, subtitleKey);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Get subtitle upload URL
  getSubtitleUploadUrl = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { language } = req.body;
    const result = await this.adminService.getSubtitleUploadUrl(id!, language);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Get image upload URL for poster/backdrop
  getImageUploadUrl = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { filename, contentType, imageType } = req.body;
    const result = await this.adminService.getImageUploadUrl(id!, filename, contentType, imageType);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Update movie image after upload
  updateMovieImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const { imageType, imageKey } = req.body;
    const result = await this.adminService.updateMovieImage(id!, imageType, imageKey);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Get all movies for admin dashboard
  getAllMovies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { page = 1, limit = 20, status, type } = req.query as any;
    const result = await this.adminService.getAllMovies({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
    });
    
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  // Get movie by ID
  getMovieById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    const result = await this.adminService.getMovieById(id!);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }
    
    return res.json({
      success: true,
      data: result,
    });
  });

  // Delete movie
  deleteMovie = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { id } = req.params;
    await this.adminService.deleteMovie(id!);
    
    return res.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  });

  // Get transcode jobs
  getTranscodeJobs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    
    const result = await this.adminService.getTranscodeJobs(page, limit, status);
    
    return res.json({
      success: true,
      ...result,
    });
  });
}
