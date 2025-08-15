'use client';
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const navigate = (path) => {
    router.push(path);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Main Header */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0" onClick={() => navigate('/phimhay')}>
            <Image
              src="/logo.svg"
              alt="ChauPhim Logo"
              width={40}
              height={40}
              className="brightness-0 invert"
            />
            <div>
              <h1 className="text-lg font-bold text-white">ChauPhim</h1>
              <p className="text-xs text-gray-300">Phim hay cả chậu</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-6 flex-1 justify-center">
            <a href="/" className="text-gray-300 hover:text-white transition-colors font-medium">
              Trang chủ
            </a>
            
            {/* Phim dropdown */}
            <div className="relative group">
              <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                Phim
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="/phim-le" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-t-lg">Phim lẻ</a>
                <a href="/phim-bo" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50">Phim bộ</a>
                <a href="/anime" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50">Anime</a>
                <a href="/xem-chung" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-b-lg">Xem chung</a>
              </div>
            </div>

            {/* Thể loại dropdown */}
            <div className="relative group">
              <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                Thể loại
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="grid grid-cols-2 gap-1 p-2">
                  <a href="/the-loai/hanh-dong" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded">Hành động</a>
                  <a href="/the-loai/tinh-cam" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded">Tình cảm</a>
                  <a href="/the-loai/hai" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded">Hài</a>
                  <a href="/the-loai/kinh-di" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded">Kinh dị</a>
                  <a href="/the-loai/phieu-luu" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded">Phiêu lưu</a>
                  <a href="/the-loai/chinh-kich" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded">Chính kịch</a>
                </div>
              </div>
            </div>

            <a href="/dien-vien" className="text-gray-300 hover:text-white transition-colors font-medium">
              Diễn viên
            </a>
            <a href="/quoc-gia" className="text-gray-300 hover:text-white transition-colors font-medium">
              Quốc gia
            </a>
            <a href="/lich-chieu" className="text-gray-300 hover:text-white transition-colors font-medium">
              Lịch chiếu
            </a>
          </nav>

          {/* Right side - Search and User */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              <input
                type="search"
                placeholder="Tìm kiếm phim..."
                className="bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-2 rounded-full text-sm border border-white/20 focus:outline-none focus:border-white/40 focus:bg-white/20 w-64 transition-all"
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* User menu - Desktop */}
            <div className="hidden xl:block relative group">
              <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">Thành viên</span>
              </button>
              <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="/dang-nhap" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-t-lg">Đăng nhập</a>
                <a href="/dang-ky" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-b-lg">Đăng ký</a>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="xl:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden mt-4 pb-4 border-t border-white/10">
            <div className="pt-4 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <input
                  type="search"
                  placeholder="Tìm kiếm phim..."
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-3 rounded-lg text-sm border border-white/20 focus:outline-none focus:border-white/40"
                />
                <svg className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <a href="/" className="block py-3 text-gray-300 hover:text-white transition-colors">Trang chủ</a>
              
              {/* Phim Section */}
              <div>
                <button
                  onClick={() => toggleDropdown('phim')}
                  className="flex items-center justify-between w-full py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Phim
                  <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === 'phim' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'phim' && (
                  <div className="pl-4 space-y-2">
                    <a href="/phim-le" className="block py-2 text-gray-400 hover:text-white transition-colors">Phim lẻ</a>
                    <a href="/phim-bo" className="block py-2 text-gray-400 hover:text-white transition-colors">Phim bộ</a>
                    <a href="/anime" className="block py-2 text-gray-400 hover:text-white transition-colors">Anime</a>
                    <a href="/xem-chung" className="block py-2 text-gray-400 hover:text-white transition-colors">Xem chung</a>
                  </div>
                )}
              </div>

              {/* Thể loại Section */}
              <div>
                <button
                  onClick={() => toggleDropdown('theloai')}
                  className="flex items-center justify-between w-full py-3 text-gray-300 hover:text-white transition-colors"
                >
                  Thể loại
                  <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === 'theloai' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'theloai' && (
                  <div className="pl-4 grid grid-cols-2 gap-2">
                    <a href="/the-loai/hanh-dong" className="block py-2 text-gray-400 hover:text-white transition-colors">Hành động</a>
                    <a href="/the-loai/tinh-cam" className="block py-2 text-gray-400 hover:text-white transition-colors">Tình cảm</a>
                    <a href="/the-loai/hai" className="block py-2 text-gray-400 hover:text-white transition-colors">Hài</a>
                    <a href="/the-loai/kinh-di" className="block py-2 text-gray-400 hover:text-white transition-colors">Kinh dị</a>
                    <a href="/the-loai/phieu-luu" className="block py-2 text-gray-400 hover:text-white transition-colors">Phiêu lưu</a>
                    <a href="/the-loai/chinh-kich" className="block py-2 text-gray-400 hover:text-white transition-colors">Chính kịch</a>
                  </div>
                )}
              </div>

              <a href="/dien-vien" className="block py-3 text-gray-300 hover:text-white transition-colors">Diễn viên</a>
              <a href="/quoc-gia" className="block py-3 text-gray-300 hover:text-white transition-colors">Quốc gia</a>
              <a href="/lich-chieu" className="block py-3 text-gray-300 hover:text-white transition-colors">Lịch chiếu</a>
              
              {/* Mobile User Section */}
              <div className="pt-4 border-t border-white/10">
                <div>
                  <button
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center justify-between w-full py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Thành viên
                    </div>
                    <svg className={`w-4 h-4 transform transition-transform ${activeDropdown === 'user' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'user' && (
                    <div className="pl-4 space-y-2">
                      <a href="/dang-nhap" className="block py-2 text-gray-400 hover:text-white transition-colors">Đăng nhập</a>
                      <a href="/dang-ky" className="block py-2 text-gray-400 hover:text-white transition-colors">Đăng ký</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
