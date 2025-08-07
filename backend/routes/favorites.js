const express = require('express');
const {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

router.get('/', getUserFavorites);
router.post('/movie/:movieId', addToFavorites);
router.delete('/movie/:movieId', removeFromFavorites);
router.get('/movie/:movieId/status', checkFavoriteStatus);

module.exports = router;
