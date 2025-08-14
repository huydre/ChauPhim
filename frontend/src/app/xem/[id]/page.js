import Header from '@/components/Header';
import WatchMovieClient from '@/components/WatchMovieClient';
import apiClient from '@/lib/api-client';
import { 
  transformMovieData, 
  transformRecommendedMovies, 
  transformCommentsData 
} from '@/lib/movie-utils';

export async function generateMetadata({ params }) {
  try {
    const response = await apiClient.getMovieBySlug(params.id);
    const movieData = response.data;

    return {
      title: `${movieData.titleVi || movieData.titleEn} - Xem phim online HD | ChauPhim`,
      description: movieData.descriptionVi || movieData.descriptionEn || '',
      openGraph: {
        title: `${movieData.titleVi || movieData.titleEn} - Xem phim online HD`,
        description: movieData.descriptionVi || movieData.descriptionEn || '',
        images: [movieData.backdropUrl || movieData.posterUrl],
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: movieData.titleVi || movieData.titleEn,
        description: movieData.descriptionVi || movieData.descriptionEn || '',
        images: [movieData.backdropUrl || movieData.posterUrl],
      },
    };
  } catch (error) {
    console.error('Error fetching movie metadata:', error);
    return {
      title: 'Xem phim online HD | ChauPhim',
      description: 'Xem phim online miễn phí chất lượng cao',
    };
  }
}

export default async function WatchMoviePage({ params }) {
  try {
    // Fetch movie data from API
    const [movieResponse, recommendationsResponse, commentsResponse] = await Promise.all([
      apiClient.getMovieBySlug(params.id),
      apiClient.getMovieRecommendations(params.id, 6),
      apiClient.getMovieComments(params.id, { limit: 10, sort: 'newest' })
    ]);

    const movieData = movieResponse.data;
    const recommendedMovies = recommendationsResponse.data;
    const commentsData = commentsResponse.data;

    // Transform data using utility functions
    const transformedMovieData = transformMovieData(movieData);
    const transformedRecommendations = transformRecommendedMovies(recommendedMovies);
    const transformedComments = transformCommentsData(commentsData);

    return (
      <div className="min-h-screen bg-brand-bg text-brand-text-primary font-sans">
        <Header />
        <WatchMovieClient 
          movieData={transformedMovieData}
          recommendedMovies={transformedRecommendations}
          commentsData={transformedComments}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching movie data:', error);
    
    // Fallback to show error page or redirect
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text-primary font-sans">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim</h1>
            <p className="text-gray-400 mb-4">Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }
}
