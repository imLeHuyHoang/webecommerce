const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { uploadProduct } = require("../middleware/uploadMiddleware");
const authAdmin = require("../middleware/authAdmin");
const { verifyToken } = require("../middleware/auth");

/**
 * @route   GET /api/products
 * @desc    Lấy tất cả sản phẩm
 * @access  Public
 */
router.get("/", productController.getAllProducts);

/**
 * @route   POST /api/products/compare
 * @desc    So sánh hai sản phẩm
 * @access  Public
 */
router.post("/compare", productController.compareProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Lấy sản phẩm theo ID
 * @access  Public
 */
router.get("/:id", productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới
 * @access  Private (Admin only)
 */
router.post(
  "/",
  verifyToken,
  authAdmin,
  uploadProduct.array("images"),
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  verifyToken,
  authAdmin,
  uploadProduct.any(),
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm
 * @access  Private (Admin only)
 */
router.delete("/:id", verifyToken, authAdmin, productController.deleteProduct);

module.exports = router;
