#!/bin/bash

# ChauPhim VOD Backend Setup Script
# This script sets up the development environment

set -e  # Exit on any error

echo "🚀 Starting ChauPhim VOD Backend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ LTS"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi

echo "✅ Docker version: $(docker --version)"
echo "✅ Docker Compose version: $(docker-compose --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration before continuing"
fi

# Start infrastructure services
echo "🐳 Starting infrastructure services (MySQL, Redis, MinIO)..."
docker-compose up -d mysql redis minio

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

# Check MySQL
until docker-compose exec mysql mysqladmin ping -h "localhost" --silent; do
    echo "⏳ Waiting for MySQL to be ready..."
    sleep 2
done
echo "✅ MySQL is ready"

# Check Redis
until docker-compose exec redis redis-cli ping | grep PONG; do
    echo "⏳ Waiting for Redis to be ready..."
    sleep 2
done
echo "✅ Redis is ready"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📖 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run start        - Start production server"
echo "  npm test             - Run tests"
echo "  npm run db:studio    - Open Prisma Studio"
echo ""
echo "🌐 URLs:"
echo "  API Server:          http://localhost:3000"
echo "  API Documentation:   http://localhost:3000/docs"
echo "  Health Check:        http://localhost:3000/health"
echo "  MinIO Console:       http://localhost:9001"
echo ""
echo "👤 Test Accounts:"
echo "  Admin: admin@chauphim.com / admin123"
echo "  User:  user@chauphim.com / user123"
echo ""
echo "🚀 To start the development server, run:"
echo "  npm run dev"
