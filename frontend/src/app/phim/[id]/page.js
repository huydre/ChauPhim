'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import apiClient from '@/lib/api-client';
import LikeIcon from '@/assets/LikeIcon';
import AddIcon from '@/assets/AddIcon';
import ShareIcon from '@/assets/ShareIcon';
import CommentIcon from '@/assets/CommentIcon';

export default function MovieDetailPage({ params }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState('thuyetminh');
  const [newComment, setNewComment] = useState('');
  const [movieData, setMovieData] = useState(null);
  const [comments, setComments] = useState([]);
  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details
        const movieResponse = await apiClient.getMovieBySlug(resolvedParams.id);
        setMovieData(movieResponse.data);

        // Fetch cast
        const castResponse = await apiClient.getMovieCast(resolvedParams.id);
        setCast(castResponse.data);

        // Fetch comments
        const commentsResponse = await apiClient.getMovieComments(resolvedParams.id, { limit: 10 });
        setComments(commentsResponse.data);

        // Fetch recommendations
        const recommendationsResponse = await apiClient.getMovieRecommendations(resolvedParams.id, 5);
        setRecommendations(recommendationsResponse.data);

      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        setMovieData({
          id: resolvedParams.id,
          titleVi: 'Thám Tử Lừng Danh Conan Movie 27: Ngôi Sao 5 Cánh 1 Triệu Đô',
          titleEn: 'Detective Conan Movie 27: The Million Dollar Pentagram',
          backdropUrl: '/api/placeholder/1920/800',
          posterUrl: '/api/placeholder/300/450',
          averageRating: 9.0,
          genres: [
            { genre: { nameVi: 'Hành động' } },
            { genre: { nameVi: 'Trinh thám' } },
            { genre: { nameVi: 'Tội phạm' } },
            { genre: { nameVi: 'Hoạt hình' } }
          ],
          durationMinutes: 110,
          year: 2024,
          originCountry: ['JP'],
          descriptionVi: 'Trong phần phim mới nhất của series Thám tử lừng danh Conan, một vụ án bí ẩn xoay quanh viên kim cương có giá trị lên đến 1 triệu đô la Mỹ. Conan và những người bạn sẽ phải đối mặt với những thử thách mới và khám phá ra những bí mật đen tối đằng sau vụ án này.',
          movieSources: [
            { id: 1, subtitlesJson: [
              { lang: 'vi', label: 'Thuyết minh' },
              { lang: 'vi-sub', label: 'Vietsub' }
            ]}
          ]
        });

        setCast([
          { id: 1, name: 'Minami Takayama', character: 'Conan Edogawa', avatarUrl: '/api/placeholder/80/80' },
          { id: 2, name: 'Wakana Yamazaki', character: 'Ran Mouri', avatarUrl: '/api/placeholder/80/80' },
          { id: 3, name: 'Rikiya Koyama', character: 'Kogoro Mouri', avatarUrl: '/api/placeholder/80/80' },
          { id: 4, name: 'Megumi Hayashibara', character: 'Ai Haibara', avatarUrl: '/api/placeholder/80/80' }
        ]);

        setComments([
          {
            id: 1,
            user: { name: 'Nguyễn Văn A', avatarUrl: '/api/placeholder/40/40' },
            content: 'Phim hay quá! Tình tiết hấp dẫn và lôi cuốn từ đầu đến cuối.',
            createdAt: '2 giờ trước'
          },
          {
            id: 2,
            user: { name: 'Trần Thị B', avatarUrl: '/api/placeholder/40/40' },
            content: 'Conan vẫn luôn là series anime yêu thích của mình. Phần này không làm tôi thất vọng!',
            createdAt: '5 giờ trước'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [resolvedParams.id]);

  const topMovies = [
    { rank: 1, titleVi: 'One Piece Film Red', episodes: 'Full HD', posterUrl: '/api/placeholder/60/80' },
    { rank: 2, titleVi: 'Your Name', episodes: 'Full HD', posterUrl: '/api/placeholder/60/80' },
    { rank: 3, titleVi: 'Spirited Away', episodes: 'Full HD', posterUrl: '/api/placeholder/60/80' },
    { rank: 4, titleVi: 'Demon Slayer Movie', episodes: 'Full HD', posterUrl: '/api/placeholder/60/80' },
    { rank: 5, titleVi: 'Attack on Titan Final', episodes: '24/24', posterUrl: '/api/placeholder/60/80' }
  ];

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        // In a real app, you'd need authentication
        console.log('Gửi bình luận:', newComment);
        setNewComment('');
        
        // Add comment to local state optimistically
        const newCommentObj = {
          id: Date.now(),
          user: { name: 'Bạn', avatarUrl: '/api/placeholder/40/40' },
          content: newComment,
          createdAt: 'Vừa xong'
        };
        setComments(prev => [newCommentObj, ...prev]);
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
          <span className="ml-3">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error && !movieData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy phim</h1>
            <p className="text-gray-400 mb-4">Phim bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link href="/demo" className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours}h ${mins}m`;
    };

    const formatOriginCountry = (country) => {

    };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header />

      {/* Banner */}
      <div className="relative h-[526px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={movieData.backdropUrl || '/api/placeholder/1920/800'}
            alt={movieData.titleVi}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
      </div>

        <div className='container mx-auto flex'>
            <div className='w-full xl:w-1/3 space-y-4'>
                <div className="">
                  <Image
                    src={movieData.posterUrl || '/api/placeholder/300/450'}
                    alt={movieData.titleVi}
                    width={120}
                    height={180}
                    className="rounded-sm"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2">{movieData.titleVi}</h2>
                <span className="text-md md:text-md text-[#FFD875] mb-6">{movieData.titleEn}</span>
                <div className='flex items-center gap-2 mb-4 mt-4'>
                    <span className='bg-white text-[#15151F] text-xs font-bold px-2 py-1.5 rounded-sm'>
                        {movieData?.ageRating}
                    </span>
                    <span className='text-white text-xs font-bold px-2 py-1.5 rounded-sm outline-1 outline-white'> 
                        {movieData?.year}
                    </span>
                    <span className='text-white text-xs font-bold px-2 py-1.5 rounded-sm outline-1 outline-white'>
                        {formatDuration(movieData?.durationMinutes)}
                    </span>
                </div>
                <div className='flex items-center gap-2 mb-4'>
                    {
                        movieData?.genres?.map((genre, index) => (
                            <span key={index} className='text-white text-xs font-medium px-2 py-1.5 rounded-sm bg-gray-700'>
                                {genre.genre.nameVi}
                            </span>
                        ))
                    }
                </div>
                <div>
                    <div className='font-bold text-sm mb-2'>Giới thiệu:</div>
                    <div className='text-sm text-gray-400'>{movieData?.descriptionVi}</div>
                </div>
                <div>
                    <div className='font-bold text-sm mb-4'>Thời lượng: <span className='text-sm text-gray-400 font-medium'>{formatDuration(movieData?.durationMinutes)}</span></div>
                    <div className='font-bold text-sm mb-4'>Năm sản xuất: <span className='text-sm text-gray-400 font-medium'>{movieData?.year}</span></div>
                    <div className='font-bold text-sm mb-4'>Quốc gia: <span className='text-sm text-gray-400 font-medium'>{formatOriginCountry(movieData?.originCountry)}</span></div>
                    <div className='font-bold text-sm mb-4'>Đạo diễn: <span className='text-sm text-gray-400 font-medium'>Chika Nagaoka</span></div>
                </div>
            </div>
            <div className='xl:w-2/3 pl-6 rounded-tl-xl bg-gray-900 '>
                <div className="flex gap-4 ">
                    <Link 
                    href={`/xem/${resolvedParams.id}`}
                    //gradient from yellow to orange
                    className="bg-gradient-to-r from-[#fecf59] to-[#fff1cc] hover:bg-gradient-to-l text-black px-8 py-3 rounded-full font-semibold text-lg transition-colors inline-flex items-center"
                    >
                        <span className='mr-2'>▶</span>
                        Xem Ngay
                    </Link>
                    <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                        <div className=''><LikeIcon/></div>
                        Yêu thích
                    </button>
                    <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                        <div className=''><AddIcon/></div>
                        Thêm vào
                    </button>
                    <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                        <div className=''><ShareIcon/></div>
                        Chia sẻ
                    </button>
                    <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                        <div className=''><CommentIcon/></div>
                        Bình luận
                    </button>
                    <button className='flex items-center gap-2 bg-[#3556b6] px-2 rounded-full'>
                        <Image
                            src="/logo.svg"
                            alt="ChauPhim Logo"
                            width={25}
                            height={25} 
                            className="brightness-0 invert"/>
                        <span className='font-bold text-sm'>9.9</span>
                        <span className='text-xs underline'>Đánh giá</span>
                    </button>
                </div>
            </div>
        </div>


      
    </div>
  );
}
