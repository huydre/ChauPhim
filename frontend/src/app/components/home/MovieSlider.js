'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel } from 'swiper/modules';
import { useState, useRef } from 'react';
import NewMovieCard from './NewMovieCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

export default function MovieSlider({ title, movies, gradient, sectionId }) {
  const [swiper, setSwiper] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="mb-16 relative isolate py-8">
      {/* Desktop Layout: Title & Button on Left, Mobile: On Top */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 lg:mb-8">
        {/* Title and View All Button Container */}
        <div className="flex flex-col lg:w-64 lg:mr-8 mb-4 lg:mb-0">
          <h2 className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2 lg:mb-4`}>
            {title}
          </h2>
          
          {/* View All Button */}
          <button className="text-white hover:text-blue-400 font-semibold transition-colors duration-200 flex items-center gap-2 self-start">
            Xem toàn bộ
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Slider Container - Takes remaining space on desktop */}
        <div className="flex-1 lg:min-w-0 relative">
          {/* Navigation Buttons */}
          <button 
            ref={prevRef}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[200] w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed nav-button"
            onClick={() => swiper?.slidePrev()}
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <button 
            ref={nextRef}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[200] w-10 h-10 lg:w-12 lg:h-12 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed nav-button"
            onClick={() => swiper?.slideNext()}
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Movie Slider */}
          <div className="relative px-14 lg:px-16 slider-container overflow-visible">
            <Swiper
              modules={[Navigation, Mousewheel]}
              spaceBetween={16}
              slidesPerView="auto"
              watchOverflow={true}
              speed={400}
              allowTouchMove={true}
              grabCursor={true}
              mousewheel={{
                forceToAxis: true,
                sensitivity: 0.8,
                releaseOnEdges: true,
              }}
              breakpoints={{
                640: {
                  spaceBetween: 16,
                },
                768: {
                  spaceBetween: 20,
                },
                1024: {
                  spaceBetween: 20,
                },
                1280: {
                  spaceBetween: 24,
                },
                1536: {
                  spaceBetween: 24,
                },
              }}
              onSwiper={setSwiper}
              className="movie-slider-swiper"
            >
              {movies.map((movie, index) => (
                <SwiperSlide key={movie.id} style={{ width: 'auto' }}>
                  <NewMovieCard movie={movie} index={index} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <style jsx>{`
        .movie-slider-swiper {
          overflow: visible !important;
          margin: 60px 0;
          padding: 50px 0;
        }
        
        .slider-container {
          overflow: visible !important;
          padding: 30px 0;
        }
        
        .nav-button {
          backdrop-filter: blur(8px);
        }
        
        .nav-button:hover {
          backdrop-filter: blur(12px);
        }
        
        :global(.movie-slider-swiper .swiper-wrapper) {
          overflow: visible !important;
        }
        
        :global(.movie-slider-swiper .swiper-slide) {
          width: auto !important;
          flex-shrink: 0;
          overflow: visible !important;
          margin: 0 20px;
          padding: 30px 0;
        }
        
        /* Ensure hover cards don't overlap next cards */
        :global(.movie-card-container) {
          isolation: isolate;
        }
        
        :global(.movie-card-container:hover) {
          z-index: 999 !important;
          position: relative;
        }
      `}</style>
    </div>
  );
}
