const express = require("express");
const { createOrder } = require("../controllers/orderController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/", verifyToken, createOrder);

module.exports = router;
