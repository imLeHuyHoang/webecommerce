// components/RatingandComment/RatingComponent.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api-client";
import "./RatingComponent.css"; // Tạo file CSS riêng nếu cần

const RatingComponent = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const response = await apiClient.get(`/products/${productId}/reviews`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setAllReviews(response.data);

        if (token) {
          // Decode JWT để lấy user ID
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          const userId = tokenPayload.id;

          const userReview = response.data.find(
            (review) => review.user._id === userId
          );
          if (userReview) {
            setExistingReview(userReview);
            setRating(userReview.rating);
            setComment(userReview.comment || "");
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleRatingChange = (newRating) => setRating(newRating);

  const handleSubmitReview = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để đánh giá sản phẩm.");
      return;
    }

    if (rating === 0) {
      setMessage("Vui lòng chọn điểm đánh giá.");
      return;
    }

    try {
      const response = await apiClient.post(
        `/products/${productId}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage("Đánh giá thành công!");
        setExistingReview(response.data.review);
        // Cập nhật danh sách reviews
        setAllReviews((prevReviews) => {
          const updatedReviews = prevReviews.filter(
            (r) => r.user._id !== response.data.review.user._id
          );
          return [response.data.review, ...updatedReviews];
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("Có lỗi xảy ra khi gửi đánh giá.");
    }
  };

  if (loading) return <p>Đang tải đánh giá...</p>;

  return (
    <div className="rating-component my-4">
      <h4>Đánh giá sản phẩm</h4>
      <div className="stars mb-2">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            onClick={() => handleRatingChange(index + 1)}
            style={{
              cursor: "pointer",
              color: rating > index ? "gold" : "gray",
              fontSize: "24px",
            }}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        placeholder="Viết nhận xét của bạn"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="form-control mb-2"
      ></textarea>
      <button className="btn btn-primary" onClick={handleSubmitReview}>
        {existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
      </button>
      {message && <p className="mt-2">{message}</p>}

      {/* Hiển thị danh sách đánh giá */}
      <div className="reviews-list mt-4">
        <h5>Đánh giá của người dùng:</h5>
        {allReviews.length === 0 ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          allReviews.map((review) => (
            <div key={review._id} className="review-item mb-3">
              <strong>{review.user.name}</strong>
              <div className="stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    style={{
                      color: review.rating > index ? "gold" : "gray",
                      fontSize: "16px",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {review.comment && <p>{review.comment}</p>}
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingComponent;
