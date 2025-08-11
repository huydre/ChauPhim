import prisma from '../../infra/db';
import { AppError } from '../../middlewares/errorHandler';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../../utils';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../config/logger';

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({ 
        userId: storedToken.userId, 
        role: storedToken.user.role 
      });
      const newRefreshToken = generateRefreshToken({ userId: storedToken.userId });

      // Delete old refresh token and create new one
      await prisma.$transaction([
        prisma.refreshToken.delete({
          where: { id: storedToken.id },
        }),
        prisma.refreshToken.create({
          data: {
            id: uuidv4(),
            token: newRefreshToken,
            userId: storedToken.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      // In a more sophisticated implementation, you might want to blacklist the access token
      // For now, we'll just delete refresh tokens for the user
      // This would require decoding the access token to get the user ID
      
      // Note: For production, consider implementing a token blacklist using Redis
      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout error:', error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    // Generate reset token (in production, store this in database with expiration)
    const resetToken = uuidv4();
    
    // TODO: Send email with reset link
    // For now, just log it (in production, use proper email service)
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    
    // In production, store the reset token in database with expiration
    // await prisma.passwordResetToken.create({
    //   data: {
    //     token: resetToken,
    //     userId: user.id,
    //     expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    //   },
    // });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // In production, verify the reset token from database
    // For now, this is a mock implementation
    
    // TODO: Implement proper password reset token verification
    // const resetToken = await prisma.passwordResetToken.findUnique({
    //   where: { token },
    //   include: { user: true },
    // });
    
    // if (!resetToken || resetToken.expiresAt < new Date()) {
    //   throw new AppError('Invalid or expired reset token', 400);
    // }
    
    // const passwordHash = await hashPassword(newPassword);
    
    // await prisma.$transaction([
    //   prisma.user.update({
    //     where: { id: resetToken.userId },
    //     data: { passwordHash },
    //   }),
    //   prisma.passwordResetToken.delete({
    //     where: { id: resetToken.id },
    //   }),
    // ]);
    
    throw new AppError('Password reset not implemented yet', 501);
  }
}
