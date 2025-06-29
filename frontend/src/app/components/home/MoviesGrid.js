'use client'
import MovieSlider from './MovieSlider';
import { moviesByRegion } from '../../data/moviesByRegion';

export default function MoviesGrid() {
  return (
    <section className="py-8 bg-gradient-to-b from-gray-900/50 to-transparent movie-grid-container overflow-visible">
      <div className="px-4 lg:px-6 space-y-20 lg:space-y-24 overflow-visible">
        {/* Korean Movies Section */}
        <div className="slider-section overflow-visible">
          <MovieSlider 
            title="Phim Hàn Quốc Mới"
            movies={moviesByRegion.korean}
            gradient="from-red-500 to-pink-600"
            sectionId="korean-movies"
          />
        </div>

        {/* Chinese Movies Section */}
        <div className="slider-section overflow-visible">
          <MovieSlider 
            title="Phim Trung Quốc Mới"
            movies={moviesByRegion.chinese}
            gradient="from-yellow-500 to-red-600"
            sectionId="chinese-movies"
          />
        </div>

        {/* Western Movies Section */}
        <div className="slider-section overflow-visible">
          <MovieSlider 
            title="Phim US-UK Mới"
            movies={moviesByRegion.western}
            gradient="from-blue-500 to-purple-600"
            sectionId="western-movies"
          />
        </div>
      </div>

      <style jsx>{`
        .movie-grid-container {
          overflow: visible !important;
          position: relative;
          z-index: 1;
          isolation: isolate;
          contain: layout style;
        }
        
        .slider-section {
          overflow: visible !important;
          position: relative;
          z-index: 1;
          isolation: isolate;
          contain: layout style;
        }
        
        /* Force all child elements to be overflow visible */
        :global(.movie-grid-container),
        :global(.movie-grid-container *),
        :global(.slider-section),
        :global(.slider-section *) {
          overflow: visible !important;
        }

        /* Ensure proper stacking context for hover overlays */
        :global(.movie-card:hover) {
          z-index: 996 !important;
          position: relative;
          isolation: isolate;
        }

        :global(.netflix-hover) {
          z-index: 999 !important;
          position: absolute !important;
          overflow: visible !important;
        }

        /* Remove any potential transform that might affect stacking */
        :global(.movie-grid-container),
        :global(.slider-section) {
          transform: none !important;
          will-change: auto !important;
        }
      `}</style>

    </section>
  );
}
