// routes/discountRoutes.js
const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");
const authAdmin = require("../middleware/authAdmin");

// Các route này yêu cầu người dùng phải là admin
router.post("/", authAdmin, discountController.createDiscount);
router.get("/", authAdmin, discountController.getAllDiscounts);
router.get("/:id", authAdmin, discountController.getDiscountById);
router.put("/:id", authAdmin, discountController.updateDiscount);
router.delete("/:id", authAdmin, discountController.deleteDiscount);

module.exports = router;
