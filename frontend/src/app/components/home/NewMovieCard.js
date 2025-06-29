"use client";
import { useState } from "react";
import Image from "next/image";

export default function MovieCard({ movie, index }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getSubtitleColor = (subtitle) => {
    switch (subtitle) {
      case "PĐ":
        return "bg-green-500";
      case "TM":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="group relative bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer movie-card-container w-[260px] sm:w-[280px] lg:w-[300px] flex-shrink-0 shadow-lg hover:shadow-2xl">
      {/* Movie Thumbnail with hover effects */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-700 z-0">
        {!imageError ? (
          <>
            <Image
              src={movie.thumbnail}
              alt={movie.titleVn}
              fill
              sizes="(max-width: 640px) 260px, (max-width: 768px) 280px, 300px"
              className={`object-cover transition-all duration-300 group-hover:brightness-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/W3Hx7GbNKi2sADMVeNcQ=="
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="text-gray-500 text-xs">Loading...</div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-500 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h3zm2-1v1h6V3H9zm-2 3v12h10V6H7z"
                />
              </svg>
              <p className="text-gray-400 text-xs">No Image</p>
            </div>
          </div>
        )}

        {/* Dark gradient overlay on bottom for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Subtitle Badge - Always visible */}
        <div
          className={`absolute bottom-2 left-2 ${getSubtitleColor(
            movie.subtitle
          )} text-white text-xs px-2 py-1 rounded-full font-semibold z-10`}
        >
          {movie.subtitle}
        </div>
      </div>

      {/* Basic Info - Always visible */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {movie.titleVn}
        </h3>
        <p className="text-gray-400 text-xs line-clamp-1">
          {movie.titleOriginal}
        </p>
      </div>

      {/* Hover Overlay Content - Scale up from center */}
      <div className="absolute z-[1000] inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/60 opacity-0 group-hover:opacity-100 transform scale-100 group-hover:scale-140 transition-all duration-300 ease-out flex flex-col justify-end hover-content rounded-xl">
        {/* Thumbnail - Full width, no borders */}
        <div className="relative w-full h-16 mb-4 bg-gray-700">
          {!imageError ? (
            <Image
              src={movie.thumbnail}
              alt={movie.titleVn}
              fill
              sizes="(max-width: 640px) 450px, (max-width: 768px) 370px, 390px"
              className="object-cover rounded-xl"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Movie Titles */}
          <div className="mb-4 text-center pt-2">
            <h3 className="text-white font-bold text-md mb-1 leading-tight">
              {movie.titleVn}
            </h3>
            <p className="text-gray-300 text-xs italic">
              {movie.titleOriginal}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            {/* Nút Xem ngay - Yellow prominent */}
            <button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-1 px-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Xem ngay
            </button>

            {/* Nút Thích */}
            <button className="bg-gray-700/80 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Nút Chi tiết */}
            <button className="bg-gray-700/80 hover:bg-blue-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {/* Movie Metadata Tags */}
          <div className="space-y-2">
            {/* Top row: Age rating, Year, Series info */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                {movie.ageRating}
              </span>
              <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
                {movie.year}
              </span>
              {movie.type === "series" && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  P{movie.seasons} - T{movie.episodes}
                </span>
              )}
            </div>

            {/* Bottom row: Genres */}
            <div className="flex items-center gap-1 flex-wrap">
              {movie.genres.slice(0, 3).map((genre, idx) => (
                <span
                  key={idx}
                  className="bg-gray-600/80 text-gray-200 px-2 py-1 rounded-full text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .movie-card-container {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform;
          margin-bottom: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(55, 65, 81, 0.5);
        }

        /* Gentle scale on hover with smooth animation */
        .movie-card-container:hover {
          transform: scale(1.03);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.8);
          border-color: rgba(75, 85, 99, 0.8);
          z-index: 999;
          position: relative;
        }

        /* Smooth transitions for all hover effects */
        .movie-card-container * {
          transition: all 0.3s ease-out;
        }

        /* Ensure parent containers don't clip and add spacing */
        :global(.swiper-slide) {
          overflow: visible !important;
          padding: 30px 15px;
          margin: 0 -15px;
        }

        :global(.slider-container) {
          overflow: visible !important;
          padding: 50px 0;
        }

        /* Enhanced shadow on deep hover */
        .movie-card-container:hover {
          filter: brightness(1.05);
        }

        /* Smooth fade and scale animations */
        @keyframes scaleUpFade {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .movie-card-container:hover .hover-content {
          animation: scaleUpFade 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
