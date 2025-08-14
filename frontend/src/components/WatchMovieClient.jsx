"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Share2,
  Flag,
  Eye,
  Star,
  Heart,
  MessageSquare,
  ChevronRight,
  MoreHorizontal,
  Reply,
  ThumbsUp,
  Clock,
} from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  cn,
  formatViewCount,
  formatTimeAgo,
  generateMovieSchema,
} from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import BackArrowCircleIcon from "@/assets/BackArrowCircleIcon";

export default function WatchMovieClient({
  movieData,
  recommendedMovies,
  commentsData,
}) {
  const [selectedServer, setSelectedServer] = useState(0);
  const [currentSource, setCurrentSource] = useState(movieData.sources[0]);
  const [comments, setComments] = useState(commentsData);
  const [newComment, setNewComment] = useState("");
  const [showMoreComments, setShowMoreComments] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Handle server change
  const handleServerChange = (serverIndex) => {
    setSelectedServer(serverIndex);
    const newSource = movieData.sources[serverIndex];
    setCurrentSource(newSource);
    toast.success(`Đã chuyển sang ${newSource.server} - ${newSource.quality}`);
  };

  console.log(movieData);

  // Handle comment submission
  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    const comment = {
      id: Date.now(),
      user: { name: "Người dùng", avatar: "/api/placeholder/40/40" },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Đã thêm bình luận thành công!");
  };

  // Handle sharing
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: movieData.title,
          text: movieData.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link phim vào clipboard!");
      }
    } catch (error) {
      toast.error("Không thể chia sẻ phim");
    }
  };

  // Handle report error
  const handleReportError = () => {
    toast.info(
      "Cảm ơn bạn đã báo lỗi. Chúng tôi sẽ kiểm tra và sửa chữa sớm nhất có thể."
    );
  };

  // Handle like comment
  const handleLikeComment = (commentId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  // Handle video events
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleVideoEnded = () => {
    toast.success(
      "Cảm ơn bạn đã xem phim! Đừng quên đánh giá và bình luận nhé."
    );
  };

  // Ad slot component
  const AdSlot = ({ width = 300, height = 250, className = "" }) => (
    <Card
      className={cn(
        "flex items-center justify-center border-dashed",
        className
      )}
      style={{ width, height }}
    >
      <div className="text-center text-brand-text-secondary">
        <div className="text-sm mb-1 opacity-60">Quảng cáo</div>
        <div className="text-xs opacity-40">
          {width}×{height}
        </div>
      </div>
    </Card>
  );

  // Generate structured data
  const structuredData = generateMovieSchema(movieData);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Container */}
      <div className="max-w-[1280px] md:max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center space-x-4 my-4">
          <button>
            <BackArrowCircleIcon />
          </button>
          <h2 className="text-lg font-semibold">Xem phim {movieData.title}</h2>
        </div>

        {/* Player Section */}
        <Card className="mb-6 shadow-brand-lg bg-black">
          <CardContent className="p-0">
            <div className="aspect-video relative overflow-hidden rounded-2xl bg-black">
              <VideoPlayer
                src={currentSource.url}
                poster={movieData.backdrop}
                subtitles={movieData.subtitles}
                qualities={movieData.sources.map((s) => ({
                  label: s.quality,
                  value: s.quality,
                }))}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full"
                autoplay={true}
              />
            </div>

            {/* Player toolbar */}
            <div className="p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-lg md:text-xl font-semibold text-brand-text-primary">
                  {movieData.title}
                </h1>
                {movieData.type === "series" && (
                  <Badge variant="secondary">Tập 1</Badge>
                )}
                <Badge variant="accent">{movieData.year}</Badge>
              </div>

              <div className="flex items-center space-x-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReportError}>
                  <Flag className="w-4 h-4 mr-2" />
                  Báo lỗi
                </Button>
                <div className="flex items-center space-x-4 text-sm text-brand-text-secondary">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {formatViewCount(movieData.views)}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-brand-accent text-brand-accent" />
                    {movieData.rating}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center">
          <div className="w-1/2 flex items-start space-x-6">
            <div className="">
              <Image
                src={movieData.poster || "/api/placeholder/300/450"}
                alt={movieData.title}
                width={120}
                height={180}
                className="rounded-sm"
              />
            </div>
            <div>
              <h2 className="text-md md:text-lg font-semibold mb-2 text-white">
                {movieData.title}
              </h2>
              <span className="text-md md:text-md text-[#FFD875] mb-8">
                {movieData.titleEn}
              </span>
              <div className="flex items-center gap-2 mb-2 mt-4">
                <span className="bg-white text-[#15151F] text-xs font-bold px-2 py-1.5 rounded-sm">
                  {movieData?.ageRating}
                </span>
                <span className="text-white text-xs font-bold px-2 py-1.5 rounded-sm outline-1 outline-white">
                  {movieData?.year}
                </span>
                <span className="text-white text-xs font-bold px-2 py-1.5 rounded-sm outline-1 outline-white">
                  {formatDuration(movieData?.duration)}
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
            </div>
          </div>
          <div className="w-1/2">
            <p>{movieData.description}</p>
            <button className="mt-4 bg-brand-accent text-[#FFD875] rounded-md cursor-pointer">
              Thông tin phim ⭢
            </button>
          </div>
        </div>

        {/* Server Selection */}
        <Card className="mb-6 shadow-brand">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Các bản chiếu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {movieData.sources.map((source, index) => (
                <Button
                  key={index}
                  variant={selectedServer === index ? "accent" : "ghost"}
                  size="sm"
                  onClick={() => handleServerChange(index)}
                  className={cn(
                    "border transition-all duration-200",
                    selectedServer === index
                      ? "border-brand-accent shadow-brand"
                      : "border-brand-border hover:border-brand-accent/50"
                  )}
                >
                  {source.server} - {source.quality}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Movie Info */}
            <Card className="shadow-brand">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {movieData.genres.map((genre) => (
                    <Badge key={genre} variant="default">
                      {genre}
                    </Badge>
                  ))}
                  <Badge variant="secondary">
                    Thời lượng: {movieData.duration} phút
                  </Badge>
                </div>
                <p className="text-brand-text-secondary leading-relaxed text-justify">
                  {movieData.description}
                </p>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Bình luận ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment composer */}
                <div className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận về phim..."
                      className="w-full p-3 bg-brand-elevated border border-brand-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-brand-text-primary placeholder-brand-text-secondary transition-all duration-200"
                      rows="3"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-brand-text-secondary">
                        {newComment.length}/500 ký tự
                      </span>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        Gửi bình luận
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments list */}
                <div className="space-y-4">
                  {comments
                    .slice(0, showMoreComments ? comments.length : 3)
                    .map((comment, index) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="flex space-x-3">
                          <Avatar>
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback>
                              {comment.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-brand-elevated rounded-lg p-3 hover:bg-brand-elevated/80 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-brand-text-primary">
                                  {comment.user.name}
                                </span>
                                <span className="text-xs text-brand-text-secondary flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimeAgo(comment.timestamp)}
                                </span>
                              </div>
                              <p className="text-brand-text-secondary">
                                {comment.content}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <button
                                className="flex items-center space-x-1 text-brand-text-secondary hover:text-brand-primary transition-colors"
                                onClick={() => handleLikeComment(comment.id)}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{comment.likes}</span>
                              </button>
                              <button className="text-brand-text-secondary hover:text-brand-primary transition-colors">
                                <Reply className="w-4 h-4 inline mr-1" />
                                Trả lời
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.replies &&
                          comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="ml-12 flex space-x-3"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={reply.user.avatar} />
                                <AvatarFallback>
                                  {reply.user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-brand-elevated rounded-lg p-3 hover:bg-brand-elevated/80 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-brand-text-primary text-sm">
                                      {reply.user.name}
                                    </span>
                                    <span className="text-xs text-brand-text-secondary">
                                      {formatTimeAgo(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-brand-text-secondary text-sm">
                                    {reply.content}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs">
                                  <button className="flex items-center space-x-1 text-brand-text-secondary hover:text-brand-primary transition-colors">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{reply.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* Ad banner in comments (after 2nd comment) */}
                        {index === 1 && (
                          <div className="flex justify-center py-4">
                            <AdSlot width={728} height={90} />
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Load more comments */}
                {comments.length > 3 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowMoreComments(!showMoreComments)}
                    >
                      {showMoreComments
                        ? "Thu gọn bình luận"
                        : `Xem thêm ${comments.length - 3} bình luận`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ad Banner 1 */}
            <AdSlot width={300} height={250} className="mx-auto" />

            {/* Cast */}
            <Card className="shadow-brand">
              <CardHeader>
                <CardTitle className="text-lg">Diễn viên</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {movieData.cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="text-center group cursor-pointer hover-lift"
                    >
                      <Avatar className="w-12 h-12 mx-auto mb-2 ring-2 ring-transparent group-hover:ring-brand-primary transition-all">
                        <AvatarImage src={actor.avatar} />
                        <AvatarFallback>{actor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-xs">
                        <div className="font-medium text-brand-text-primary truncate group-hover:text-brand-primary transition-colors">
                          {actor.name}
                        </div>
                        <div className="text-brand-text-secondary truncate">
                          {actor.character}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Movies */}
            <Card className="shadow-brand">
              <CardHeader>
                <CardTitle className="text-lg">Gợi ý cho bạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendedMovies.map((movie) => (
                  <Link key={movie.id} href={`/xem/${movie.id}`}>
                    <div className="flex space-x-3 group cursor-pointer hover:bg-brand-elevated rounded-lg p-2 transition-all duration-200 hover-lift">
                      <div className="relative w-16 h-24 flex-shrink-0">
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <Badge
                          variant="accent"
                          className="absolute top-1 right-1 text-xs px-1 py-0"
                        >
                          {movie.quality}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-brand-text-primary group-hover:text-brand-primary transition-colors line-clamp-2 mb-1">
                          {movie.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-brand-text-secondary">
                          <span>{movie.year}</span>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 fill-brand-accent text-brand-accent" />
                            {movie.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Ad Banner 2 */}
            <AdSlot width={300} height={600} className="mx-auto" />
          </div>
        </div>
      </div>
    </>
  );
}
