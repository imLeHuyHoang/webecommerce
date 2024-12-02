const express = require("express");
const { verifyToken } = require("../middleware/auth");
const commentController = require("../controllers/productCommentController.js");
const router = express.Router();

// Tạo bình luận mới
router.post(
  "/:productId/comment",
  verifyToken,
  commentController.createComment
);

// Lấy danh sách bình luận cho sản phẩm
router.get("/:productId/comments", commentController.getProductComments);

module.exports = router;
