# ChauPhim VOD Backend - Deployment Guide

This guide covers different deployment scenarios for the ChauPhim VOD Backend.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker 20.x+
- Docker Compose 2.x+
- 2GB+ RAM
- 10GB+ storage

### Production Deployment with Docker

1. **Clone and configure**
```bash
git clone <repository-url>
cd ChauPhim/backend
cp .env.example .env
```

2. **Update environment variables**
```env
NODE_ENV=production
JWT_SECRET=your_super_long_secret_key_for_production
JWT_REFRESH_SECRET=your_super_long_refresh_secret_key
DATABASE_URL=mysql://vod_user:your_secure_password@mysql:3306/vod_app
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

3. **Deploy with Docker Compose**
```bash
docker-compose up -d
```

4. **Run migrations and seed**
```bash
docker-compose exec backend npm run db:deploy
docker-compose exec backend npm run db:seed
```

### Production Environment Variables

```env
# App
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=mysql://user:password@host:3306/database

# JWT (Use long, random strings)
JWT_SECRET=your_256_bit_secret
JWT_REFRESH_SECRET=your_256_bit_refresh_secret

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your_redis_password

# Storage
STORAGE_ENDPOINT=https://your-s3-endpoint.com
STORAGE_BUCKET=your-bucket
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key
STORAGE_USE_SSL=true

# CDN
CDN_BASE_URL=https://cdn.yourdomain.com

# Email
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_password

# Security
CORS_ORIGINS=https://yourdomain.com
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
```

## 🖥️ Traditional Server Deployment

### Prerequisites
- Ubuntu 20.04+ LTS
- Node.js 18+ LTS
- MySQL 8.0+
- Redis 6.0+
- Nginx
- PM2 (Process Manager)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Create database and user
sudo mysql -u root -p

CREATE DATABASE vod_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vod_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON vod_app.* TO 'vod_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/chauphim-backend
sudo chown $USER:$USER /var/www/chauphim-backend

# Clone and setup
cd /var/www/chauphim-backend
git clone <repository-url> .
npm install
npm run build

# Configure environment
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run db:deploy
npm run db:seed
```

### 4. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'chauphim-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/chauphim-backend-error.log',
    out_file: '/var/log/pm2/chauphim-backend-out.log',
    log_file: '/var/log/pm2/chauphim-backend-combined.log',
    time: true
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/chauphim-backend`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }

    # Static files (if any)
    location /static/ {
        alias /var/www/chauphim-backend/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/chauphim-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name chauphim-backend
```

2. **Build and Push Image**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t chauphim-backend .
docker tag chauphim-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/chauphim-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/chauphim-backend:latest
```

3. **ECS Task Definition**
```json
{
  "family": "chauphim-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "chauphim-backend",
      "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/chauphim-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account>:secret:chauphim/db-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/chauphim-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Using AWS RDS for Database
```bash
# Create MySQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier chauphim-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --allocated-storage 20 \
  --db-name vod_app \
  --master-username admin \
  --master-user-password SecurePassword123
```

#### Using AWS ElastiCache for Redis
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id chauphim-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Deploy**
```bash
# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy
gcloud run deploy chauphim-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

#### Using Cloud SQL
```bash
# Create MySQL instance
gcloud sql instances create chauphim-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create vod_app --instance=chauphim-db
```

## 🔧 Production Optimizations

### Performance
- **Enable compression**: Already configured in Express
- **Use CDN**: CloudFlare, AWS CloudFront, or similar
- **Database indexing**: Optimize based on query patterns
- **Connection pooling**: Configure Prisma connection limits
- **Caching**: Redis with appropriate TTL values

### Security
- **Environment variables**: Never commit secrets
- **Rate limiting**: Protect against abuse
- **CORS**: Restrict origins in production
- **Helmet**: Security headers (already configured)
- **Input validation**: All requests validated with Zod

### Monitoring
- **Application logs**: Structured logging with Pino
- **Database monitoring**: Query performance tracking
- **Health checks**: Endpoint for load balancer health checks
- **Error tracking**: Sentry, Bugsnag, or similar
- **Metrics**: Prometheus + Grafana

### Backup Strategy
- **Database backups**: Automated daily backups
- **File storage backups**: S3 versioning and cross-region replication
- **Configuration backups**: Infrastructure as Code

## 🚨 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check credentials and network connectivity
   - Verify firewall rules
   - Check connection limits

2. **Redis connection issues**
   - Verify Redis is running
   - Check network connectivity
   - Validate credentials

3. **File upload/streaming issues**
   - Check S3/MinIO credentials
   - Verify bucket permissions
   - Check CORS configuration

4. **High memory usage**
   - Monitor connection pools
   - Check for memory leaks
   - Optimize database queries

### Performance Issues
- Use `npm run db:studio` to monitor database queries
- Check Redis hit rates
- Monitor response times with application logs
- Use profiling tools for Node.js

### Scaling Considerations
- **Horizontal scaling**: Multiple instances behind load balancer
- **Database scaling**: Read replicas, connection pooling
- **Cache scaling**: Redis cluster mode
- **File storage**: CDN for static assets

---

For additional support, check the main README.md or create an issue on GitHub.
