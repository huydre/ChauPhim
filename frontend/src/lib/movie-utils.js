/**
 * Utility functions for transforming movie data from API to component format
 */

// Transform movie data from API response to component expected format
export const transformMovieData = (movieData) => {
  if (!movieData) return null;

  return {
    id: movieData.id,
    slug: movieData.slug,
    title: movieData.titleVi || movieData.titleEn,
    titleEn: movieData.titleEn || movieData.titleVi,
    originalTitle: movieData.originalTitle || movieData.titleEn,
    year: movieData.year,
    rating: movieData.imdbRating || 0,
    views: Number(movieData.viewsCount) || 0,
    duration: movieData.durationMinutes,
    description: movieData.descriptionVi || movieData.descriptionEn || movieData.overview,
    genres: movieData.genres?.map(g => g.genre?.nameVi || g.nameVi) || [],
    poster: movieData.posterUrl,
    backdrop: movieData.backdropUrl,
    type: movieData.type?.toLowerCase(),
    sources: transformMovieSources(movieData.movieSources),
    subtitles: movieData.movieSources?.subtitlesJson || [],
    cast: transformMovieCast(movieData.casts || []),
    ageRating: movieData.ageRating || "C18"
  };
};

// Transform movie sources for video player
export const transformMovieSources = (movieSources) => {
  if (!movieSources || !movieSources.hlsManifestKey) return [];

  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
  const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET || 'chauphim-videos';
  
  return [
    {
      server: "Server 1",
      url: `${minioUrl}/${bucketName}/${movieSources.hlsManifestKey}`,
      quality: movieSources.video?.quality || "HD",
      isDefault: true
    }
  ];
};

// Transform movie cast data
export const transformMovieCast = (casts) => {
  return casts.map(cast => ({
    id: cast.cast?.id || cast.castId,
    name: cast.cast?.name || cast.name,
    avatar: cast.cast?.avatarUrl || cast.avatarUrl,
    character: cast.roleName || cast.character
  }));
};

// Transform recommended movies
export const transformRecommendedMovies = (movies) => {
  return movies.map(movie => ({
    id: movie.id,
    title: movie.titleVi || movie.titleEn,
    poster: movie.posterUrl,
    quality: movie.quality || "HD",
    year: movie.year,
    rating: movie.imdbRating || 0,
    slug: movie.slug
  }));
};

// Transform comments data
export const transformCommentsData = (comments) => {
  return comments.map(comment => ({
    id: comment.id,
    user: {
      name: comment.user?.name || 'Anonymous',
      avatar: comment.user?.avatarUrl || "/api/placeholder/40/40"
    },
    content: comment.content,
    timestamp: comment.createdAt,
    likes: comment.likesCount || 0,
    replies: comment.replies?.map(reply => ({
      id: reply.id,
      user: {
        name: reply.user?.name || 'Anonymous',
        avatar: reply.user?.avatarUrl || "/api/placeholder/40/40"
      },
      content: reply.content,
      timestamp: reply.createdAt,
      likes: reply.likesCount || 0
    })) || []
  }));
};

// Transform movie list data for home page
export const transformMovieList = (movies) => {
  return movies.map(movie => ({
    id: movie.id,
    title: movie.titleVi || movie.titleEn,
    poster: movie.posterUrl,
    quality: movie.quality || "HD",
    year: movie.year,
    rating: movie.imdbRating || 0,
    slug: movie.slug,
    type: movie.type?.toLowerCase(),
    genres: movie.genres?.map(g => g.genre?.nameVi || g.nameVi) || []
  }));
};

// Get video URL for streaming
export const getVideoStreamUrl = (hlsManifestKey) => {
  if (!hlsManifestKey) return null;
  
  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
  const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET || 'chauphim-videos';
  
  return `${minioUrl}/${bucketName}/${hlsManifestKey}`;
};

// Format duration from minutes to hours and minutes
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Format view count
export const formatViewCount = (views) => {
  if (!views) return '0';
  
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

// Format rating
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return Number(rating).toFixed(1);
};
