// routes/commentRoutes.js
const express = require("express");
const { verifyToken } = require("../middleware/auth");
const commentController = require("../controllers/productCommentController.js");

const router = express.Router();

// Tạo bình luận
router.post(
  "/:productId/comment",
  verifyToken,
  commentController.createComment
);

// Lấy danh sách bình luận
router.get("/:productId/comments", commentController.getProductComments);

// Cập nhật bình luận
router.put(
  "/:productId/comment/:commentId",
  verifyToken,
  commentController.updateComment
);

// Xóa bình luận
router.delete(
  "/:productId/comment/:commentId",
  verifyToken,
  commentController.deleteComment
);

module.exports = router; // QUAN TRỌNG
