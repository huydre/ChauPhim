import Header from '../components/Header';
import HeroSection from '../components/home/HeroSection';
import FilterSection from '../components/home/FilterSection';
import MoviesGrid from '../components/home/MoviesGrid';
import CategoriesSection from '../components/home/CategoriesSection';
import Footer from '../components/Footer';

export default function PhimHay() {
  return (
    <div className="bg-background text-gray-100 font-sans min-h-screen">
      <Header />
      <HeroSection />
      <FilterSection />
      <MoviesGrid />
      <CategoriesSection />
      <Footer />
    </div>
  );
}
