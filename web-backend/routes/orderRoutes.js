const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

router.post("/create", authMiddleware.verifyToken, orderController.createOrder);
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
router.post(
  "/:orderId/support",
  authMiddleware.verifyToken,
  orderController.requestSupport
);
router.post(
  "/:orderId/review",
  authMiddleware.verifyToken,
  orderController.leaveReview
);

router.get(
  "/:orderId/refund-status",
  authMiddleware.verifyToken,
  orderController.getRefundStatus
);

module.exports = router;
