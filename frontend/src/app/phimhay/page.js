'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/home/HeroSection';
import FilterSection from '@/components/home/FilterSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import NetflixCarousel from '@/components/NetflixCarousel';
import Footer from '@/components/Footer';
import { 
  useTrendingMovies, 
  useTopRatedMovies, 
  useRecentMovies,
  useMoviesByCountry,
  usePopularMovies
} from '@/hooks/useMovies';
import { LoadingCarousel, ErrorMessage } from '@/components/ui/LoadingStates';

export default function PhimHay() {
  // Fetch data using custom hooks
  const { movies: popularMovies, loading: popularLoading, error: popularError } = usePopularMovies({ page: 1, limit: 24 });
  const { movies: topRatedMovies, loading: topRatedLoading, error: topRatedError } = useTopRatedMovies(20);
  const { movies: recentMovies, loading: recentLoading, error: recentError } = useRecentMovies(20);
  
  // Country-specific movies
  const { movies: koreanMovies, loading: koreanLoading, error: koreanError } = useMoviesByCountry('han-quoc', { limit: 20 });
  const { movies: chineseMovies, loading: chineseLoading, error: chineseError } = useMoviesByCountry('trung-quoc', { limit: 20 });
  const { movies: hollywoodMovies, loading: hollywoodLoading, error: hollywoodError } = useMoviesByCountry('my', { limit: 20 });

  // Transform data for NetflixCarousel component
  const transformMovieData = (movies) => {
    return movies?.map(movie => ({
      id: movie.id,
      title: movie.titleVi,
      originalTitle: movie.titleEn,
      englishTitle: movie.titleEn,
      poster: movie.posterUrl,
      thumbnail: movie.backdropUrl || movie.posterUrl,
      year: movie.year,
      rating: movie.averageRating || movie.imdbRating,
      imdb: movie.imdbRating,
      genres: movie.genres?.map(g => g.genre?.nameVi || g.nameVi),
      duration: movie.durationMinutes ? `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m` : null,
      quality: movie.quality,
      ageRating: movie.ageRating || 'PG-13',
      type: movie.type?.toLowerCase(),
      slug: movie.slug,
      seasons: movie.seasons?.length,
      episodes: movie.seasons?.reduce((total, season) => total + (season.episodes?.length || 0), 0)
    })) || [];
  };

  const retryFunctions = {
    popular: () => window.location.reload(),
    topRated: () => window.location.reload(),
    recent: () => window.location.reload(),
    korean: () => window.location.reload(),
    chinese: () => window.location.reload(),
    hollywood: () => window.location.reload(),
  };

  return (
    <div className="bg-gray-900 text-gray-100 font-sans min-h-screen">
      <Header />
      <HeroSection featuredMovie={transformMovieData(popularMovies)?.[0]} />
      
      {/* Netflix-style Carousels */}
      <div className="space-y-8 py-8">
        {/* Popular Movies */}
        <NetflixCarousel 
          title="Phim thịnh hành"
          movies={transformMovieData(popularMovies)}
          loading={popularLoading}
          error={popularError}
          onRetry={retryFunctions.popular}
          category="popular"
        />
        
        {/* Top Rated Movies */}
        <NetflixCarousel 
          title="Phim được đánh giá cao"
          movies={transformMovieData(topRatedMovies)}
          loading={topRatedLoading}
          error={topRatedError}
          onRetry={retryFunctions.topRated}
          category="top-rated"
        />

        {/* Recent Movies */}
        <NetflixCarousel 
          title="Phim mới cập nhật"
          movies={transformMovieData(recentMovies)}
          loading={recentLoading}
          error={recentError}
          onRetry={retryFunctions.recent}
          category="recent"
        />

        {/* Korean Movies */}
        <NetflixCarousel 
          title="Phim Hàn Quốc"
          movies={transformMovieData(koreanMovies)}
          loading={koreanLoading}
          error={koreanError}
          onRetry={retryFunctions.korean}
          category="korean"
        />

        {/* Chinese Movies */}
        <NetflixCarousel 
          title="Phim Trung Quốc"
          movies={transformMovieData(chineseMovies)}
          loading={chineseLoading}
          error={chineseError}
          onRetry={retryFunctions.chinese}
          category="chinese"
        />

        {/* Hollywood Movies */}
        <NetflixCarousel 
          title="Phim Hollywood"
          movies={transformMovieData(hollywoodMovies)}
          loading={hollywoodLoading}
          error={hollywoodError}
          onRetry={retryFunctions.hollywood}
          category="hollywood"
        />
      </div>
      
      <CategoriesSection />
      <Footer />
    </div>
  );
}
