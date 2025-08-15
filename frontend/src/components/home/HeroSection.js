'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { featuredMovies } from '../../data/movies';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroSection({ featuredMovie }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainSwiperRef = useRef(null);

  // Use featured movie from props if available, otherwise use static data
  const movies = featuredMovie ? [featuredMovie] : featuredMovies;

  const handleThumbnailClick = (index) => {
    if (mainSwiperRef.current && mainSwiperRef.current.swiper) {
      mainSwiperRef.current.swiper.slideTo(index);
    }
  };

  const handleSlideChangeStart = () => {
    setIsTransitioning(true);
  };

  const handleSlideChangeEnd = () => {
    setIsTransitioning(false);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Main Swiper */}
      <Swiper
        ref={mainSwiperRef}
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        speed={800}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        onSlideChangeTransitionStart={handleSlideChangeStart}
        onSlideChangeTransitionEnd={handleSlideChangeEnd}
        className="h-full w-full"
        watchOverflow={true}
        touchRatio={0.8}
        style={{
          overflow: 'hidden',
          contain: 'layout style paint'
        }}
      >
        {movies.map((movie, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl lg:max-w-3xl">
                    {/* Movie Info Container */}
                    <div className={`text-white space-y-4 sm:space-y-6 transition-all duration-700 ${
                      isTransitioning ? 'opacity-0 transform translate-x-[-30px]' : 'opacity-100 transform translate-x-0'
                    }`}>
                      
                      {/* Movie Title */}
                      <div className="movie-title-container">
                        {movie.logo ? (
                          <Image
                            src={movie.logo}
                            alt={movie.title}
                            width={400}
                            height={150}
                            className="h-16 sm:h-20 md:h-32 w-auto object-contain"
                          />
                        ) : (
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            {movie.title}
                          </h1>
                        )}
                      </div>

                      {/* Movie Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded font-medium">
                          IMDb {movie.imdb}
                        </span>
                        <span className="border border-white/50 px-2 py-1 rounded">
                          {movie.ageRating}
                        </span>
                        <span>{movie.year}</span>
                        <span>{movie.duration || movie.episodes}</span>
                      </div>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre, idx) => (
                          <span
                            key={idx}
                            className="text-white/80 text-sm border-r border-white/30 pr-2 last:border-r-0"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-white/90 text-lg leading-relaxed max-w-xl">
                        {movie.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <button className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Xem Phim
                        </button>
                        <button className="bg-white/20 backdrop-blur text-white px-8 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                          Yêu Thích
                        </button>
                        <button className="bg-transparent border border-white/50 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                          Chi Tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails Section - Responsive positioning */}
      <div className="thumbnails-container">
        <div className="thumbnails-wrapper">
          {movies.map((thumbMovie, thumbIndex) => (
            <div
              key={thumbIndex}
              onClick={() => handleThumbnailClick(thumbIndex)}
              className={`thumbnail-item ${
                thumbIndex === activeIndex 
                  ? 'thumbnail-active' 
                  : 'thumbnail-inactive'
              }`}
            >
              <div className="thumbnail-image">
                <Image
                  src={thumbMovie.thumbnail}
                  alt={thumbMovie.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
                {thumbIndex === activeIndex && (
                  <div className="thumbnail-overlay">
                    <div className="play-button">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Hero Section Specific Styles */
        .hero-swiper {
          contain: layout style paint;
          position: relative;
          z-index: 1;
          overflow: hidden !important;
        }
        
        .hero-swiper .swiper-slide {
          will-change: opacity;
          backface-visibility: hidden;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        
        .hero-swiper .swiper-wrapper {
          overflow: hidden;
        }

        /* Custom Pagination Styles */
        .hero-swiper :global(.swiper-pagination) {
          bottom: 2rem !important;
          z-index: 20;
        }

        .hero-swiper :global(.swiper-pagination-bullet) {
          width: 12px !important;
          height: 12px !important;
          background: rgba(255, 255, 255, 0.3) !important;
          border-radius: 50% !important;
          margin: 0 6px !important;
          transition: all 0.3s ease !important;
        }

        .hero-swiper :global(.swiper-pagination-bullet-active) {
          background: white !important;
          transform: scale(1.2) !important;
        }

        /* Movie title animation */
        .movie-title-container {
          animation: slideInFromLeft 0.6s ease-out;
          position: relative;
          z-index: 10;
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Thumbnails responsive container */
        .thumbnails-container {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          z-index: 30;
          overflow: hidden;
        }
        
        /* Mobile: Bottom center */
        @media (max-width: 767px) {
          .thumbnails-container {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            bottom: 1rem;
          }
        }
        
        /* Tablet: Bottom right with some offset */
        @media (min-width: 768px) and (max-width: 1023px) {
          .thumbnails-container {
            right: 1.5rem;
            bottom: 2rem;
          }
        }
        
        /* Desktop: More offset */
        @media (min-width: 1024px) {
          .thumbnails-container {
            right: 6rem;
            bottom: 8rem;
          }
        }
        
        /* Large desktop: Max offset */
        @media (min-width: 1280px) {
          .thumbnails-container {
            right: 8rem;
            bottom: 8rem;
          }
        }

        .thumbnails-wrapper {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          overflow-x: auto;
          max-width: 100vw;
          
          /* Always horizontal layout */
          flex-direction: row;
        }

        .thumbnail-item {
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .thumbnail-active {
          transform: scale(1.1);
          opacity: 1;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .thumbnail-inactive {
          opacity: 0.7;
          transform: scale(1);
        }

        .thumbnail-inactive:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }

        .thumbnail-image {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          
          /* Mobile: Smaller size */
          width: 60px;
          height: 36px;
        }
        
        /* Tablet and up: Standard size */
        @media (min-width: 768px) {
          .thumbnail-image {
            width: 67px;
            height: 41px;
          }
        }
        
        /* Large desktop: Bigger size */
        @media (min-width: 1280px) {
          .thumbnail-image {
            width: 80px;
            height: 48px;
          }
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play-button {
          width: 1.5rem;
          height: 1.5rem;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Mobile: Smaller play button */
        @media (max-width: 767px) {
          .play-button {
            width: 1.25rem;
            height: 1.25rem;
          }
          
          .play-button svg {
            width: 0.625rem;
            height: 0.625rem;
          }
        }

        /* Custom scrollbar for thumbnails */
        .thumbnails-wrapper::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .thumbnails-wrapper::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .thumbnails-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 2px;
        }
        .thumbnails-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </section>
  );
}
