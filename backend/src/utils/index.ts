import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidImageType = (mimetype: string): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(mimetype);
};

export const isValidVideoType = (mimetype: string): boolean => {
  const validTypes = ['video/mp4', 'video/avi', 'video/mkv', 'video/mov'];
  return validTypes.includes(mimetype);
};

export const calculateAverageRating = (ratings: Array<{ score: number }>): number => {
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
};

export const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
