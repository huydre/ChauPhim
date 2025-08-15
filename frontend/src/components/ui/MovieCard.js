'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MovieCard({ movie, size = 'default' }) {
  const sizeClasses = {
    small: {
      container: 'w-40',
      image: 'aspect-[2/3] h-60',
      title: 'text-sm',
      subtitle: 'text-xs'
    },
    default: {
      container: 'w-48',
      image: 'aspect-[2/3] h-72',
      title: 'text-base',
      subtitle: 'text-sm'
    },
    large: {
      container: 'w-56',
      image: 'aspect-[2/3] h-84',
      title: 'text-lg',
      subtitle: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  const formatGenres = (genres) => {
    if (!genres || !Array.isArray(genres)) return '';
    return genres.slice(0, 2).map(g => g.genre?.nameVi || g.nameVi).join(', ');
  };

  const getImageUrl = (url) => {
    if (!url) return '/api/placeholder/300/450';
    if (url.startsWith('http')) return url;
    return `/api/placeholder/300/450`;
  };

  return (
    <div className={`${classes.container} flex-shrink-0 group cursor-pointer`}>
      <Link href={`/phim/${movie.slug}`}>
        <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
          {/* Movie Poster */}
          <div className={`${classes.image} relative overflow-hidden`}>
            <Image
              src={getImageUrl(movie.posterUrl)}
              alt={movie.titleVi}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
            
            {/* Overlay with rating */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between text-white text-xs">
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                    ⭐ {movie.averageRating ? movie.averageRating.toFixed(1) : movie.imdbRating || 'N/A'}
                  </span>
                  <span className="bg-gray-800/80 px-2 py-1 rounded">
                    {movie.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Quality badge */}
            {movie.quality && (
              <div className="absolute top-2 right-2">
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                  {movie.quality}
                </span>
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-yellow-500 rounded-full p-3 shadow-lg">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-3">
            <h3 className={`${classes.title} font-semibold text-white mb-1 line-clamp-2 group-hover:text-yellow-500 transition-colors`}>
              {movie.titleVi}
            </h3>
            
            {movie.titleEn && movie.titleEn !== movie.titleVi && (
              <p className={`${classes.subtitle} text-gray-400 mb-2 line-clamp-1`}>
                {movie.titleEn}
              </p>
            )}

            <div className="space-y-1">
              {movie.genres && movie.genres.length > 0 && (
                <p className="text-xs text-gray-500">
                  {formatGenres(movie.genres)}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{movie.year}</span>
                {movie.durationMinutes && (
                  <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                )}
              </div>

              {(movie.viewsCount || movie._count?.ratings) && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {movie.viewsCount && (
                    <span>👁 {Number(movie.viewsCount).toLocaleString()}</span>
                  )}
                  {movie._count?.ratings && (
                    <span>📝 {movie._count.ratings}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
