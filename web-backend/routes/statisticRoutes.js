// routes/statisticRoutes.js
const express = require("express");
const router = express.Router();
const {
  getTotalProducts,
  getProductsByCategory,
  getOrderCounts,
  getTotalRevenue,
  getMonthlyStatistics,
  getReviewsStatistics,
  getCustomerStatistics,
  getTopSellingProducts,
} = require("../controllers/statisticController");
const adminMiddleware = require("../middleware/authAdmin");

// Lấy tổng số sản phẩm
router.get("/total-products", getTotalProducts);

// Lấy số lượng sản phẩm theo danh mục
router.get("/products-by-category", getProductsByCategory);

// Lấy thống kê đơn hàng theo trạng thái
router.get("/order-counts", getOrderCounts);

// Lấy tổng doanh thu
router.get("/total-revenue", getTotalRevenue);

// Lấy thống kê theo tháng/năm (tham số year=?)
router.get("/monthly-statistics", getMonthlyStatistics);

// Thống kê đánh giá (tổng số, trung bình)
router.get("/reviews-statistics", getReviewsStatistics);

// Thống kê khách hàng đăng ký theo tháng/năm (year=?)
router.get("/customer-statistics", getCustomerStatistics);

// Thống kê top 10 sản phẩm bán chạy nhất
router.get("/top-selling-products", getTopSellingProducts);

module.exports = router;
