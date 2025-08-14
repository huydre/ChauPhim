const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Movies API
  async getMovies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/movies?${queryString}`);
  }

  async getMovieBySlug(slug) {
    return this.request(`/movies/${slug}`);
  }

  async getTrendingMovies(period = 'week', limit = 10) {
    return this.request(`/movies/trending?period=${period}&limit=${limit}`);
  }

  async getTopRatedMovies(limit = 10) {
    return this.request(`/movies/top-rated?limit=${limit}`);
  }

  async getRecentMovies(limit = 10) {
    return this.request(`/movies/recent?limit=${limit}`);
  }

  async getMoviesByGenre(genre, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/movies/genre/${genre}?${queryString}`);
  }

  async getMoviesByCountry(country, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/movies/country/${country}?${queryString}`);
  }

  async getMovieRecommendations(slug, limit = 10) {
    return this.request(`/movies/${slug}/recommendations?limit=${limit}`);
  }

  async getMovieCast(slug) {
    return this.request(`/movies/${slug}/cast`);
  }

  async getMovieComments(slug, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/movies/${slug}/comments?${queryString}`);
  }

  async searchMovies(query, params = {}) {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/movies/search?${queryString}`);
  }

  // Genres API
  async getGenres() {
    return this.request('/genres');
  }

  // Videos API (for series)
  async getVideos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/videos?${queryString}`);
  }

  async getVideoBySlug(slug) {
    return this.request(`/videos/${slug}`);
  }

  // Comments API
  async addComment(videoId, content, parentId = null) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        content,
        parentId,
      }),
    });
  }

  // Ratings API
  async addRating(videoId, score, reviewText = null) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        score,
        reviewText,
      }),
    });
  }

  // Watch progress API
  async updateWatchProgress(videoId, progressSeconds, episodeId = null, completed = false) {
    return this.request('/watch/progress', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        episodeId,
        progressSeconds,
        completed,
      }),
    });
  }

  // Auth API
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // User API
  async getProfile() {
    return this.request('/me/profile');
  }

  async updateProfile(data) {
    return this.request('/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getFavorites(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/me/favorites?${queryString}`);
  }

  async addToFavorites(videoId) {
    return this.request('/me/favorites', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
  }

  async removeFromFavorites(videoId) {
    return this.request(`/me/favorites/${videoId}`, {
      method: 'DELETE',
    });
  }

  async getWatchHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/me/watch-history?${queryString}`);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export individual methods for convenience
export const {
  getMovies,
  getMovieBySlug,
  getTrendingMovies,
  getTopRatedMovies,
  getRecentMovies,
  getMoviesByGenre,
  getMovieRecommendations,
  getMovieCast,
  getMovieComments,
  searchMovies,
  getGenres,
  getVideos,
  getVideoBySlug,
  addComment,
  addRating,
  updateWatchProgress,
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getWatchHistory,
} = apiClient;
