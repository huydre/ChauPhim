const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  originalTitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  poster: {
    type: String,
    required: [true, 'Poster is required']
  },
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required']
  },
  trailer: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1900,
    max: new Date().getFullYear() + 5
  },
  duration: {
    type: String, // "120 phút" format
    required: function() {
      return this.type === 'movie';
    }
  },
  type: {
    type: String,
    enum: ['movie', 'series'],
    required: [true, 'Type is required']
  },
  status: {
    type: String,
    enum: ['upcoming', 'released', 'ongoing'],
    default: 'released'
  },
  ageRating: {
    type: String,
    enum: ['T13', 'T16', 'T18', 'C18'],
    required: [true, 'Age rating is required']
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required']
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'At least one genre is required']
  }],
  cast: [{
    name: String,
    role: String,
    image: String
  }],
  director: [{
    name: String,
    image: String
  }],
  // For series
  seasons: {
    type: Number,
    required: function() {
      return this.type === 'series';
    }
  },
  episodes: {
    type: Number,
    required: function() {
      return this.type === 'series';
    }
  },
  episodeList: [{
    episodeNumber: Number,
    title: String,
    description: String,
    duration: String,
    videoUrl: String,
    thumbnail: String,
    season: Number
  }],
  // Ratings
  imdb: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Stats
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // Features
  isFeatured: {
    type: Boolean,
    default: false
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  // SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tags: [String],
  // Admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ year: 1 });
movieSchema.index({ type: 1 });
movieSchema.index({ country: 1 });
movieSchema.index({ isFeatured: 1 });
movieSchema.index({ isRecommended: 1 });
movieSchema.index({ views: -1 });
movieSchema.index({ 'rating.average': -1 });
movieSchema.index({ slug: 1 });

// Generate slug before saving
movieSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Virtual for formatted duration
movieSchema.virtual('formattedDuration').get(function() {
  if (this.type === 'movie' && this.duration) {
    return this.duration;
  } else if (this.type === 'series') {
    return `${this.seasons} mùa • ${this.episodes} tập`;
  }
  return '';
});

// Populate genres in toJSON
movieSchema.methods.toJSON = function() {
  const movie = this.toObject({ virtuals: true });
  return movie;
};

module.exports = mongoose.model('Movie', movieSchema);
