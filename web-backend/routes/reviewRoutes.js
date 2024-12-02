// routes/reviewRoutes.js
const express = require("express");
const { verifyToken } = require("../middleware/auth");
const reviewController = require("../controllers/productReviewController.js"); // Đảm bảo import đúng
const router = express.Router();

// Tạo hoặc chỉnh sửa đánh giá sản phẩm
router.post(
  "/:productId/review",
  verifyToken,
  reviewController.createOrUpdateReview // Đảm bảo gọi hàm đúng
);

// Lấy danh sách đánh giá của sản phẩm
router.get("/:productId/reviews", reviewController.getProductReviews);

module.exports = router;
