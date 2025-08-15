'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Phim bộ', href: '/phim-bo' },
    { label: 'Phim lẻ', href: '/phim-le' },
    { label: 'Hoạt hình', href: '/hoat-hinh' },
    { label: 'TV Show', href: '/tv-show' },
  ];

  const genres = [
    'Hành động', 'Tình cảm', 'Hài hước', 'Kinh dị', 'Khoa học viễn tưởng',
    'Phiêu lưu', 'Tâm lý', 'Tài liệu', 'Chiến tranh', 'Thể thao'
  ];

  return (
    <header className="bg-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-yellow-500">
            ChauPhim
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-yellow-500 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Genres Dropdown */}
            <div className="relative group">
              <button className="text-gray-300 hover:text-yellow-500 transition-colors font-medium">
                Thể loại ▼
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {genres.map((genre) => (
                    <Link
                      key={genre}
                      href={`/the-loai/${genre.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-300 hover:text-yellow-500 transition-colors text-sm py-1"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Search & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Box */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                className="bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-64"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-500">
                🔍
              </button>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-300 hover:text-yellow-500 transition-colors">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                  U
                </div>
                <span className="hidden md:inline">Tài khoản</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-600 rounded transition-colors"
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/favorites"
                    className="block px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-600 rounded transition-colors"
                  >
                    Phim yêu thích
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-600 rounded transition-colors"
                  >
                    Lịch sử xem
                  </Link>
                  <hr className="my-2 border-gray-600" />
                  <button className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-600 rounded transition-colors">
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-yellow-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-700">
            {/* Mobile Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Mobile Menu Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-300 hover:text-yellow-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Genres */}
            <div className="mt-4">
              <h3 className="text-yellow-500 font-semibold mb-2">Thể loại</h3>
              <div className="grid grid-cols-2 gap-2">
                {genres.slice(0, 8).map((genre) => (
                  <Link
                    key={genre}
                    href={`/the-loai/${genre.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-yellow-500 transition-colors text-sm py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
