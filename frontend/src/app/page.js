'use client';
import SplashHero from '@/components/splash/SplashHero';
import ContentSection from '@/components/splash/ContentSection';

export default function Home() {
  return (
    <div className="bg-background text-gray-100 font-sans">
      {/* Hero Section */}
      <SplashHero />

      {/* Content Section */}
      <ContentSection />
    </div>
  );
}
