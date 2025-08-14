const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data: T; meta?: any; message?: string }> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Movies API
  async getMovies(params: {
    q?: string;
    genre?: string;
    year?: number;
    country?: string;
    sort?: 'popular' | 'new' | 'rating' | 'title';
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/movies${queryString ? `?${queryString}` : ''}`);
  }

  async getMovieBySlug(slug: string) {
    return this.request(`/movies/${slug}`);
  }

  async getMovieRecommendations(slug: string, limit: number = 10) {
    return this.request(`/movies/${slug}/recommendations?limit=${limit}`);
  }

  async getMovieCast(slug: string) {
    return this.request(`/movies/${slug}/cast`);
  }

  async getMovieComments(slug: string, params: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'popular';
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/movies/${slug}/comments${queryString ? `?${queryString}` : ''}`);
  }

  async getTrendingMovies(period: 'day' | 'week' | 'month' = 'week', limit: number = 10) {
    return this.request(`/movies/trending?period=${period}&limit=${limit}`);
  }

  async getTopRatedMovies(limit: number = 10) {
    return this.request(`/movies/top-rated?limit=${limit}`);
  }

  async getRecentMovies(limit: number = 10) {
    return this.request(`/movies/recent?limit=${limit}`);
  }

  async getPopularMovies(params: {
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append('sort', 'popular');
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/movies?${searchParams.toString()}`);
  }

  async getMoviesByCountry(country: string, params: {
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/movies/country/${country}${queryString ? `?${queryString}` : ''}`);
  }

  async getMoviesByGenre(genre: string, params: {
    page?: number;
    limit?: number;
    sort?: 'popular' | 'new' | 'rating' | 'title';
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return this.request(`/movies/genre/${genre}${queryString ? `?${queryString}` : ''}`);
  }

  async searchMovies(query: string, params: {
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams({ q: query });
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/movies/search?${searchParams.toString()}`);
  }

  // Genres API
  async getGenres() {
    return this.request('/genres');
  }

  // Comments API
  async createComment(videoId: string, content: string, parentId?: string) {
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
  async rateMovie(videoId: string, score: number, reviewText?: string) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        score,
        reviewText,
      }),
    });
  }

  async getMovieRating(videoId: string) {
    return this.request(`/ratings/${videoId}`);
  }

  // Favorites API
  async addToFavorites(videoId: string) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
  }

  async removeFromFavorites(videoId: string) {
    return this.request(`/favorites/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/me');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
