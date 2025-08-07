const express = require('express');
const {
  getAllMovies,
  getMovie,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
  getFeaturedMovies,
  getRecommendedMovies,
  getMoviesByCategory,
  getMoviesByCountry,
  searchMovies,
  incrementViews,
  getTopRatedMovies,
  getMostViewedMovies
} = require('../controllers/movieController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllMovies);
router.get('/featured', getFeaturedMovies);
router.get('/recommended', getRecommendedMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/most-viewed', getMostViewedMovies);
router.get('/search', searchMovies);
router.get('/category/:categorySlug', getMoviesByCategory);
router.get('/country/:country', getMoviesByCountry);
router.get('/slug/:slug', optionalAuth, getMovieBySlug);
router.get('/:id', optionalAuth, getMovie);
router.put('/:id/views', incrementViews);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin', 'moderator'));

router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

module.exports = router;
