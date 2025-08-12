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
    const result = await this.adminService.createMovie(movieData);
    
    return res.json({
      success: true,
      data: result,
    });
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
}
