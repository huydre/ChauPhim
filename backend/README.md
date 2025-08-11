# ChauPhim VOD Backend API

A comprehensive Video-on-Demand (VOD) backend API built with Node.js, TypeScript, Express, Prisma, and MySQL. This project follows Clean Architecture principles and implements industry best practices for scalable video streaming platforms.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens, role-based access control
- **Video Management**: Movies and series with seasons/episodes support
- **Streaming**: HLS video streaming with presigned URLs, subtitle support
- **User Features**: Favorites, watch history, ratings, comments
- **Content Management**: Admin panel for content management
- **Media Processing**: Video transcoding with FFmpeg and job queues
- **Caching**: Redis-based caching for performance optimization
- **Storage**: S3-compatible object storage (MinIO)
- **Search & Filtering**: Advanced content discovery
- **Internationalization**: Vietnamese and English content support
- **API Documentation**: OpenAPI/Swagger documentation
- **Testing**: Comprehensive test suite
- **Monitoring**: Structured logging with correlation IDs

## 🏗️ Architecture

```
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server startup and graceful shutdown
│   ├── config/                # Configuration and environment setup
│   │   ├── index.ts           # Main configuration
│   │   ├── logger.ts          # Logging configuration
│   │   └── swagger.ts         # API documentation setup
│   ├── modules/               # Feature modules (Clean Architecture)
│   │   ├── auth/              # Authentication & authorization
│   │   ├── users/             # User management
│   │   ├── videos/            # Video content management
│   │   ├── genres/            # Genre management
│   │   ├── stream/            # Video streaming
│   │   ├── watch/             # Watch progress tracking
│   │   ├── ratings/           # Rating system
│   │   ├── comments/          # Comment system
│   │   └── admin/             # Admin panel
│   ├── infra/                 # Infrastructure layer
│   │   ├── db/                # Database (Prisma)
│   │   ├── cache/             # Redis caching
│   │   ├── storage/           # S3/MinIO storage
│   │   └── queue/             # Background jobs (BullMQ)
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── validation.ts      # Request validation
│   │   ├── errorHandler.ts    # Error handling
│   │   └── notFound.ts        # 404 handler
│   ├── utils/                 # Utility functions
│   └── tests/                 # Test suites
└── prisma/                    # Database schema and migrations
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ LTS
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Prisma
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Queue**: BullMQ
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Pino
- **Linting**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+ LTS
- Docker & Docker Compose
- MySQL 8.0
- Redis
- MinIO or AWS S3

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd ChauPhim/backend
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment configuration

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="mysql://root:secret@localhost:3306/vod_app"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production

# Redis
REDIS_URL=redis://localhost:6379

# Storage (MinIO)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=vod
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_USE_SSL=false

# Additional configuration...
```

### 4. Start infrastructure services

```bash
docker-compose up -d mysql redis minio
```

### 5. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

### 7. Access MinIO Console (Optional)

MinIO console: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

## 📚 API Documentation

### Authentication

#### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Videos

#### Get Videos (with filtering)
```bash
GET /videos?type=MOVIE&genre=action&sort=popular&page=1&limit=24
```

#### Get Video Details
```bash
GET /videos/the-sample-movie
```

### Streaming

#### Get Movie Stream URL
```bash
GET /stream/{videoId}
Authorization: Bearer <access_token>
```

#### Get Episode Stream URL
```bash
GET /stream/episode/{episodeId}
Authorization: Bearer <access_token>
```

### Complete API documentation is available at `/docs` when the server is running.

## 🗄️ Database Schema

### Key Entities

- **Users**: Authentication and user management
- **Videos**: Movies and series metadata
- **Seasons/Episodes**: Series structure
- **Genres**: Content categorization
- **Cast Members**: Actor/director information
- **Ratings**: User ratings and reviews
- **Comments**: User comments and discussions
- **Watch History**: User viewing progress
- **Favorites**: User watchlists

### Sample Data

The seed script creates:
- Admin user: `admin@chauphim.com` / `admin123`
- Test user: `user@chauphim.com` / `user123`
- Sample movies and series
- Genres, cast members, ratings, and comments

## 🧪 Testing

### Run tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Service layer logic
- **Integration Tests**: API endpoints
- **Authentication Tests**: Login, registration, JWT handling
- **Video Tests**: Content management and streaming
- **User Tests**: User features and preferences

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Production Deployment

1. **Environment Variables**: Update `.env` with production values
2. **Database Migration**: Run migrations in production
```bash
npm run db:deploy
```
3. **SSL Configuration**: Enable HTTPS and update CORS origins
4. **Resource Limits**: Configure Docker memory and CPU limits
5. **Monitoring**: Set up logging aggregation and monitoring

## 📊 Monitoring & Logging

### Logs

- **Structured Logging**: JSON logs with correlation IDs
- **Log Levels**: fatal, error, warn, info, debug, trace
- **Request Logging**: Automatic request/response logging
- **Error Tracking**: Detailed error information and stack traces

### Health Checks

```bash
GET /health
```

Returns server status, environment, and timestamp.

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request throttling
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Input Validation**: Request data validation with Zod
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🚀 Performance Optimizations

- **Redis Caching**: Configurable TTL for different content types
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient large dataset handling
- **Lazy Loading**: On-demand data loading
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Optimized database connections

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MySQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `REDIS_URL` | Redis connection string | Required |
| `STORAGE_ENDPOINT` | MinIO/S3 endpoint | Required |
| `STORAGE_BUCKET` | Storage bucket name | `vod` |

### Feature Flags

- **Rate Limiting**: Configure request limits
- **Cache TTL**: Set cache expiration times
- **File Upload**: Configure maximum file sizes
- **Pagination**: Set default and maximum page sizes

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MySQL is running and credentials are correct
2. **Redis Connection**: Verify Redis server is accessible
3. **MinIO Setup**: Check MinIO credentials and bucket creation
4. **Port Conflicts**: Ensure ports 3000, 3306, 6379, 9000 are available
5. **Environment Variables**: Verify all required variables are set

### Debug Mode

```bash
LOG_LEVEL=debug npm run dev
```

### Database Issues

```bash
# Reset database
npm run db:migrate:reset

# Check migration status
npx prisma migrate status

# Generate new migration
npx prisma migrate dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run linting and tests
6. Create a pull request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Express.js community
- Prisma team
- MinIO project
- All open source contributors

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation at `/docs`
- Review the troubleshooting section

---

**Note**: This is a development/demo application. For production use, ensure proper security measures, monitoring, and scaling considerations are implemented.
