"use client";

import { useState } from "react";
import Image from "next/image";

export default function CommentsReviewsSection({
  comments = [],
  reviews = [],
  onAddComment,
  onAddReview,
  className = ""
}) {
  const [commentTab, setCommentTab] = useState("comments");
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const commentData = {
        content: newComment,
        hasSpoiler: hasSpoiler
      };
      
      if (onAddComment) {
        await onAddComment(commentData);
      }
      
      setNewComment("");
      setHasSpoiler(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newReview.trim() && newRating > 0) {
      const reviewData = {
        content: newReview,
        rating: newRating
      };
      
      if (onAddReview) {
        await onAddReview(reviewData);
      }
      
      setNewReview("");
      setNewRating(0);
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

  return (
    <div className={`mt-12 border-t border-gray-700 pt-8 ${className}`}>
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
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasSpoiler}
                  onChange={(e) => setHasSpoiler(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="relative w-9 h-5 border-2 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-transparent peer-checked:border-2 peer-checked:border-[#FFD875]"></div>
                <span className="ms-3 text-xs font-medium text-white">
                  Tiết lộ?
                </span>
              </label>
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
  );
}
