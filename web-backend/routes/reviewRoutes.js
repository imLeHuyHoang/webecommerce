// routes/reviewRoutes.js
const express = require("express");
const { verifyToken } = require("../middleware/auth");
const reviewController = require("../controllers/productReviewController.js");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");

router.post(
  "/:productId/review",
  verifyToken,
  reviewController.createOrUpdateReview
);

router.get("/:productId/reviews", reviewController.getProductReviews);
router.delete(
  "/:productId/review/:reviewId",
  authAdmin,
  reviewController.deleteReview
);

module.exports = router;
