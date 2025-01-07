// routes/attributeRoutes.js

const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");
const authAdmin = require("../middleware/authAdmin");

/**
 * @route   GET /api/attributes
 * @desc    Lấy tất cả attributes
 * @access  Public
 */
router.get("/", attributeController.getAllAttributes);

/**
 * @route   GET /api/attributes/category/:categoryId
 * @desc    Lấy attributes theo categoryId
 * @access  Public
 */
router.get(
  "/category/:categoryId",
  attributeController.getAttributesByCategoryId
);

/**
 * @route   GET /api/attributes/:id
 * @desc    Lấy attribute theo ID
 * @access  Public
 */
router.get("/:id", attributeController.getAttributeById);

/**
 * @route   POST /api/attributes
 * @desc    Tạo attribute mới
 * @access  Private (Admin Only)
 */
router.post("/", authAdmin, attributeController.createAttribute);

/**
 * @route   PUT /api/attributes/:id
 * @desc    Cập nhật attribute
 * @access  Private (Admin Only)
 */
router.put("/:id", authAdmin, attributeController.updateAttribute);

/**
 * @route   DELETE /api/attributes/:id
 * @desc    Xóa attribute
 * @access  Private (Admin Only)
 */
router.delete("/:id", authAdmin, attributeController.deleteAttribute);

module.exports = router;
