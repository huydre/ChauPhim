# ChauPhim Backend - MySQL Setup Guide

## 🗄️ Chuyển đổi từ MongoDB sang MySQL

Backend ChauPhim đã được chuyển đổi thành công từ MongoDB sang MySQL với Sequelize ORM.

## 📋 Yêu cầu hệ thống

- Node.js 16+ 
- MySQL 8.0+
- npm hoặc yarn

## 🚀 Cài đặt MySQL

### macOS (sử dụng Homebrew):
```bash
# Cài đặt MySQL
brew install mysql

# Khởi động MySQL service
brew services start mysql

# Bảo mật MySQL (tùy chọn)
mysql_secure_installation
```

### Ubuntu/Debian:
```bash
# Cập nhật package list
sudo apt update

# Cài đặt MySQL
sudo apt install mysql-server

# Khởi động MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Bảo mật MySQL
sudo mysql_secure_installation
```

### Windows:
1. Tải xuống MySQL Installer từ: https://dev.mysql.com/downloads/installer/
2. Chạy installer và làm theo hướng dẫn
3. Khởi động MySQL service

## 🔧 Cấu hình Database

### 1. Tạo database:
```sql
-- Đăng nhập MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE chauphim;

-- Tạo user cho ứng dụng (tùy chọn)
CREATE USER 'chauphim_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON chauphim.* TO 'chauphim_user'@'localhost';
FLUSH PRIVILEGES;

-- Thoát
EXIT;
```

### 2. Cập nhật file .env:
```env
# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chauphim
DB_USER=root
DB_PASSWORD=your_mysql_password

# Hoặc sử dụng user riêng
DB_USER=chauphim_user
DB_PASSWORD=your_password
```

## 📦 Cài đặt Dependencies

```bash
# Di chuyển vào thư mục backend
cd /Users/hnam/Desktop/ChauPhim/backend

# Cài đặt các packages
npm install

# Các packages chính đã được cài:
# - sequelize: ORM cho MySQL
# - mysql2: MySQL driver cho Node.js
# - sequelize-cli: CLI tools cho Sequelize
```

## 🏗️ Cấu trúc Database

### Tables được tạo tự động:
- **users**: Quản lý người dùng
- **categories**: Thể loại phim
- **movies**: Thông tin phim
- **reviews**: Đánh giá phim
- **favorites**: Danh sách yêu thích
- **movie_categories**: Bảng liên kết movie-category (many-to-many)

### Relationships:
- Users → Movies (createdBy, updatedBy)
- Users → Categories (createdBy, updatedBy)
- Users → Reviews (one-to-many)
- Users → Favorites (one-to-many)
- Movies ↔ Categories (many-to-many through movie_categories)
- Movies → Reviews (one-to-many)
- Movies → Favorites (one-to-many)

## 🚀 Chạy ứng dụng

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔍 Kiểm tra kết nối

Khi chạy server, bạn sẽ thấy:
```
MySQL database connected successfully
Database synchronized
Server running on port 5000
```

## 📊 Tính năng chính

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (user, moderator, admin)
- Password hashing với bcrypt
- Account locking sau 5 lần đăng nhập sai

### 🎬 Movie Management
- CRUD operations cho phim
- Upload poster/backdrop qua Cloudinary
- Search và filter phim
- Rating system
- View counting

### 🏷️ Category Management
- Dynamic category system
- Movie count tracking
- Category ordering

### ⭐ Review System
- User ratings (1-10 scale)
- Comment system
- Rating statistics

### ❤️ Favorites
- Personal movie favorites
- Favorite statistics

### 🛡️ Security Features
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation
- SQL injection protection (Sequelize)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Movies
- `GET /api/movies` - Danh sách phim (có pagination)
- `GET /api/movies/:id` - Chi tiết phim
- `POST /api/movies` - Tạo phim mới (Admin/Moderator)
- `PUT /api/movies/:id` - Cập nhật phim
- `DELETE /api/movies/:id` - Xóa phim
- `GET /api/movies/search?q=keyword` - Tìm kiếm phim

### Categories
- `GET /api/categories` - Danh sách thể loại
- `POST /api/categories` - Tạo thể loại (Admin)
- `PUT /api/categories/:id` - Cập nhật thể loại
- `DELETE /api/categories/:id` - Xóa thể loại

### Reviews
- `GET /api/reviews/movie/:movieId` - Reviews của phim
- `POST /api/reviews` - Tạo review
- `PUT /api/reviews/:id` - Cập nhật review
- `DELETE /api/reviews/:id` - Xóa review

### Favorites
- `GET /api/favorites` - Danh sách yêu thích
- `POST /api/favorites` - Thêm vào yêu thích
- `DELETE /api/favorites/:movieId` - Xóa khỏi yêu thích
- `POST /api/favorites/toggle/:movieId` - Toggle favorite

## 🛠️ Troubleshooting

### Lỗi kết nối MySQL:
```
Error: Access denied for user 'root'@'localhost'
```
**Giải pháp**: Kiểm tra username/password trong file .env

### Lỗi database không tồn tại:
```
Error: Unknown database 'chauphim'
```
**Giải pháp**: Tạo database bằng câu lệnh `CREATE DATABASE chauphim;`

### Lỗi port đã được sử dụng:
```
Error: listen EADDRINUSE :::5000
```
**Giải pháp**: Thay đổi PORT trong file .env hoặc kill process đang sử dụng port 5000

## 📈 Performance Tips

1. **Indexing**: Sequelize tự động tạo indexes cho foreign keys
2. **Connection Pooling**: Đã cấu hình pool trong database.js
3. **Pagination**: Sử dụng offset/limit cho datasets lớn
4. **Caching**: Có thể implement Redis caching cho production

## 🔄 Migration từ MongoDB

Nếu bạn có dữ liệu từ MongoDB cũ, bạn có thể:
1. Export dữ liệu từ MongoDB
2. Transform data format cho MySQL
3. Import vào MySQL qua Sequelize seeders

## 🎯 Bước tiếp theo

1. ✅ Backend MySQL đã hoàn thành
2. 🔄 Kết nối Frontend với API mới
3. 🧪 Testing với Postman/Thunder Client
4. 🚀 Deploy lên production

Chúc bạn thành công với ChauPhim MySQL backend! 🎉
