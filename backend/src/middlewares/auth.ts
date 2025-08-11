import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils';
import { UserRole } from '@prisma/client';
import prisma from '../infra/db';
import logger from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    status: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyAccessToken(token);
      
      // Get user from database to ensure they still exist and are active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        res.status(401).json({
          success: false,
          message: 'Invalid or inactive user',
        });
        return;
      }

      req.user = user;
      next();
    } catch (jwtError) {
      logger.error('JWT verification failed:', jwtError);
      res.status(401).json({
        success: false,
        message: 'Invalid access token',
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }
  } catch (error) {
    // Ignore JWT errors for optional auth
    logger.debug('Optional auth failed (ignored):', error);
  }

  next();
};
