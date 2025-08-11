import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChauPhim VOD API',
      version: '1.0.0',
      description: 'Video-on-Demand API for ChauPhim streaming platform',
      contact: {
        name: 'ChauPhim Team',
        email: 'support@chauphim.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 24 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 5 },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['GUEST', 'USER', 'ADMIN'] },
            status: { type: 'string', enum: ['ACTIVE', 'BANNED', 'PENDING'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Video: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            titleVi: { type: 'string' },
            titleEn: { type: 'string' },
            descriptionVi: { type: 'string', nullable: true },
            descriptionEn: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['MOVIE', 'SERIES'] },
            year: { type: 'number' },
            posterUrl: { type: 'string', nullable: true },
            backdropUrl: { type: 'string', nullable: true },
            ageRating: { type: 'string', enum: ['G', 'PG', 'PG13', 'R', 'NC17'] },
            durationMinutes: { type: 'number', nullable: true },
            isPublished: { type: 'boolean' },
            viewsCount: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Genre: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            nameVi: { type: 'string' },
            nameEn: { type: 'string' },
          },
        },
        Season: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            videoId: { type: 'string', format: 'uuid' },
            seasonNumber: { type: 'number' },
            nameVi: { type: 'string' },
            nameEn: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Episode: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            seasonId: { type: 'string', format: 'uuid' },
            episodeNumber: { type: 'number' },
            titleVi: { type: 'string' },
            titleEn: { type: 'string' },
            synopsisVi: { type: 'string', nullable: true },
            synopsisEn: { type: 'string', nullable: true },
            runtimeMinutes: { type: 'number' },
            hlsManifestKey: { type: 'string', nullable: true },
            trailerHlsManifestKey: { type: 'string', nullable: true },
            subtitlesJson: { type: 'array', items: { type: 'object', properties: { lang: { type: 'string' }, label: { type: 'string' }, key: { type: 'string' } } }, nullable: true },
            isPublished: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MovieSource: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            videoId: { type: 'string', format: 'uuid' },
            hlsManifestKey: { type: 'string', nullable: true },
            trailerHlsManifestKey: { type: 'string', nullable: true },
            subtitlesJson: { type: 'array', items: { type: 'object', properties: { lang: { type: 'string' }, label: { type: 'string' }, key: { type: 'string' } } }, nullable: true },
            isPublished: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CastMember: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            videoId: { type: 'string', format: 'uuid' },
            parentId: { type: 'string', format: 'uuid', nullable: true },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            isDeleted: { type: 'boolean' },
          },
        },
        Rating: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            videoId: { type: 'string', format: 'uuid' },
            score: { type: 'number' },
            reviewText: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WatchHistory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            videoId: { type: 'string', format: 'uuid' },
            episodeId: { type: 'string', format: 'uuid', nullable: true },
            progressSeconds: { type: 'number' },
            completed: { type: 'boolean' },
            lastWatchedAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            plan: { type: 'string', enum: ['FREE', 'PREMIUM'] },
            startAt: { type: 'string', format: 'date-time' },
            endAt: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'] },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid', nullable: true },
            action: { type: 'string' },
            resource: { type: 'string' },
            ip: { type: 'string', nullable: true },
            userAgent: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.ts', './src/modules/**/*.js'],
  tags: [
    { name: 'Auth', description: 'Authentication & Authorization' },
    { name: 'Users', description: 'User profile & actions' },
    { name: 'Videos', description: 'Movies & Series metadata' },
    { name: 'Genres', description: 'Genres & categories' },
    { name: 'Casts', description: 'Cast members & filmography' },
    { name: 'Comments', description: 'Comments & replies' },
    { name: 'Ratings', description: 'Ratings & reviews' },
    { name: 'Watch', description: 'Watch history & progress' },
    { name: 'Stream', description: 'Streaming & assets' },
    { name: 'Admin', description: 'Admin management & analytics' },
  ],
};

const specs = swaggerJsdoc(options);

export const swaggerSetup = (app: Express): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ChauPhim API Documentation',
  }));

  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
