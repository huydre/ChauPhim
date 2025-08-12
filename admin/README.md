# ChauPhim Admin Dashboard

Professional admin dashboard for ChauPhim Video-on-Demand platform built with Next.js 15, TypeScript, TailwindCSS, and shadcn/ui.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Admin only)
- **Automatic token refresh** with 401 handling
- **Secure token storage** in localStorage with memory fallback

### Content Management
- **Videos Management**: Create, edit, publish movies and series
- **Seasons & Episodes**: Manage series structure with episodes
- **Genres**: CRUD operations with usage tracking
- **Cast Members**: Actor/director management with avatars
- **Sources Management**: HLS manifest keys, trailers, subtitles

### User & Community Features
- **User Management**: Role changes, ban/unban, profile management
- **Ratings Moderation**: Review user ratings and comments
- **Comments System**: Hierarchical comments with moderation tools
- **Watch History**: User viewing progress tracking

### Media & Storage
- **File Upload**: Pre-signed URL uploads for videos, images, subtitles
- **Storage Management**: S3/MinIO integration with CDN support
- **Video Processing**: Job queue monitoring for transcoding
- **Subtitle Support**: Multi-language .vtt file management

### Analytics & Monitoring
- **Dashboard Analytics**: KPIs, charts, trending content
- **View Tracking**: Video and user engagement metrics
- **Audit Logs**: Complete admin action logging
- **Export Functions**: CSV export for reports

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15**: App Router, RSC, Server Actions
- **TypeScript**: Strict type safety
- **TailwindCSS**: Utility-first styling
- **shadcn/ui**: Radix UI-based components

### State & Data
- **React Query**: Server state management with caching
- **React Hook Form**: Form state with validation
- **Zod**: Schema validation and type inference
- **TanStack Table**: Advanced data tables

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd admin
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

**Admin Panel**: http://localhost:3001

### 4. Default Credentials

```
Email: admin@chauphim.com
Password: admin123
```
