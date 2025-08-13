import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('999y'), // No expiration
  JWT_REFRESH_EXPIRES_IN: z.string().default('999y'), // No expiration
  
  // Redis
  REDIS_URL: z.string(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Storage
  STORAGE_ENDPOINT: z.string(),
  STORAGE_BUCKET: z.string(),
  STORAGE_ACCESS_KEY: z.string(),
  STORAGE_SECRET_KEY: z.string(),
  STORAGE_USE_SSL: z.coerce.boolean().default(false),
  STORAGE_REGION: z.string().default('us-east-1'),
  
  // CDN
  CDN_BASE_URL: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@chauphim.com'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(2 * 1024 * 1024 * 1024), // 2GB
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  CORS_ORIGINS: z.string().default('http://localhost:3001'),
  
  // Pagination
  DEFAULT_PAGE_SIZE: z.coerce.number().default(24),
  MAX_PAGE_SIZE: z.coerce.number().default(100),
  
  // Cache TTL (seconds)
  CACHE_TTL_SHORT: z.coerce.number().default(300), // 5 minutes
  CACHE_TTL_MEDIUM: z.coerce.number().default(1800), // 30 minutes
  CACHE_TTL_LONG: z.coerce.number().default(3600), // 1 hour
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment config:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;

export default config;
