import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { asyncHandler } from '../../middlewares/errorHandler';
import logger from '../../config/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    
    logger.info('User registration attempt', { email });
    
    const result = await this.authService.register(email, password, name);
    
    logger.info('User registered successfully', { userId: result.user.id, email });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    logger.info('User login attempt', { email });
    
    const result = await this.authService.login(email, password);
    
    logger.info('User logged in successfully', { userId: result.user.id, email });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    const result = await this.authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await this.authService.logout(token);
    }
    
    res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    logger.info('Password reset request', { email });
    
    await this.authService.forgotPassword(email);
    
    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    
    await this.authService.resetPassword(token, password);
    
    res.json({
      success: true,
      message: 'Password reset successful',
    });
  });
}
