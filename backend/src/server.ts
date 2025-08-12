import app from './app';
import config from './config';
import logger from './config/logger';
import prisma from './infra/db';
import cacheService from './infra/cache';
import queueService from './infra/queue';
import setupStorage from './infra/storage/setup';

async function startServer() {
  try {
    // Test database connection
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error: any) {
      logger.error('❌ Database connection failed:', error.message);
      logger.info('💡 Make sure MySQL is running and the database exists');
    }

    // Test Redis connection
    try {
      await cacheService.set('health-check', 'ok', 10);
      logger.info('✅ Redis connected successfully');
    } catch (error: any) {
      logger.error('❌ Redis connection failed:', error.message);
      logger.info('💡 Make sure Redis is running on port 6379');
    }

    // Setup storage (create bucket if needed)
    try {
      await setupStorage();
      logger.info('✅ Storage setup completed');
    } catch (error: any) {
      logger.error('❌ Storage setup failed:', error.message);
      logger.info('💡 Make sure MinIO is running on port 9000');
    }

    // Start the server
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`);
      logger.info(`📖 API Documentation: http://localhost:${config.PORT}/docs`);
      logger.info(`🏥 Health Check: http://localhost:${config.PORT}/health`);
      logger.info(`🌍 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await prisma.$disconnect();
          logger.info('Database disconnected');
          
          await cacheService.disconnect();
          logger.info('Redis disconnected');
          
          await queueService.closeConnection();
          logger.info('Queue service disconnected');
          
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
