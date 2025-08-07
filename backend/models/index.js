const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Category = require('./Category');
const Movie = require('./Movie');
const Review = require('./Review');
const Favorite = require('./Favorite');
const MovieCategory = require('./MovieCategory');

// Define associations

// User associations
User.hasMany(Movie, { foreignKey: 'createdBy', as: 'createdMovies' });
User.hasMany(Movie, { foreignKey: 'updatedBy', as: 'updatedMovies' });
User.hasMany(Category, { foreignKey: 'createdBy', as: 'createdCategories' });
User.hasMany(Category, { foreignKey: 'updatedBy', as: 'updatedCategories' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });

// Movie associations
Movie.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Movie.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
Movie.hasMany(Review, { foreignKey: 'movieId', as: 'reviews' });
Movie.hasMany(Favorite, { foreignKey: 'movieId', as: 'favorites' });

// Movie-Category many-to-many
Movie.belongsToMany(Category, { 
  through: MovieCategory, 
  foreignKey: 'movieId',
  otherKey: 'categoryId',
  as: 'genres'
});

Category.belongsToMany(Movie, { 
  through: MovieCategory, 
  foreignKey: 'categoryId',
  otherKey: 'movieId',
  as: 'movies'
});

// Category associations
Category.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Category.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Category,
  Movie,
  Review,
  Favorite,
  MovieCategory
};
