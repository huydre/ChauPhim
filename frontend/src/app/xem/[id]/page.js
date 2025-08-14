'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/components/movie/VideoPlayer';

export default function WatchMoviePage({ params }) {
  const resolvedParams = use(params);
  const [currentEpisode, setCurrentEpisode] = useState('thuyetminh');
  
  // Dữ liệu mẫu
  const movieData = {
    id: resolvedParams.id,
    titleVi: 'Thám Tử Lừng Danh Conan Movie 27: Ngôi Sao 5 Cánh 1 Triệu Đô',
    titleEn: 'Detective Conan Movie 27: The Million Dollar Pentagram',
    videoSources: {
      thuyetminh: '/api/placeholder/video/thuyetminh.mp4',
      vietsub: '/api/placeholder/video/vietsub.mp4'
    },
    poster: '/api/placeholder/300/450',
    year: 2024,
    rating: 9.0
  };

  const relatedMovies = [
    { id: 1, title: 'Conan Movie 26', thumbnail: '/api/placeholder/150/200', year: 2023 },
    { id: 2, title: 'Conan Movie 25', thumbnail: '/api/placeholder/150/200', year: 2022 },
    { id: 3, title: 'Conan Movie 24', thumbnail: '/api/placeholder/150/200', year: 2021 },
    { id: 4, title: 'One Piece Film Red', thumbnail: '/api/placeholder/150/200', year: 2022 },
  ];

  const servers = [
    { name: 'Server 1', status: 'active' },
    { name: 'Server 2', status: 'active' },
    { name: 'Server 3', status: 'maintenance' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-yellow-500">
            ChauPhim
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/phim/${resolvedParams.id}`} className="text-gray-300 hover:text-yellow-500 transition-colors">
              ← Quay lại trang phim
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-3">
            {/* Movie Title */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{movieData.titleVi}</h1>
              <p className="text-gray-400">{movieData.titleEn} ({movieData.year})</p>
            </div>

            {/* Episode/Language Selection */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setCurrentEpisode('thuyetminh')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentEpisode === 'thuyetminh'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Thuyết minh
                </button>
                <button
                  onClick={() => setCurrentEpisode('vietsub')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentEpisode === 'vietsub'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Vietsub
                </button>
              </div>

              {/* Server Selection */}
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-400 text-sm mr-2">Chọn server:</span>
                {servers.map((server, index) => (
                  <button
                    key={index}
                    disabled={server.status === 'maintenance'}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      server.status === 'active'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {server.name}
                    {server.status === 'maintenance' && ' (Bảo trì)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player */}
            <div className="mb-6">
              <VideoPlayer
                src={movieData.videoSources[currentEpisode]}
                poster={movieData.poster}
                title={movieData.titleVi}
              />
            </div>

            {/* Movie Controls */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors">
                  ♡ Yêu thích
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors">
                  📤 Chia sẻ
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors">
                  ⚠️ Báo lỗi
                </button>
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold">
                  ⭐ {movieData.rating}
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-3">Thông tin phim</h3>
              <div className="text-gray-300 text-sm leading-relaxed">
                <p className="mb-2">
                  <span className="text-yellow-500 font-semibold">Tên phim:</span> {movieData.titleVi}
                </p>
                <p className="mb-2">
                  <span className="text-yellow-500 font-semibold">Tên tiếng Anh:</span> {movieData.titleEn}
                </p>
                <p className="mb-2">
                  <span className="text-yellow-500 font-semibold">Năm sản xuất:</span> {movieData.year}
                </p>
                <p className="mb-2">
                  <span className="text-yellow-500 font-semibold">Đánh giá:</span> {movieData.rating}/10
                </p>
                <p className="text-gray-400 text-xs mt-4">
                  * Nếu không xem được phim, vui lòng đổi server hoặc báo lỗi để chúng tôi khắc phục.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Banner quảng cáo */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <Image
                src="/api/placeholder/300/250"
                alt="Quảng cáo"
                width={300}
                height={250}
                className="w-full rounded-lg"
              />
            </div>

            {/* Related Movies */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">Phim liên quan</h3>
              <div className="space-y-3">
                {relatedMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/phim/${movie.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Image
                      src={movie.thumbnail}
                      alt={movie.title}
                      width={60}
                      height={80}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{movie.title}</p>
                      <p className="text-gray-400 text-xs">{movie.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Banner quảng cáo thứ 2 */}
            <div className="bg-gray-800 rounded-lg p-4 mt-6">
              <Image
                src="/api/placeholder/300/200"
                alt="Quảng cáo 2"
                width={300}
                height={200}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2024 ChauPhim. Tất cả quyền được bảo lưu.</p>
            <p className="mt-2">
              <Link href="/privacy" className="hover:text-yellow-500 transition-colors mr-4">Chính sách bảo mật</Link>
              <Link href="/terms" className="hover:text-yellow-500 transition-colors mr-4">Điều khoản sử dụng</Link>
              <Link href="/contact" className="hover:text-yellow-500 transition-colors">Liên hệ</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
