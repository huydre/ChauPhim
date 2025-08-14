'use client';

import { useState, useEffect } from 'react';
import apiClient from '../lib/api-client';

// Custom hook for fetching movies with various filters
export const useMovies = (params = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getMovies(params);
        setMovies(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [JSON.stringify(params)]);

  return { movies, loading, error, meta };
};

// Custom hook for fetching trending movies
export const useTrendingMovies = (period = 'week', limit = 10) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getTrendingMovies(period, limit);
        setMovies(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching trending movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [period, limit]);

  return { movies, loading, error };
};

// Custom hook for fetching top rated movies
export const useTopRatedMovies = (limit = 10) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getTopRatedMovies(limit);
        setMovies(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching top rated movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRated();
  }, [limit]);

  return { movies, loading, error };
};

// Custom hook for fetching recent movies
export const useRecentMovies = (limit = 10) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getRecentMovies(limit);
        setMovies(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching recent movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [limit]);

  return { movies, loading, error };
};

// Custom hook for fetching popular movies
export const usePopularMovies = (params = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getPopularMovies(params);
        setMovies(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching popular movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [JSON.stringify(params)]);

  return { movies, loading, error, meta };
};

// Custom hook for fetching movies by genre
export const useMoviesByGenre = (genre, params = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      if (!genre) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getMoviesByGenre(genre, params);
        setMovies(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching movies by genre:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesByGenre();
  }, [genre, JSON.stringify(params)]);

  return { movies, loading, error, meta };
};

// Custom hook for fetching movies by country
export const useMoviesByCountry = (country, params = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchMoviesByCountry = async () => {
      if (!country) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getMoviesByCountry(country, params);
        setMovies(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching movies by country:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesByCountry();
  }, [country, JSON.stringify(params)]);

  return { movies, loading, error, meta };
};

// Custom hook for fetching movie details
export const useMovie = (slug) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getMovieBySlug(slug);
        setMovie(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching movie:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [slug]);

  return { movie, loading, error };
};

// Custom hook for fetching movie recommendations
export const useMovieRecommendations = (slug, limit = 10) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getMovieRecommendations(slug, limit);
        setRecommendations(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [slug, limit]);

  return { recommendations, loading, error };
};

// Custom hook for fetching genres
export const useGenres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getGenres();
        setGenres(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching genres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return { genres, loading, error };
};

// Custom hook for searching movies
export const useSearchMovies = (query, params = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (!query || query.trim().length < 2) {
        setMovies([]);
        setMeta(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.searchMovies(query, params);
        setMovies(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err.message);
        console.error('Error searching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, JSON.stringify(params)]);

  return { movies, loading, error, meta };
};
