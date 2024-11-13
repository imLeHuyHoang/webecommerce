// routes/orderRouter.js

const express = require("express");
const { verifyToken } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  requestSupport,
  leaveReview,
} = require("../controllers/orderController");

const router = express.Router();

// Tạo đơn hàng mới
router.post("/", verifyToken, createOrder);

// Danh sách đơn hàng của người dùng
router.get("/", verifyToken, getUserOrders);

// Chi tiết đơn hàng
router.get("/:orderId", verifyToken, getOrderDetails);

// Hủy đơn hàng
router.patch("/:orderId/cancel", verifyToken, cancelOrder);

// Yêu cầu hỗ trợ
router.post("/:orderId/support", verifyToken, requestSupport);

// Đánh giá sản phẩm
router.post("/:orderId/review", verifyToken, leaveReview);

module.exports = router;
