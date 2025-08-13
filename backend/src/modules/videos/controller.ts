import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { VideoService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class VideoController {
  private videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
  }

  getVideos = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      q,
      type,
      genre,
      year,
      sort = 'popular',
      page = 1,
      limit = 24,
    } = req.query as any;

    const result = await this.videoService.getVideos({
      search: q,
      type,
      genre,
      year: year ? parseInt(year) : undefined,
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
      userId: req.user?.id,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  getVideoBySlug = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { slug } = req.params;
    
    const video = await this.videoService.getVideoBySlug(slug!, req.user?.id);
    
    return res.json({
      success: true,
      data: video,
    });
  });

  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const recommendations = await this.videoService.getRecommendations(slug!, limit);
    
    return res.json({
      success: true,
      data: recommendations,
    });
  });
}
