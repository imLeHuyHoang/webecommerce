const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Định nghĩa các route cho thanh toán
router.post("/create", paymentController.createOrder);
router.get("/callback", paymentController.paymentCallback);

module.exports = router;
