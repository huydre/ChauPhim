import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function formatTimeAgo(timestamp: string | Date): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} tháng trước`
}

export function generateMovieSchema(movie: any) {
  return {
    "@context": "https://schema.org",
    "@type": movie.type === "series" ? "TVSeries" : "Movie",
    "name": movie.title,
    "alternateName": movie.originalTitle,
    "description": movie.description,
    "datePublished": movie.year,
    "genre": movie.genres,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.rating,
      "ratingCount": movie.ratingCount || 100,
      "bestRating": 10,
      "worstRating": 1
    },
    "image": movie.poster,
    "thumbnail": movie.poster,
    "actor": movie.cast?.map((actor: any) => ({
      "@type": "Person",
      "name": actor.name
    })),
    "duration": movie.duration ? `PT${movie.duration}M` : undefined,
    "inLanguage": "vi",
    "subtitleLanguage": ["vi", "en"]
  }
}
