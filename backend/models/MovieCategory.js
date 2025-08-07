const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Junction table for Movie-Category many-to-many relationship
const MovieCategory = sequelize.define('MovieCategory', {
  movieId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'movie_categories',
  timestamps: false
});

module.exports = MovieCategory;
