'use client';

import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import '../styles/netflix-carousel.css';
import { LoadingCarousel, ErrorMessage } from './ui/LoadingStates';

const NetflixCarousel = ({ title, movies = [], category, loading = false, error = null, onRetry }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const handleViewAll = () => {
    // Implement navigation to category page
    console.log(`Viewing all ${category} movies`);
  };

  const handlePlay = (movie) => {
    console.log(`Playing movie: ${movie.title}`);
  };

  const handleLike = (movie) => {
    console.log(`Liked movie: ${movie.title}`);
  };

  const handleDetails = (movie) => {
    window.location.href = `/phim/${movie.slug}`;
  };

  const slidePrev = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const slideNext = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleMouseEnter = (movieId) => {
    setHoveredCard(movieId);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set timeout for expansion after 1.5s
    hoverTimeoutRef.current = setTimeout(() => {
      setExpandedCard(movieId);
    }, 1000);
  };

  const handleMouseLeave = () => {
    // Clear timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    setHoveredCard(null);
    setExpandedCard(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Prevent showing carousel until movies are loaded
  if (!movies || movies.length === 0) {
    return (
      <div className="relative mb-8 lg:mb-12 netflix-carousel">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-4 lg:mb-6 px-4 lg:px-8">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-0 lg:mb-2">
            {title}
          </h2>
        </div>
        <div className="px-4 lg:px-8">
          <div className="flex space-x-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 aspect-video bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return <LoadingCarousel title={title} />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error.message || "Không thể tải dữ liệu"} onRetry={onRetry} />;
  }

  // Show empty state
  if (!movies || movies.length === 0) {
    return (
      <div className="mx-4 md:mx-8 my-8">
        <h2 className="text-white text-xl font-bold mb-4">{title}</h2>
        <div className="text-gray-400 text-center py-8">Không có phim nào để hiển thị</div>
      </div>
    );
  }

  return (
    <div className="relative mb-8 lg:mb-12 netflix-carousel">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-4 lg:mb-6 px-4 lg:px-8 -z-10">
        <div className="flex items-center justify-between lg:block">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-0 lg:mb-2 -z-10">
            {title}
          </h2>
          <button 
            onClick={handleViewAll}
            className="lg:hidden text-sm text-gray-400 hover:text-white transition-colors duration-200"
          >
            Xem toàn bộ →
          </button>
        </div>
        <button 
          onClick={handleViewAll}
          className="hidden lg:block text-sm text-gray-400 hover:text-white transition-colors duration-200 mb-1"
        >
          Xem toàn bộ →
        </button>
      </div>

      {/* Carousel */}
      <div className="relative group">
        <Swiper
          ref={swiperRef}
          modules={[Navigation, FreeMode]}
          spaceBetween={8}
          slidesPerView={1.8}
          slidesPerGroup={1}
          navigation={false}
          freeMode={true}
          watchSlidesProgress={true}
          onSlideChange={handleSlideChange}
          onInit={handleSlideChange}
          breakpoints={{
            640: {
              slidesPerView: 2.5,
              slidesPerGroup: 2,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 3.2,
              slidesPerGroup: 3,
              spaceBetween: 12,
            },
            1024: {
              slidesPerView: 4.2,
              slidesPerGroup: 4,
              spaceBetween: 14,
            },
            1280: {
              slidesPerView: 5.2,
              slidesPerGroup: 5,
              spaceBetween: 16,
            },
            1536: {
              slidesPerView: 6.2,
              slidesPerGroup: 6,
              spaceBetween: 18,
            }
          }}
          className="px-4 lg:px-8"
        >
          {movies?.map((movie, index) => (
            <SwiperSlide key={movie.id} className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.01 }}
                className="relative group/card"
                onMouseEnter={() => handleMouseEnter(movie.id)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(movie.id)}
                onBlur={handleMouseLeave}
                style={{ zIndex: expandedCard === movie.id ? 999 : 1 }}
                role="button"
                tabIndex={0}
                aria-label={`Xem phim ${movie.title}`}
              >
                {/* Movie Card */}
                <motion.div
                  animate={{
                    scale: expandedCard === movie.id ? 1.4 : 1,
                    y: expandedCard === movie.id ? -30 : 0,
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="relative bg-gray-900 rounded-lg overflow-visible cursor-pointer"
                  onClick={() => handleDetails(movie)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={movie.thumbnail || movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Age rating badge */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                        {movie.ageRating}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3">
                    {/* Title */}
                    <h3 className="text-white font-semibold text-sm lg:text-base mb-1 line-clamp-2">
                      {movie.title}
                    </h3>
                    
                    {/* Original title */}
                    {movie.originalTitle && (
                      <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                        {movie.originalTitle}
                      </p>
                    )}

                    {/* Basic info for non-hovered state */}
                    {expandedCard !== movie.id && (
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{movie.year}</span>
                        {movie.type === 'series' && movie.seasons && (
                          <span>• {movie.seasons} mùa</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hover Content */}
                  {expandedCard === movie.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden min-h-full"
                      style={{ 
                        width: '100%',
                        minHeight: '380px',
                        height: 'auto',
                        zIndex: 30,
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={movie.thumbnail || movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Age rating badge */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                            {movie.ageRating}
                          </span>
                        </div>
                      </div>

                      {/* Hover Content */}
                      <div className="p-4 flex-1">
                        {/* Title */}
                        <h3 className="text-white font-bold text-base mb-1">
                          {movie.title}
                        </h3>
                        
                        {/* Original title */}
                        {movie.originalTitle && movie.originalTitle !== movie.title && (
                          <p className="text-gray-400 text-sm mb-3">
                            {movie.originalTitle}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlay(movie);
                            }}
                            className="flex-1 bg-white text-black font-semibold py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>Xem ngay</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(movie);
                            }}
                            className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
                            title="Thích"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDetails(movie);
                            }}
                            className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-200"
                            title="Chi tiết"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>

                        {/* Movie details */}
                        <div className="space-y-3">
                          {/* Year, duration, type */}
                          <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400">
                            <span className="bg-gray-800 px-2 py-1 rounded">{movie.year}</span>
                            {movie.duration && <span className="bg-gray-800 px-2 py-1 rounded">{movie.duration}</span>}
                            {movie.type === 'series' && movie.seasons && (
                              <span className="bg-gray-800 px-2 py-1 rounded">{movie.seasons} mùa</span>
                            )}
                            {movie.type === 'series' && movie.episodes && (
                              <span className="bg-gray-800 px-2 py-1 rounded">{movie.episodes} tập</span>
                            )}
                          </div>

                          {/* IMDB rating */}
                          {movie.imdb && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <span className="text-yellow-500 text-sm font-semibold">{movie.imdb}</span>
                              <span className="text-gray-400 text-xs">IMDB</span>
                            </div>
                          )}

                          {/* Genres */}
                          {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {movie.genres.map((genre, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons */}
        <button 
          onClick={slidePrev}
          disabled={isBeginning}
          className={`swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-r-md transition-all duration-200 ${
            isBeginning 
              ? 'opacity-0 cursor-not-allowed' 
              : 'opacity-0 group-hover:opacity-100 hover:scale-110'
          } disabled:opacity-0`}
          aria-label="Slide previous"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={slideNext}
          disabled={isEnd}
          className={`swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-l-md transition-all duration-200 ${
            isEnd 
              ? 'opacity-0 cursor-not-allowed' 
              : 'opacity-0 group-hover:opacity-100 hover:scale-110'
          } disabled:opacity-0`}
          aria-label="Slide next"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NetflixCarousel;
