const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { uploadProduct } = require("../middleware/uploadMiddleware"); // Import multer middleware
const authAdmin = require("../middleware/authAdmin"); // Import middleware authAdmin

/**
 * @route   GET /api/products
 * @desc    Lấy tất cả sản phẩm
 * @access  Public
 */
router.get("/", productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Lấy sản phẩm theo ID
 * @access  Public
 */
router.get("/:id", productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới
 * @access  Private (Admin Only)
 */
router.post(
  "/",
  authAdmin,
  uploadProduct.any(),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm
 * @access  Private (Admin Only)
 */
router.put(
  "/:id",
  authAdmin,
  uploadProduct.any(),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm
 * @access  Private (Admin Only)
 */
router.delete("/:id", authAdmin, productController.deleteProduct);

module.exports = router;
