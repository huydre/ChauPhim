import MovieCard from './MovieCard';

export default function MoviesGrid() {
  const movies = [
    { title: "Avengers: Endgame", year: "2025", quality: "4K" },
    { title: "Spider-Man: No Way Home", year: "2025", quality: "HD" },
    { title: "The Batman", year: "2025", quality: "4K" },
    { title: "Top Gun: Maverick", year: "2025", quality: "HD" },
    { title: "Black Panther 2", year: "2025", quality: "4K" },
    { title: "Doctor Strange 2", year: "2025", quality: "HD" },
    { title: "Thor: Love and Thunder", year: "2025", quality: "4K" },
    { title: "Jurassic World 3", year: "2025", quality: "HD" },
    { title: "Fast & Furious 10", year: "2025", quality: "4K" },
    { title: "Mission Impossible 7", year: "2025", quality: "HD" },
    { title: "John Wick 4", year: "2025", quality: "4K" },
    { title: "Scream 6", year: "2025", quality: "HD" },
    { title: "Avatar 2", year: "2025", quality: "4K" },
    { title: "Indiana Jones 5", year: "2025", quality: "HD" },
    { title: "Transformers 7", year: "2025", quality: "4K" },
    { title: "Guardians of Galaxy 3", year: "2025", quality: "HD" },
    { title: "The Flash", year: "2025", quality: "4K" },
    { title: "Aquaman 2", year: "2025", quality: "HD" }
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8">Phim Nổi Bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map((movie, index) => (
            <MovieCard 
              key={index}
              title={movie.title}
              year={movie.year}
              quality={movie.quality}
              index={index}
            />
          ))}
        </div>
        
        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
            Xem thêm phim
          </button>
        </div>
      </div>
    </section>
  );
}
