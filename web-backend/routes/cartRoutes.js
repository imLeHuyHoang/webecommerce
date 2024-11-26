// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/auth");

// Các route yêu cầu người dùng đã đăng nhập
router.get("/", verifyToken, cartController.getCart);
router.post("/add", verifyToken, cartController.addToCart);
router.delete(
  "/product/:productId",
  verifyToken,
  cartController.removeFromCart
);
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
router.post("/apply-discount", verifyToken, cartController.applyCartDiscount);
router.post("/remove-discount", verifyToken, cartController.removeCartDiscount);

// Áp dụng discount cho sản phẩm trong giỏ hàng
router.post(
  "/product/apply-discount",
  verifyToken,
  cartController.applyProductDiscount
);
router.post(
  "/product/:productId/remove-discount",
  verifyToken,
  cartController.removeProductDiscount
);

module.exports = router;
