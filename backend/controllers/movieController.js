const Movie = require('../models/Movie');
const Category = require('../models/Category');

// Helper function to build query
const buildQuery = (queryParams) => {
  const query = {};
  
  if (queryParams.genres) {
    query.genres = { $in: queryParams.genres.split(',') };
  }
  
  if (queryParams.country) {
    query.country = new RegExp(queryParams.country, 'i');
  }
  
  if (queryParams.year) {
    query.year = parseInt(queryParams.year);
  }
  
  if (queryParams.type) {
    query.type = queryParams.type;
  }
  
  if (queryParams.ageRating) {
    query.ageRating = queryParams.ageRating;
  }
  
  return query;
};

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getAllMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = buildQuery(req.query);
    
    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      sort = sortBy;
    } else {
      sort = '-createdAt';
    }
    
    const movies = await Movie.find(query)
      .populate('genres', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        movies
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

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('genres', 'name slug color')
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        movie
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

// @desc    Get movie by slug
// @route   GET /api/movies/slug/:slug
// @access  Public
exports.getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug })
      .populate('genres', 'name slug color')
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        movie
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

// @desc    Create movie
// @route   POST /api/movies
// @access  Private (Admin/Moderator)
exports.createMovie = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;
    
    const movie = await Movie.create(req.body);
    
    // Update category movie counts
    if (req.body.genres && req.body.genres.length > 0) {
      for (const genreId of req.body.genres) {
        const category = await Category.findById(genreId);
        if (category) {
          await category.updateMovieCount();
        }
      }
    }
    
    await movie.populate('genres', 'name slug color');
    
    res.status(201).json({
      status: 'success',
      message: 'Movie created successfully',
      data: {
        movie
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

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private (Admin/Moderator)
exports.updateMovie = async (req, res) => {
  try {
    req.body.updatedBy = req.user._id;
    
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('genres', 'name slug color');
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Movie updated successfully',
      data: {
        movie
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

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private (Admin/Moderator)
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    await movie.remove();
    
    res.status(200).json({
      status: 'success',
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get featured movies
// @route   GET /api/movies/featured
// @access  Public
exports.getFeaturedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const movies = await Movie.find({ isFeatured: true })
      .populate('genres', 'name slug color')
      .sort('-createdAt')
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      data: {
        movies
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

// @desc    Get recommended movies
// @route   GET /api/movies/recommended
// @access  Public
exports.getRecommendedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const movies = await Movie.find({ isRecommended: true })
      .populate('genres', 'name slug color')
      .sort('-rating.average')
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      data: {
        movies
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

// @desc    Get movies by category
// @route   GET /api/movies/category/:categorySlug
// @access  Public
exports.getMoviesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const category = await Category.findOne({ slug: req.params.categorySlug });
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    const movies = await Movie.find({ genres: category._id })
      .populate('genres', 'name slug color')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments({ genres: category._id });
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        category,
        movies
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

// @desc    Get movies by country
// @route   GET /api/movies/country/:country
// @access  Public
exports.getMoviesByCountry = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const movies = await Movie.find({ 
      country: new RegExp(req.params.country, 'i') 
    })
      .populate('genres', 'name slug color')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments({ 
      country: new RegExp(req.params.country, 'i') 
    });
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        movies
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

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    const searchQuery = {
      $or: [
        { title: new RegExp(q, 'i') },
        { originalTitle: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    const movies = await Movie.find(searchQuery)
      .populate('genres', 'name slug color')
      .sort('-rating.average')
      .skip(skip)
      .limit(limit);
    
    const total = await Movie.countDocuments(searchQuery);
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        movies
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

// @desc    Increment movie views
// @route   PUT /api/movies/:id/views
// @access  Public
exports.incrementViews = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        views: movie.views
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

// @desc    Get top rated movies
// @route   GET /api/movies/top-rated
// @access  Public
exports.getTopRatedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const movies = await Movie.find({ 'rating.count': { $gte: 5 } })
      .populate('genres', 'name slug color')
      .sort('-rating.average')
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      data: {
        movies
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

// @desc    Get most viewed movies
// @route   GET /api/movies/most-viewed
// @access  Public
exports.getMostViewedMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const movies = await Movie.find()
      .populate('genres', 'name slug color')
      .sort('-views')
      .limit(limit);
    
    res.status(200).json({
      status: 'success',
      results: movies.length,
      data: {
        movies
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
