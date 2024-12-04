// src/components/RatingandComment/RatingComponent.jsx
import React, { useState, useEffect } from "react";
import { Spinner, Alert, Button, Form } from "react-bootstrap";
import apiClient from "../../utils/api-client";
import { FaStar } from "react-icons/fa"; // Importing Font Awesome Star Icon

import "./RatingComponent.css"; // Ensure this CSS file exists and is correctly imported

const RatingComponent = ({ productId }) => {
  const [rating, setRating] = useState(0); // User's current rating
  const [hoverRating, setHoverRating] = useState(0); // Rating on hover
  const [comment, setComment] = useState(""); // User's comment
  const [existingReview, setExistingReview] = useState(null); // Existing review by the user
  const [loading, setLoading] = useState(true); // Loading state
  const [message, setMessage] = useState(""); // Success or error message
  const [allReviews, setAllReviews] = useState([]); // List of all reviews

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("accessToken"); // Retrieve token if available

      try {
        // Fetch all reviews for the product
        const response = await apiClient.get(`/products/${productId}/reviews`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setAllReviews(response.data); // Set the fetched reviews

        if (token) {
          // Decode JWT to extract user ID
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          const userId = tokenPayload.id;

          // Find if the user has already submitted a review
          const userReview = response.data.find(
            (review) => review.user._id === userId
          );
          if (userReview) {
            setExistingReview(userReview); // Set existing review
            setRating(userReview.rating); // Set existing rating
            setComment(userReview.comment || ""); // Set existing comment
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setMessage("Có lỗi xảy ra khi tải đánh giá."); // Display error message
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchReviews();
  }, [productId]);

  // Handle rating selection
  const handleRatingChange = (newRating) => setRating(newRating);

  // Handle review submission
  const handleSubmitReview = async () => {
    const token = localStorage.getItem("accessToken"); // Retrieve token

    if (!token) {
      setMessage("Vui lòng đăng nhập để đánh giá sản phẩm."); // Prompt login if not authenticated
      return;
    }

    if (rating === 0) {
      setMessage("Vui lòng chọn điểm đánh giá."); // Prompt rating selection
      return;
    }

    try {
      // Submit or update the review
      const response = await apiClient.post(
        `/products/${productId}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage("Đánh giá thành công!"); // Success message
        setExistingReview(response.data.review); // Update existing review

        // Update the reviews list with the new or updated review
        setAllReviews((prevReviews) => {
          const updatedReviews = prevReviews.filter(
            (r) => r.user._id !== response.data.review.user._id
          );
          return [response.data.review, ...updatedReviews];
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("Có lỗi xảy ra khi gửi đánh giá."); // Error message
    }
  };
  console.log(allReviews);

  if (loading)
    return (
      <div className="text-center my-3">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải đánh giá...</p>
      </div>
    );

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
            aria-label={`${index + 1} star`}
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

      {/* Comment Textarea */}
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

      {/* Submit Review Button */}
      <Button variant="primary" onClick={handleSubmitReview}>
        {existingReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
      </Button>

      <p className="text-reviews">Đánh giá của các khách hàng khác</p>

      {/* Display Message */}
      {message && (
        <Alert
          variant={message.includes("thành công") ? "success" : "danger"}
          className="mt-3"
        >
          {message}
        </Alert>
      )}

      {/* Reviews List */}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingComponent;
