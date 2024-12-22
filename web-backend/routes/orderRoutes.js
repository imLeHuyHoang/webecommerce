const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");
const authAdminMiddleware = require("../middleware/authAdmin");
// Public routes
router.post("/create", authMiddleware.verifyToken, orderController.createOrder);

// User routes
router.get(
  "/status-counts",
  authMiddleware.verifyToken,
  orderController.getOrderStatusCounts
);
router.get("/", authMiddleware.verifyToken, orderController.getUserOrders);
router.get(
  "/:orderId",
  authMiddleware.verifyToken,
  orderController.getOrderDetails
);
router.patch(
  "/:orderId/cancel",
  authMiddleware.verifyToken,
  orderController.cancelOrder
);

router.get(
  "/:orderId/refund-status",
  authMiddleware.verifyToken,
  orderController.getRefundStatus
);

// Admin routes
router.get("/admin/all", authAdminMiddleware, orderController.getAllOrders);
router.patch(
  "/admin/:orderId",
  authAdminMiddleware,
  orderController.updateOrder
);
router.delete(
  "/admin/:orderId",
  authAdminMiddleware,
  orderController.deleteOrder
);

module.exports = router;
