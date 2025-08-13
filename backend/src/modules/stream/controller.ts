import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { StreamService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class StreamController {
  private streamService: StreamService;

  constructor() {
    this.streamService = new StreamService();
  }

  getMovieStream = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { videoId } = req.params;
    const result = await this.streamService.getMovieStreamUrl(videoId!, req.user.id);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  getEpisodeStream = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { episodeId } = req.params;
    const result = await this.streamService.getEpisodeStreamUrl(episodeId!, req.user.id);
    
    return res.json({
      success: true,
      data: result,
    });
  });

  getSubtitles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { key } = req.params;
    const result = await this.streamService.getSubtitleUrl(key!);
    
    return res.json({
      success: true,
      data: result,
    });
  });
}
