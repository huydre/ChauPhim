@echo off
REM ChauPhim VOD Backend Setup Script for Windows
REM This script sets up the development environment

echo 🚀 Starting ChauPhim VOD Backend Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ LTS
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop
    exit /b 1
)

echo ✅ Docker version: 
docker --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please update .env file with your configuration before continuing
)

REM Start infrastructure services
echo 🐳 Starting infrastructure services (MySQL, Redis, MinIO)...
docker-compose up -d mysql redis minio

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 15

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

REM Run database migrations
echo 🗄️ Running database migrations...
npm run db:migrate

REM Seed database
echo 🌱 Seeding database with sample data...
npm run db:seed

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📖 Available commands:
echo   npm run dev          - Start development server
echo   npm run build        - Build for production
echo   npm run start        - Start production server
echo   npm test             - Run tests
echo   npm run db:studio    - Open Prisma Studio
echo.
echo 🌐 URLs:
echo   API Server:          http://localhost:3000
echo   API Documentation:   http://localhost:3000/docs
echo   Health Check:        http://localhost:3000/health
echo   MinIO Console:       http://localhost:9001
echo.
echo 👤 Test Accounts:
echo   Admin: admin@chauphim.com / admin123
echo   User:  user@chauphim.com / user123
echo.
echo 🚀 To start the development server, run:
echo   npm run dev
