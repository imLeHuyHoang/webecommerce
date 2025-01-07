const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { uploadCategory } = require("../middleware/uploadMiddleware");
const authAdmin = require("../middleware/authAdmin");

// Category routes
/**
 * @route   GET /api/categories
 * @desc    Lấy tất cả categories
 * @access  Public
 */
router.get("/", categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Lấy category theo ID
 * @access  Public
 */
router.get("/:id", categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Tạo category mới
 * @access  Private (Admin Only)
 */
router.post(
  "/",
  authAdmin,
  uploadCategory.array("images", 1),
  categoryController.createCategory
); // Chỉ cho phép tải lên 1 ảnh

/**
 * @route   PUT /api/categories/:id
 * @desc    Cập nhật category
 * @access  Private (Admin Only)
 */
router.put(
  "/:id",
  authAdmin,
  uploadCategory.array("images", 1),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Xóa category
 * @access  Private (Admin Only)
 */
router.delete("/:id", authAdmin, categoryController.deleteCategory);

module.exports = router;
