"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import apiClient from "@/lib/api-client";
import LikeIcon from "@/assets/LikeIcon";
import AddIcon from "@/assets/AddIcon";
import ShareIcon from "@/assets/ShareIcon";
import CommentIcon from "@/assets/CommentIcon";

export default function MovieDetailPage({ params }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("episodes");
  const [commentTab, setCommentTab] = useState("comments"); // 'comments' or 'reviews'
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [movieData, setMovieData] = useState(null);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
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
        const commentsResponse = await apiClient.getMovieComments(
          resolvedParams.id,
          { limit: 10 }
        );
        setComments(commentsResponse.data);

        // Fetch recommendations
        const recommendationsResponse = await apiClient.getMovieRecommendations(
          resolvedParams.id,
          5
        );
        setRecommendations(recommendationsResponse.data);
      } catch (err) {
        console.error("Error fetching movie data:", err);
        setError(err.message);

        // Fallback to mock data if API fails
        setMovieData({
          id: resolvedParams.id,
          titleVi:
            "Thám Tử Lừng Danh Conan Movie 27: Ngôi Sao 5 Cánh 1 Triệu Đô",
          titleEn: "Detective Conan Movie 27: The Million Dollar Pentagram",
          backdropUrl: "/api/placeholder/1920/800",
          posterUrl: "/api/placeholder/300/450",
          averageRating: 9.0,
          genres: [
            { genre: { nameVi: "Hành động" } },
            { genre: { nameVi: "Trinh thám" } },
            { genre: { nameVi: "Tội phạm" } },
            { genre: { nameVi: "Hoạt hình" } },
          ],
          durationMinutes: 110,
          year: 2024,
          originCountry: ["JP"],
          descriptionVi:
            "Trong phần phim mới nhất của series Thám tử lừng danh Conan, một vụ án bí ẩn xoay quanh viên kim cương có giá trị lên đến 1 triệu đô la Mỹ. Conan và những người bạn sẽ phải đối mặt với những thử thách mới và khám phá ra những bí mật đen tối đằng sau vụ án này.",
          movieSources: [
            {
              id: 1,
              subtitlesJson: [
                { lang: "vi", label: "Thuyết minh" },
                { lang: "vi-sub", label: "Vietsub" },
              ],
            },
          ],
        });

        setCast([
          {
            id: 1,
            name: "Minami Takayama",
            character: "Conan Edogawa",
            avatarUrl: "/api/placeholder/80/80",
          },
          {
            id: 2,
            name: "Wakana Yamazaki",
            character: "Ran Mouri",
            avatarUrl: "/api/placeholder/80/80",
          },
          {
            id: 3,
            name: "Rikiya Koyama",
            character: "Kogoro Mouri",
            avatarUrl: "/api/placeholder/80/80",
          },
          {
            id: 4,
            name: "Megumi Hayashibara",
            character: "Ai Haibara",
            avatarUrl: "/api/placeholder/80/80",
          },
        ]);

        setComments([
          {
            id: 1,
            user: { name: "Nguyễn Văn A", avatarUrl: "/api/placeholder/40/40" },
            content:
              "Phim hay quá! Tình tiết hấp dẫn và lôi cuốn từ đầu đến cuối.",
            createdAt: "2 giờ trước",
            hasSpoiler: false,
          },
          {
            id: 2,
            user: { name: "Trần Thị B", avatarUrl: "/api/placeholder/40/40" },
            content:
              "Conan vẫn luôn là series anime yêu thích của mình. Phần này không làm tôi thất vọng!",
            createdAt: "5 giờ trước",
            hasSpoiler: false,
          },
          {
            id: 3,
            user: { name: "Lê Văn C", avatarUrl: "/api/placeholder/40/40" },
            content:
              "Kết thúc thật bất ngờ! Không nghĩ là thủ phạm lại là người đó.",
            createdAt: "1 ngày trước",
            hasSpoiler: true,
          },
        ]);

        setReviews([
          {
            id: 1,
            user: { name: "Phạm Thị D", avatarUrl: "/api/placeholder/40/40" },
            rating: 9,
            content:
              "Một bộ phim xuất sắc với cốt truyện chặt chẽ và hình ảnh đẹp mắt.",
            createdAt: "3 giờ trước",
          },
          {
            id: 2,
            user: { name: "Hoàng Văn E", avatarUrl: "/api/placeholder/40/40" },
            rating: 8,
            content: "Phim hay nhưng hơi dài, một số phân cảnh có thể cắt bớt.",
            createdAt: "6 giờ trước",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [resolvedParams.id]);

  const topMovies = [
    {
      rank: 1,
      titleVi: "One Piece Film Red",
      episodes: "Full HD",
      posterUrl: "/api/placeholder/60/80",
    },
    {
      rank: 2,
      titleVi: "Your Name",
      episodes: "Full HD",
      posterUrl: "/api/placeholder/60/80",
    },
    {
      rank: 3,
      titleVi: "Spirited Away",
      episodes: "Full HD",
      posterUrl: "/api/placeholder/60/80",
    },
    {
      rank: 4,
      titleVi: "Demon Slayer Movie",
      episodes: "Full HD",
      posterUrl: "/api/placeholder/60/80",
    },
    {
      rank: 5,
      titleVi: "Attack on Titan Final",
      episodes: "24/24",
      posterUrl: "/api/placeholder/60/80",
    },
  ];

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        // In a real app, you'd need authentication
        console.log("Gửi bình luận:", newComment);
        setNewComment("");

        // Add comment to local state optimistically
        const newCommentObj = {
          id: Date.now(),
          user: { name: "Bạn", avatarUrl: "/api/placeholder/40/40" },
          content: newComment,
          createdAt: "Vừa xong",
          hasSpoiler: false,
        };
        setComments((prev) => [newCommentObj, ...prev]);
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newReview.trim() && newRating > 0) {
      try {
        console.log("Gửi đánh giá:", { rating: newRating, review: newReview });
        setNewReview("");
        setNewRating(0);

        // Add review to local state optimistically
        const newReviewObj = {
          id: Date.now(),
          user: { name: "Bạn", avatarUrl: "/api/placeholder/40/40" },
          rating: newRating,
          content: newReview,
          createdAt: "Vừa xong",
        };
        setReviews((prev) => [newReviewObj, ...prev]);
      } catch (error) {
        console.error("Error posting review:", error);
      }
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
            disabled={!interactive}
          >
            <span
              className={`text-lg ${
                star <= rating ? "text-yellow-400" : "text-gray-600"
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>
    );
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
            <p className="text-gray-400 mb-4">
              Phim bạn tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Link
              href="/demo"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
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

  const formatOriginCountry = (country) => {};

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header />

      {/* Banner */}
      <div className="relative h-[526px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={movieData.backdropUrl || "/api/placeholder/1920/800"}
            alt={movieData.titleVi}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto flex">
        <div className="w-full xl:w-1/3 space-y-4">
          <div className="">
            <Image
              src={movieData.posterUrl || "/api/placeholder/300/450"}
              alt={movieData.titleVi}
              width={120}
              height={180}
              className="rounded-sm"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            {movieData.titleVi}
          </h2>
          <span className="text-md md:text-md text-[#FFD875] mb-6">
            {movieData.titleEn}
          </span>
          <div className="flex items-center gap-2 mb-4 mt-4">
            <span className="bg-white text-[#15151F] text-xs font-bold px-2 py-1.5 rounded-sm">
              {movieData?.ageRating}
            </span>
            <span className="text-white text-xs font-bold px-2 py-1.5 rounded-sm outline-1 outline-white">
              {movieData?.year}
            </span>
            <span className="text-white text-xs font-bold px-2 py-1.5 rounded-sm outline-1 outline-white">
              {formatDuration(movieData?.durationMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            {movieData?.genres?.map((genre, index) => (
              <span
                key={index}
                className="text-white text-xs font-medium px-2 py-1.5 rounded-sm bg-gray-700"
              >
                {genre.genre.nameVi}
              </span>
            ))}
          </div>
          <div>
            <div className="font-bold text-sm mb-2">Giới thiệu:</div>
            <div className="text-sm text-gray-400">
              {movieData?.descriptionVi}
            </div>
          </div>
          <div>
            <div className="font-bold text-sm mb-4">
              Thời lượng:{" "}
              <span className="text-sm text-gray-400 font-medium">
                {formatDuration(movieData?.durationMinutes)}
              </span>
            </div>
            <div className="font-bold text-sm mb-4">
              Năm sản xuất:{" "}
              <span className="text-sm text-gray-400 font-medium">
                {movieData?.year}
              </span>
            </div>
            <div className="font-bold text-sm mb-4">
              Quốc gia:{" "}
              <span className="text-sm text-gray-400 font-medium">
                {formatOriginCountry(movieData?.originCountry)}
              </span>
            </div>
            <div className="font-bold text-sm mb-4">
              Đạo diễn:{" "}
              <span className="text-sm text-gray-400 font-medium">
                Chika Nagaoka
              </span>
            </div>
          </div>
        </div>
        <div className="xl:w-2/3 pl-6 rounded-tl-xl bg-gray-900 ">
          <div className="flex gap-4 ">
            <Link
              href={`/xem/${resolvedParams.id}`}
              //gradient from yellow to orange
              className="bg-gradient-to-r from-[#fecf59] to-[#fff1cc] hover:bg-gradient-to-l text-black px-8 py-3 rounded-full font-semibold text-lg transition-colors inline-flex items-center"
            >
              <span className="mr-2">▶</span>
              Xem Ngay
            </Link>
            <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
              <div className="">
                <LikeIcon />
              </div>
              Yêu thích
            </button>
            <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
              <div className="">
                <AddIcon />
              </div>
              Thêm vào
            </button>
            <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
              <div className="">
                <ShareIcon />
              </div>
              Chia sẻ
            </button>
            <button className=" px-6 py-3 text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
              <div className="">
                <CommentIcon />
              </div>
              Bình luận
            </button>
            <button className="flex items-center gap-2 bg-[#3556b6] px-2 rounded-full">
              <Image
                src="/logo.svg"
                alt="ChauPhim Logo"
                width={25}
                height={25}
                className="brightness-0 invert"
              />
              <span className="font-bold text-sm">9.9</span>
              <span className="text-xs underline">Đánh giá</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-16 border-b border-gray-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("episodes")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "episodes"
                    ? "text-yellow-400 border-b-2 border-yellow-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Tập phim
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "gallery"
                    ? "text-yellow-400 border-b-2 border-yellow-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab("cast")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "cast"
                    ? "text-yellow-400 border-b-2 border-yellow-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Diễn viên
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === "recommendations"
                    ? "text-yellow-400 border-b-2 border-yellow-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Đề xuất
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "episodes" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Danh sách tập phim</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {/* Placeholder episodes */}
                  <button className="bg-gray-800 hover:bg-yellow-400 hover:text-black p-3 rounded-lg text-sm font-medium transition-colors">
                    Tập 1
                  </button>
                  <button className="bg-gray-800 hover:bg-yellow-400 hover:text-black p-3 rounded-lg text-sm font-medium transition-colors">
                    Tập 2
                  </button>
                  <button className="bg-gray-800 hover:bg-yellow-400 hover:text-black p-3 rounded-lg text-sm font-medium transition-colors">
                    Tập 3
                  </button>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Placeholder gallery images */}
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src="/api/placeholder/300/200"
                      alt="Gallery image"
                      width={300}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src="/api/placeholder/300/200"
                      alt="Gallery image"
                      width={300}
                      height={200}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cast" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Diễn viên</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="bg-gray-800 rounded-lg p-4 text-center"
                    >
                      <Image
                        src={actor.avatarUrl || "/api/placeholder/80/80"}
                        alt={actor.name}
                        width={80}
                        height={80}
                        className="rounded-full mx-auto mb-3"
                      />
                      <h4 className="font-medium text-sm">{actor.name}</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {actor.character}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Phim đề xuất</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {recommendations.map((movie, index) => (
                    <Link
                      key={movie.id || index}
                      href={`/phim/${movie.slug || movie.id}`}
                      className="group"
                    >
                      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                        <Image
                          src={movie.posterUrl || "/api/placeholder/200/300"}
                          alt={movie.titleVi}
                          width={200}
                          height={300}
                          className="w-full aspect-[2/3] object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-medium text-sm group-hover:text-yellow-400 transition-colors">
                            {movie.titleVi}
                          </h4>
                          <p className="text-gray-400 text-xs mt-1">
                            {movie.year}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments and Reviews Section */}
          <div className="mt-12 border-t border-gray-700 pt-8">
            {/* Comment/Review Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setCommentTab("comments")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    commentTab === "comments"
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Bình luận ({comments.length})
                </button>
                <button
                  onClick={() => setCommentTab("reviews")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    commentTab === "reviews"
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Đánh giá ({reviews.length})
                </button>
              </div>

              {/* Spoiler Toggle - Only show for comments */}
              {commentTab === "comments" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSpoilers}
                    onChange={(e) => setShowSpoilers(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-400">Tiết lộ?</span>
                </label>
              )}
            </div>

            {/* Comment Form */}
            {commentTab === "comments" && (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="bg-gray-800 rounded-lg p-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận của bạn..."
                    className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none"
                    rows="3"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-500">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" class="sr-only peer" />
                        <div class="relative w-9 h-5 border-2 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute  after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-transparent peer-checked:border-2 peer-checked:border-[#FFD875]"></div>
                        <span class="ms-3 text-xs font-medium text-white">
                          Tiết lộ?
                        </span>
                      </label>
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Gửi bình luận
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Review Form */}
            {commentTab === "reviews" && (
              <form onSubmit={handleReviewSubmit} className="mb-8">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Đánh giá của bạn
                    </label>
                    {renderStars(newRating, true, setNewRating)}
                  </div>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                    className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none"
                    rows="3"
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-500">
                      Đánh giá chân thật giúp cộng đồng
                    </span>
                    <button
                      type="submit"
                      disabled={!newReview.trim() || newRating === 0}
                      className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            {commentTab === "comments" && (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const shouldHideSpoiler = comment.hasSpoiler && !showSpoilers;
                  return (
                    <div
                      key={comment.id}
                      className="bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Image
                          src={comment.user.avatarUrl}
                          alt={comment.user.name}
                          width={40}
                          height={40}
                          className="rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm">
                              {comment.user.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt}
                            </span>
                            {comment.hasSpoiler && (
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                                Spoiler
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm text-gray-300 ${
                              shouldHideSpoiler ? "blur-sm" : ""
                            }`}
                          >
                            {comment.content}
                          </p>
                          {shouldHideSpoiler && (
                            <button
                              onClick={() => setShowSpoilers(true)}
                              className="text-xs text-yellow-400 hover:text-yellow-300 mt-2"
                            >
                              Nhấn để hiện spoiler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reviews List */}
            {commentTab === "reviews" && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Image
                        src={review.user.avatarUrl}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">
                            {review.user.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {review.createdAt}
                          </span>
                        </div>
                        <div className="mb-2">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-yellow-400 font-medium">
                            {review.rating}/10
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          {review.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
