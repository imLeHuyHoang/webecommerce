// routes/cartRoutes.js
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
  applyCartDiscount,
  removeCartDiscount,
} = require("../controllers/cartController");

// Get cart
router.get("/", verifyToken, getCart);

// Add to cart
router.post("/", verifyToken, addToCart);

// Remove from cart
router.delete("/product/:productId", verifyToken, removeFromCart);

// Decrease quantity
router.patch("/product/:productId/decrease", verifyToken, decreaseQuantity);

// Increase quantity
router.patch("/product/:productId/increase", verifyToken, increaseQuantity);

// Clear cart
router.delete("/", verifyToken, clearCart);

// Apply discount code to cart
router.post("/apply-discount", verifyToken, applyCartDiscount);

// Remove discount code from cart
router.post("/remove-discount", verifyToken, removeCartDiscount);

module.exports = router;
