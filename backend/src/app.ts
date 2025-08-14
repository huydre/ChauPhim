import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import config from './config';
import logger from './config/logger';

// Fix BigInt serialization with proper TypeScript declaration
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function() {
  return this.toString();
};

// Import routes
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import videoRoutes from './modules/videos/routes';
import movieRoutes from './modules/movies/routes';
import genreRoutes from './modules/genres/routes';
import castRoutes from './modules/casts/routes';
import commentRoutes from './modules/comments/routes';
import ratingRoutes from './modules/ratings/routes';
import watchRoutes from './modules/watch/routes';
import streamRoutes from './modules/stream/routes';
import adminRoutes from './modules/admin/routes';
import auditRoutes from './modules/audit/routes';

// Import middlewares
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import { swaggerSetup } from './config/swagger';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.CORS_ORIGINS.split(','),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(pinoHttp({ logger }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API Documentation
swaggerSetup(app);

// Routes
app.use('/auth', authRoutes);
app.use('/me', userRoutes);
app.use('/videos', videoRoutes);
app.use('/movies', movieRoutes);
app.use('/genres', genreRoutes);
app.use('/casts', castRoutes);
app.use('/comments', commentRoutes);
app.use('/ratings', ratingRoutes);
app.use('/watch', watchRoutes);
app.use('/stream', streamRoutes);
app.use('/admin', adminRoutes);
app.use('/audit-logs', auditRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
