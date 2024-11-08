// routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Định nghĩa các route cho thanh toán
router.post("/create", paymentController.createOrder);
router.post("/callback", paymentController.paymentCallback); // Đây là route cần kiểm tra
module.exports = router;
