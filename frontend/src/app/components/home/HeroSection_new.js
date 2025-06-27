'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Thumbs, EffectFade } from 'swiper/modules';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { featuredMovies } from '../../data/movies';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';

export default function HeroSection() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainSwiperRef = useRef(null);

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
    <section className="relative">
      {/* Main Swiper */}
      <Swiper
        ref={mainSwiperRef}
        modules={[Pagination, Autoplay, Thumbs, EffectFade]}
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
        }}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white/50',
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-white',
        }}
        thumbs={thumbsSwiper ? { swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null } : null}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        onSlideChangeTransitionStart={handleSlideChangeStart}
        onSlideChangeTransitionEnd={handleSlideChangeEnd}
        className="h-screen"
      >
        {featuredMovies.map((movie, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    {/* Movie Info */}
                    <div className={`text-white space-y-6 transition-all duration-800 ${
                      isTransitioning ? 'opacity-0 transform translate-x-[-30px]' : 'opacity-100 transform translate-x-0'
                    }`}>
                      {/* Movie Logo or Title */}
                      <div className="movie-title-container">
                        {movie.logo ? (
                          <Image
                            src={movie.logo}
                            alt={movie.title}
                            width={400}
                            height={150}
                            className="h-20 md:h-32 w-auto object-contain"
                          />
                        ) : (
                          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
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

      {/* Thumbnails Section - Horizontal at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
        <div className="container mx-auto px-4 pb-8 pt-16">
          <div className="flex justify-center">
            <div className="flex gap-4 overflow-x-auto max-w-full pb-4">
              {featuredMovies.map((thumbMovie, thumbIndex) => (
                <div
                  key={thumbIndex}
                  onClick={() => handleThumbnailClick(thumbIndex)}
                  className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                    thumbIndex === activeIndex 
                      ? 'scale-110 opacity-100 ring-2 ring-white shadow-lg' 
                      : 'opacity-70 hover:opacity-90 hover:scale-105'
                  }`}
                >
                  <div className="relative w-[67px] h-[41px] rounded-lg overflow-hidden">
                    <Image
                      src={thumbMovie.thumbnail}
                      alt={thumbMovie.title}
                      fill
                      className="object-cover"
                    />
                    {thumbIndex === activeIndex && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
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
        </div>
      </div>

      {/* Hidden Thumbs Swiper for syncing */}
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[Thumbs]}
        spaceBetween={0}
        slidesPerView={featuredMovies.length}
        watchSlidesProgress={true}
        className="hidden"
      >
        {featuredMovies.map((movie, index) => (
          <SwiperSlide key={`thumb-${index}`}>
            <div></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        .movie-title-container {
          animation: slideInFromLeft 0.8s ease-out;
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Custom scrollbar for thumbnails */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 2px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </section>
  );
}
