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

// Create a new order
router.post("/", verifyToken, createOrder);

// List all orders for the authenticated user
router.get("/", verifyToken, getUserOrders);

// Get details of a specific order
router.get("/:orderId", verifyToken, getOrderDetails);

// Cancel an order
router.patch("/:orderId/cancel", verifyToken, cancelOrder);

// Request support for an order
router.post("/:orderId/support", verifyToken, requestSupport);

// Leave a review for a product in the order
router.post("/:orderId/review", verifyToken, leaveReview);

module.exports = router;
