import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { WatchService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class WatchController {
  private watchService: WatchService;

  constructor() {
    this.watchService = new WatchService();
  }

  updateProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { videoId, episodeId, progressSeconds, completed } = req.body;
    
    await this.watchService.updateProgress(
      req.user.id,
      videoId,
      progressSeconds,
      completed,
      episodeId
    );
    
    return res.json({
      success: true,
      message: 'Progress updated successfully',
    });
  });

  getContinueWatching = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;

    const result = await this.watchService.getContinueWatching(req.user.id, page, limit);
    
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });
}
