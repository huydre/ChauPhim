'use client';
import { useState } from 'react';
import Header from '../components/Header';

export default function XemChungPage() {
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateRoom = () => {
    // Generate a random room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setIsCreatingRoom(true);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      // Handle joining room logic here
      console.log('Joining room:', roomCode);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Xem chung
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Cùng bạn bè xem phim trong phòng riêng tư. Đồng bộ thời gian, chat trực tiếp và chia sẻ cảm xúc cùng nhau.
            </p>
          </div>

          {/* Main Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Create Room */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Tạo phòng mới</h3>
                <p className="text-gray-400 mb-6">
                  Tạo phòng xem phim riêng tư và mời bạn bè tham gia
                </p>
                
                {!isCreatingRoom ? (
                  <button
                    onClick={handleCreateRoom}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Tạo phòng ngay
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-300 text-sm mb-2">Mã phòng của bạn:</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-mono font-bold text-blue-400">{roomCode}</span>
                        <button className="text-gray-400 hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                      Vào phòng
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Join Room */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Tham gia phòng</h3>
                <p className="text-gray-400 mb-6">
                  Nhập mã phòng để tham gia cùng bạn bè
                </p>
                
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã phòng (VD: ABC123)"
                    className="w-full bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 px-4 py-4 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-gray-700 transition-all text-center text-lg font-mono"
                    maxLength={6}
                  />
                  <button
                    type="submit"
                    disabled={!roomCode.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    Tham gia phòng
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Tính năng nổi bật</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Đồng bộ thời gian</h4>
                <p className="text-gray-400 text-sm">Phim được phát đồng thời cho tất cả thành viên trong phòng</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Chat trực tiếp</h4>
                <p className="text-gray-400 text-sm">Trao đổi và chia sẻ cảm xúc trong khi xem phim</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Phòng riêng tư</h4>
                <p className="text-gray-400 text-sm">Chỉ những người có mã phòng mới có thể tham gia</p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-8">Cách sử dụng</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold">1</div>
                <p className="text-gray-300">Tạo phòng hoặc nhập mã phòng</p>
              </div>
              <div className="space-y-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold">2</div>
                <p className="text-gray-300">Mời bạn bè bằng cách chia sẻ mã phòng</p>
              </div>
              <div className="space-y-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold">3</div>
                <p className="text-gray-300">Chọn phim và bắt đầu xem cùng nhau</p>
              </div>
              <div className="space-y-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold">4</div>
                <p className="text-gray-300">Chat và chia sẻ cảm xúc trong khi xem</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
