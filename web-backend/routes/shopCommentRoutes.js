// routes/shopComments.js
const express = require("express");
const { verifyToken } = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const shopCommentController = require("../controllers/shopCommentController");

const router = express.Router();

// Tạo bình luận
router.post("/", verifyToken, shopCommentController.createShopComment);

// Lấy tất cả bình luận
router.get("/", shopCommentController.getShopComments);

// Xóa bình luận (chỉ admin)
router.delete(
  "/:commentId",
  authAdmin,
  shopCommentController.deleteShopComment
);

module.exports = router;
