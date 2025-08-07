import Header from '../components/Header';
import HeroSection from '../components/home/HeroSection';
import FilterSection from '../components/home/FilterSection';
import CategoriesSection from '../components/home/CategoriesSection';
import NetflixCarousel from '../components/NetflixCarousel';
import Footer from '../components/Footer';
import { featuredMovies, movieCategories } from '../data/movies';

export default function PhimHay() {
  return (
    <div className="bg-gray-900 text-gray-100 font-sans min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Netflix-style Carousels */}
      <div className="space-y-8 py-8">
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
      
      <CategoriesSection />
      {/* <FilterSection /> */}
      <Footer />
    </div>
  );
}
