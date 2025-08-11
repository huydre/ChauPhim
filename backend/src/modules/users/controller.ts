import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { UserService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const user = await this.userService.getProfile(req.user.id);
    
    return res.json({
      success: true,
      data: user,
    });
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { name, avatarUrl } = req.body;
    const user = await this.userService.updateProfile(req.user.id, { name, avatarUrl });
    
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  });

  getWatchHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;

    const result = await this.userService.getWatchHistory(req.user.id, page, limit);
    
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  getFavorites = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;

    const result = await this.userService.getFavorites(req.user.id, page, limit);
    
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });

  toggleFavorite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { videoId } = req.params;
    const result = await this.userService.toggleFavorite(req.user.id, videoId!);
    
    return res.json({
      success: true,
      message: result.added ? 'Added to favorites' : 'Removed from favorites',
      data: { added: result.added },
    });
  });

  getRatings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;

    const result = await this.userService.getRatings(req.user.id, page, limit);
    
    return res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  });
}
