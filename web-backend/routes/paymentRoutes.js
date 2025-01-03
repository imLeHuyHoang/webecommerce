const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/callback", paymentController.paymentCallback);
router.get("/redirect", redirectController.handleZaloPayRedirect);

module.exports = router;
