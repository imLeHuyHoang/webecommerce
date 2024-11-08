const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  removeFromCart,
  decreaseQuantity,
  increaseQuantity,
  clearCart,
} = require("../controllers/cartController");

// Lấy giỏ hàng
router.get("/", verifyToken, getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/", verifyToken, addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/:productId", verifyToken, removeFromCart);

// Giảm số lượng sản phẩm trong giỏ hàng
router.patch("/:productId/decrease", verifyToken, decreaseQuantity);

// Tăng số lượng sản phẩm trong giỏ hàng
router.patch("/:productId/increase", verifyToken, increaseQuantity);

// xóa giỏ hàng
router.delete("/", verifyToken, removeFromCart);

// Xóa giỏ hàng
router.delete("/", verifyToken, clearCart);

module.exports = router;
