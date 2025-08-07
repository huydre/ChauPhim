const express = require('express');
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview
} = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/movie/:movieId', optionalAuth, getMovieReviews);

// Protected routes
router.use(protect);

router.post('/movie/:movieId', createReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);
router.post('/:reviewId/like', likeReview);

module.exports = router;
