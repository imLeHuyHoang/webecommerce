import React, { useState, useEffect } from "react";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import apiClient from "../../utils/api-client";
import { FaStar } from "react-icons/fa";

import "./RatingComponent.css";

const RatingComponent = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [allReviews, setAllReviews] = useState([]);

  // Check admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Lấy user từ localStorage (nếu có)
    const storedUserStr = localStorage.getItem("user");
    if (storedUserStr) {
      const userObj = JSON.parse(storedUserStr);
      if (Array.isArray(userObj.roles) && userObj.roles.includes("admin")) {
        setIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await apiClient.get(`/products/${productId}/reviews`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setAllReviews(response.data);

        if (token) {
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
        setMessage("Có lỗi xảy ra khi tải đánh giá.");
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

  // Xóa review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập để xóa đánh giá!");
      return;
    }

    try {
      const response = await apiClient.delete(
        `/products/${productId}/review/${reviewId}`
      );
      if (response.status === 200) {
        setMessage("Xóa đánh giá thành công!");
        // Loại bỏ review vừa xóa khỏi state
        setAllReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setMessage("Có lỗi xảy ra khi xóa đánh giá.");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="rating-component my-4">
      <h4>Đánh giá sản phẩm</h4>
      <p>Thêm đánh giá của bạn</p>

      {/* Star Rating Selection */}
      <div className="stars mb-3">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            onClick={() => handleRatingChange(index + 1)}
            onMouseEnter={() => setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(0)}
            className={`star-rating ${
              (hoverRating || rating) >= index + 1 ? "filled" : "unfilled"
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleRatingChange(index + 1);
              }
            }}
          >
            ★
          </span>
        ))}
      </div>

      <Form.Group controlId="userComment">
        <Form.Control
          as="textarea"
          placeholder="Viết nhận xét của bạn"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-3 user-comment"
          rows={3}
        />
      </Form.Group>

      <Button variant="primary" onClick={handleSubmitReview}>
        {existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
      </Button>

      <p className="text-reviews">Đánh giá của các khách hàng khác</p>

      {message && (
        <Alert
          variant={message.includes("thành công") ? "success" : "danger"}
          className="mt-3"
        >
          {message}
        </Alert>
      )}

      <div className="comment-container ">
        {allReviews.length === 0 ? (
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="review-list">
            {allReviews.map((review) => (
              <div className="comment-box" key={review._id}>
                <h5>User: {review.user.name}</h5>
                <p>
                  Rating:{" "}
                  <span className="text-warning">
                    {Array.from({ length: 5 }, (_, index) => (
                      <FaStar
                        key={index}
                        className={
                          index < review.rating
                            ? "fas fa-star filled"
                            : "fas fa-star unfilled"
                        }
                      />
                    ))}
                  </span>
                </p>
                <p>Comment: {review.comment || "Không có nhận xét."}</p>

                {/* Chỉ admin mới thấy nút xóa */}
                {isAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteReview(review._id)}
                  >
                    Xoá đánh giá
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingComponent;
