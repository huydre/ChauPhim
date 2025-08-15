# ChauPhim - Nền tảng Streaming Video Việt Nam 🇻🇳

## 🚀 Tình trạng dự án

### ✅ Backend API (Hoàn thành)
- **Ngôn ngữ**: Node.js + TypeScript
- **Framework**: Express.js với Clean Architecture
- **Database**: MySQL + Prisma ORM
- **Caching**: Redis
- **Storage**: MinIO (S3-compatible)
- **Authentication**: JWT với role-based access
- **API Docs**: Swagger/OpenAPI 3.0

**Status**: ✅ **PRODUCTION READY** - Đã test và chạy thành công

### 🚧 Frontend (Đang phát triển)
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: 

**Status**: 🔄 **IN DEVELOPMENT**

## 📁 Cấu trúc dự án

```
ChauPhim/
├── backend/           # API Backend (✅)
│   ├── src/
│   │   ├── modules/   # Feature modules
│   │   ├── infra/     # Infrastructure (DB, Cache, Storage)
│   │   ├── config/    # Configuration
│   │   └── tests/     # Test suites
│   ├── prisma/        # Database schema & migrations
│   └── docker-compose.yml
├── frontend/          # Next.js Frontend (🚧)
│   ├── src/
│   │   ├── app/       # App Router
│   │   └── components/# UI Components
│   └── public/
└── README.md
```

## 🎯 Tính năng chính

### Backend API Features (✅)
- ✅ **Quản lý người dùng**: Đăng ký, đăng nhập, phân quyền
- ✅ **Quản lý nội dung**: Phim lẻ, phim bộ, tập phim
- ✅ **Streaming**: HLS video streaming với presigned URLs
- ✅ **Tìm kiếm & lọc**: Theo thể loại, năm, đánh giá
- ✅ **Tương tác**: Đánh giá, bình luận, yêu thích
- ✅ **Lịch sử xem**: Theo dõi tiến độ xem phim
- ✅ **Admin panel**: Quản lý nội dung và người dùng
- ✅ **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt và Tiếng Anh

### Frontend Features (🚧 TODO)
- 🔄 Trang chủ với nội dung trending
- 🔄 Trình phát video tích hợp
- 🔄 Tìm kiếm và lọc nâng cao
- 🔄 Trang cá nhân và lịch sử xem
- 🔄 Giao diện admin
- 🔄 Responsive design cho mobile

## 🚀 Hướng dẫn chạy dự án

### Backend (Đã sẵn sàng sử dụng)

```bash
cd backend

# 1. Cài đặt dependencies
npm install

# 2. Khởi động infrastructure (MySQL, Redis, MinIO)
docker-compose up -d mysql redis minio

# 3. Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Khởi động server
npm run dev
```

**API Documentation**: http://localhost:3000/api-docs

### Frontend (Đang phát triển)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm run dev
```

**Frontend**: http://localhost:3001

## 🔑 Test Accounts

Backend đã được seed với data mẫu:
- **Admin**: `admin@chauphim.com` / `admin123`
- **User**: `user@chauphim.com` / `user123`
```

## 🛠️ Tech Stack

### Backend
- **Node.js 18+** + **TypeScript**
- **Express.js** với middleware security
- **MySQL 8.0** + **Prisma ORM**
- **Redis** cho caching
- **MinIO** cho object storage
- **BullMQ** cho background jobs
- **JWT** authentication
- **Docker** containerization

### Frontend
- **Next.js 15** 
- **TypeScript**
- **Tailwind CSS**
- **React** 

## 🎨 UI/UX Design

- **Thiết kế cho người Việt**: Giao diện thân thiện với người dùng Việt Nam
- **Đa thiết bị**: Responsive design cho desktop và mobile
- **Hiệu suất cao**: Lazy loading, caching, optimized images

## 🔒 Bảo mật

- ✅ JWT authentication với refresh tokens
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation với Zod
- ✅ SQL injection protection

## 📈 Hiệu suất

- ✅ Redis caching cho API responses
- ✅ Database indexing và query optimization
- ✅ Pagination cho large datasets
- ✅ Gzip compression
- ✅ Presigned URLs cho video streaming

## 🌏 Localization

- ✅ API responses có cả titleVi/titleEn
- ✅ Genres và metadata đa ngôn ngữ

## 📞 Liên hệ & Hỗ trợ

- **Repository**: [GitHub](https://github.com/huydre/ChauPhim)
- **Issues**: Tạo issue trên GitHub
- **Documentation**: Chi tiết tại `/backend/README.md`

## 🗓️ Roadmap

### Phase 1: Backend API ✅ (Hoàn thành)
- [x] Core API development
- [x] Authentication system
- [x] Video management
- [x] Streaming functionality
- [x] Testing & documentation

### Phase 2: Frontend Development 🚧 (Hiện tại)
- [ ] Home page với video carousel
- [ ] Video player integration
- [ ] User authentication UI
- [ ] Search & filter interface
- [ ] User dashboard

