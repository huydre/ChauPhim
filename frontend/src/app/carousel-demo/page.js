'use client';

import NetflixCarousel from '../components/NetflixCarousel';
import { featuredMovies, movieCategories } from '../data/movies';

export default function CarouselDemo() {
  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto">
        <h1 className="text-white text-4xl font-bold mb-8 text-center">
          Netflix-Style Carousel Demo
        </h1>
        
        <div className="space-y-12">
          <NetflixCarousel 
            title="Phim nổi bật" 
            movies={featuredMovies} 
            category="featured" 
          />
          
          <NetflixCarousel 
            title="Phim Hàn Quốc mới" 
            movies={movieCategories.korean} 
            category="korean" 
          />
          
          <NetflixCarousel 
            title="Phim Trung Quốc hay" 
            movies={movieCategories.chinese} 
            category="chinese" 
          />
          
          <NetflixCarousel 
            title="Phim Hollywood" 
            movies={movieCategories.hollywood} 
            category="hollywood" 
          />
        </div>
      </div>
    </div>
  );
}
