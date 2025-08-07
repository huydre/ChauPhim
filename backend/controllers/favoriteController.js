const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
exports.getUserFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'movie',
        select: 'title originalTitle poster backdrop slug year country type rating genres description duration status',
        populate: {
          path: 'genres',
          select: 'name slug color'
        }
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    const total = await Favorite.countDocuments({ user: req.user._id });
    
    res.status(200).json({
      status: 'success',
      results: favorites.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        favorites
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

// @desc    Add movie to favorites
// @route   POST /api/favorites
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const { movieId } = req.body;
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      movie: movieId
    });
    
    if (existingFavorite) {
      return res.status(400).json({
        status: 'error',
        message: 'Movie is already in your favorites'
      });
    }
    
    const favorite = await Favorite.create({
      user: req.user._id,
      movie: movieId
    });
    
    await favorite.populate({
      path: 'movie',
      select: 'title originalTitle poster backdrop slug year country type rating genres description duration status',
      populate: {
        path: 'genres',
        select: 'name slug color'
      }
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Movie added to favorites successfully',
      data: {
        favorite
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

// @desc    Remove movie from favorites
// @route   DELETE /api/favorites/:movieId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      movie: req.params.movieId
    });
    
    if (!favorite) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found in your favorites'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Movie removed from favorites successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Check if movie is in user's favorites
// @route   GET /api/favorites/check/:movieId
// @access  Private
exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      movie: req.params.movieId
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite ? favorite._id : null
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

// @desc    Toggle favorite status
// @route   POST /api/favorites/toggle/:movieId
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const movieId = req.params.movieId;
    
    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        message: 'Movie not found'
      });
    }
    
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      movie: movieId
    });
    
    if (existingFavorite) {
      // Remove from favorites
      await existingFavorite.remove();
      
      res.status(200).json({
        status: 'success',
        message: 'Movie removed from favorites',
        data: {
          action: 'removed',
          isFavorite: false
        }
      });
    } else {
      // Add to favorites
      const favorite = await Favorite.create({
        user: req.user._id,
        movie: movieId
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Movie added to favorites',
        data: {
          action: 'added',
          isFavorite: true,
          favoriteId: favorite._id
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// @desc    Get favorite movies by category
// @route   GET /api/favorites/category/:categorySlug
// @access  Private
exports.getFavoritesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const categorySlug = req.params.categorySlug;
    
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'movie',
        match: {
          genres: {
            $elemMatch: { slug: categorySlug }
          }
        },
        select: 'title originalTitle poster backdrop slug year country type rating genres description duration status',
        populate: {
          path: 'genres',
          select: 'name slug color'
        }
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    
    // Filter out null movies (when match doesn't find anything)
    const validFavorites = favorites.filter(fav => fav.movie !== null);
    
    res.status(200).json({
      status: 'success',
      results: validFavorites.length,
      data: {
        favorites: validFavorites
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

// @desc    Get favorite statistics
// @route   GET /api/favorites/stats
// @access  Private
exports.getFavoriteStats = async (req, res) => {
  try {
    const stats = await Favorite.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movieData'
        }
      },
      { $unwind: '$movieData' },
      {
        $group: {
          _id: null,
          totalFavorites: { $sum: 1 },
          favoriteGenres: {
            $push: '$movieData.genres'
          },
          favoriteCountries: {
            $push: '$movieData.country'
          },
          favoriteTypes: {
            $push: '$movieData.type'
          }
        }
      }
    ]);
    
    let processedStats = {
      totalFavorites: 0,
      topGenres: [],
      topCountries: [],
      typeDistribution: { movie: 0, series: 0 }
    };
    
    if (stats.length > 0) {
      const stat = stats[0];
      processedStats.totalFavorites = stat.totalFavorites;
      
      // Process genres
      const genreCount = {};
      stat.favoriteGenres.flat().forEach(genre => {
        if (genre) {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        }
      });
      processedStats.topGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));
      
      // Process countries
      const countryCount = {};
      stat.favoriteCountries.forEach(country => {
        if (country) {
          countryCount[country] = (countryCount[country] || 0) + 1;
        }
      });
      processedStats.topCountries = Object.entries(countryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));
      
      // Process types
      stat.favoriteTypes.forEach(type => {
        if (type && processedStats.typeDistribution.hasOwnProperty(type)) {
          processedStats.typeDistribution[type]++;
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: processedStats
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

// @desc    Clear all favorites
// @route   DELETE /api/favorites/clear
// @access  Private
exports.clearAllFavorites = async (req, res) => {
  try {
    const result = await Favorite.deleteMany({ user: req.user._id });
    
    res.status(200).json({
      status: 'success',
      message: `${result.deletedCount} favorites cleared successfully`,
      data: {
        deletedCount: result.deletedCount
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
