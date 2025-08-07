const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by movie if provided
    if (req.query.movie) {
      query.movie = req.query.movie;
    }
    
    // Filter by rating if provided
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }
    
    const reviews = await Review.find(query)
      .populate('user', 'username fullName avatar')
      .populate('movie', 'title poster slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username fullName avatar')
      .populate('movie', 'title poster slug');
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { movie, rating, comment } = req.body;
    
    // Check if movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      user: req.user._id,
      movie: movie
    });
    
    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already reviewed this movie'
      });
    }
    
    const review = await Review.create({
      user: req.user._id,
      movie,
      rating,
      comment
    });
    
    await review.populate('user', 'username fullName avatar');
    await review.populate('movie', 'title poster slug');
    
    res.status(201).json({
      status: 'success',
      message: 'Review created successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (User can only update their own review)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Check if user owns this review or is admin/moderator
    if (review.user.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this review'
      });
    }
    
    const { rating, comment } = req.body;
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.updatedAt = Date.now();
    
    await review.save();
    
    await review.populate('user', 'username fullName avatar');
    await review.populate('movie', 'title poster slug');
    
    res.status(200).json({
      status: 'success',
      message: 'Review updated successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (User can only delete their own review)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    // Check if user owns this review or is admin/moderator
    if (review.user.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this review'
      });
    }
    
    await review.remove();
    
    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get reviews for a specific movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const movieId = req.params.movieId;
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    let sort = '-createdAt';
    if (req.query.sort === 'rating_desc') {
      sort = '-rating';
    } else if (req.query.sort === 'rating_asc') {
      sort = 'rating';
    } else if (req.query.sort === 'oldest') {
      sort = 'createdAt';
    }
    
    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'username fullName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments({ movie: movieId });
    
    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { movie: movie._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    // Calculate rating distribution
    let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      ratingStats: {
        averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
        totalReviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0,
        distribution
      },
      data: {
        movie: {
          _id: movie._id,
          title: movie.title,
          poster: movie.poster,
          slug: movie.slug
        },
        reviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const userId = req.params.userId;
    
    const reviews = await Review.find({ user: userId })
      .populate('movie', 'title poster slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments({ user: userId });
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get user's review for a specific movie
// @route   GET /api/reviews/user-movie/:movieId
// @access  Private
exports.getUserMovieReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user._id,
      movie: req.params.movieId
    }).populate('movie', 'title poster slug');
    
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get latest reviews
// @route   GET /api/reviews/latest
// @access  Public
exports.getLatestReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const reviews = await Review.find()
      .populate('user', 'username fullName avatar')
      .populate('movie', 'title poster slug')
      .sort('-createdAt')
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};
