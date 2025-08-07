# ChauPhim Backend API

A comprehensive Node.js backend API for ChauPhim movie platform built with Express.js and MongoDB.

## Features

- 🎬 **Movie Management**: Complete CRUD operations for movies with advanced filtering and search
- 👥 **User Authentication**: JWT-based authentication with role-based access control
- ⭐ **Reviews & Ratings**: User review system with rating calculations
- ❤️ **Favorites**: Personal movie favorites management
- 🏷️ **Categories**: Dynamic movie categorization system
- 📱 **RESTful API**: Clean and well-documented REST endpoints
- 🔒 **Security**: Input validation, rate limiting, and CORS protection
- ☁️ **File Upload**: Cloudinary integration for image uploads
- 📊 **Admin Dashboard**: Comprehensive admin panel with statistics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator
- **Environment**: dotenv

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Password reset request
- `PUT /api/auth/reset-password/:token` - Reset password

### Movies
- `GET /api/movies` - Get all movies with pagination and filters
- `GET /api/movies/:id` - Get single movie by ID
- `GET /api/movies/slug/:slug` - Get movie by slug
- `POST /api/movies` - Create new movie (Admin/Moderator)
- `PUT /api/movies/:id` - Update movie (Admin/Moderator)
- `DELETE /api/movies/:id` - Delete movie (Admin/Moderator)
- `GET /api/movies/featured` - Get featured movies
- `GET /api/movies/recommended` - Get recommended movies
- `GET /api/movies/search` - Search movies
- `GET /api/movies/category/:categorySlug` - Get movies by category
- `GET /api/movies/country/:country` - Get movies by country
- `PUT /api/movies/:id/views` - Increment movie views

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/slug/:slug` - Get category by slug
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)
- `PUT /api/categories/reorder` - Reorder categories (Admin)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review (Auth required)
- `PUT /api/reviews/:id` - Update review (Owner/Admin)
- `DELETE /api/reviews/:id` - Delete review (Owner/Admin)
- `GET /api/reviews/movie/:movieId` - Get reviews for specific movie
- `GET /api/reviews/user/:userId` - Get user's reviews

### Favorites
- `GET /api/favorites` - Get user's favorites (Auth required)
- `POST /api/favorites` - Add to favorites (Auth required)
- `DELETE /api/favorites/:movieId` - Remove from favorites (Auth required)
- `POST /api/favorites/toggle/:movieId` - Toggle favorite status (Auth required)
- `GET /api/favorites/check/:movieId` - Check if movie is favorited (Auth required)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/users/:id/role` - Update user role (Admin)
- `PUT /api/admin/users/:id/toggle-active` - Toggle user status (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chauphim/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chauphim
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Project Structure

```
backend/
├── config/
│   ├── database.js         # MongoDB connection
│   └── cloudinary.js       # Cloudinary configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── movieController.js  # Movie operations
│   ├── categoryController.js # Category operations
│   ├── reviewController.js # Review operations
│   ├── favoriteController.js # Favorite operations
│   └── adminController.js  # Admin operations
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── upload.js          # File upload middleware
│   └── validation.js      # Input validation
├── models/
│   ├── User.js            # User model
│   ├── Movie.js           # Movie model
│   ├── Category.js        # Category model
│   ├── Review.js          # Review model
│   └── Favorite.js        # Favorite model
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── movieRoutes.js     # Movie routes
│   ├── categoryRoutes.js  # Category routes
│   ├── reviewRoutes.js    # Review routes
│   ├── favoriteRoutes.js  # Favorite routes
│   └── adminRoutes.js     # Admin routes
├── utils/
│   └── helpers.js         # Utility functions
├── .env                   # Environment variables
├── .env.example          # Environment template
├── server.js             # Application entry point
└── package.json          # Dependencies and scripts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/chauphim |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 30d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

## Usage Examples

### Creating a Movie
```javascript
POST /api/movies
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "title": "The Matrix",
  "originalTitle": "The Matrix",
  "description": "A computer hacker learns about the true nature of reality.",
  "year": 1999,
  "country": "USA",
  "type": "movie",
  "genres": ["genre_id_1", "genre_id_2"],
  "duration": 136,
  "ageRating": "R"
}
```

### Searching Movies
```javascript
GET /api/movies/search?q=matrix&page=1&limit=10
```

### Adding to Favorites
```javascript
POST /api/favorites
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "movieId": "movie_id_here"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **user**: Regular user (can review, favorite movies)
- **moderator**: Can manage movies and categories
- **admin**: Full access to all features including user management

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Rate Limiting

- **General**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
