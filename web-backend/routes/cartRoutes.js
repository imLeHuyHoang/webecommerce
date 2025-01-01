// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/auth");

// Lấy giỏ hàng
router.get("/", verifyToken, cartController.getCart);

// Thêm vào giỏ hàng
router.post("/add", verifyToken, cartController.addToCart);

// Xóa sản phẩm khỏi giỏ
router.delete(
  "/product/:productId",
  verifyToken,
  cartController.removeFromCart
);

// Tăng/giảm số lượng
router.patch(
  "/product/:productId/increase",
  verifyToken,
  cartController.increaseQuantity
);
router.patch(
  "/product/:productId/decrease",
  verifyToken,
  cartController.decreaseQuantity
);

// Áp/dỡ mã giảm giá cho toàn giỏ
router.post("/apply-discount", verifyToken, cartController.applyCartDiscount);
router.post("/remove-discount", verifyToken, cartController.removeCartDiscount);

// Áp/gỡ mã giảm giá cho từng sản phẩm
router.post(
  "/product/apply-discount",
  verifyToken,
  cartController.applyProductDiscount
);
router.delete(
  "/product/:productId/remove-discount",
  verifyToken,
  cartController.removeProductDiscount
);

// Kiểm tra tồn kho
router.post("/check-stock", verifyToken, cartController.checkStock);

module.exports = router;
