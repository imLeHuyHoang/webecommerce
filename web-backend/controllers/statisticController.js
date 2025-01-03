// controllers/statisticController.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const ProductReview = require("../models/ProductReview");
const User = require("../models/User");

/**
 * Các trạng thái đơn hàng (có thể điều chỉnh tùy theo logic thực tế):
 * - unconfirmed: (paymentStatus = "pending" hoặc shippingStatus = "processing")
 * - preparing: (shippingStatus = "shipping")
 * - shipped: (shippingStatus = "shipped")
 * - cancelled: (shippingStatus = "cancelled" hoặc paymentStatus = "cancelled")
 */

// Hàm lấy năm hiện tại
function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Lấy tổng số sản phẩm.
 */
exports.getTotalProducts = async (req, res) => {
  try {
    const total = await Product.countDocuments({});
    return res.json({ totalProducts: total });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy số lượng sản phẩm theo danh mục
 * Sử dụng aggregate để group theo category, sau đó lookup ra tên category.
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }, // nhóm các sản phẩm theo category, tạo id là category và đếm số sản phẩm
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          count: 1,
          categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
        },
      },
    ]);

    return res.json({ productsByCategory: data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy thống kê số lượng đơn hàng theo trạng thái.
 * - unconfirmed: paymentStatus = "pending" hoặc shippingStatus = "processing"
 * - preparing: shippingStatus = "shipping"
 * - shipped: shippingStatus = "shipped"
 * - cancelled: shippingStatus = "cancelled" hoặc paymentStatus = "cancelled"
 */
exports.getOrderCounts = async (req, res) => {
  try {
    const [unconfirmedCount, preparingCount, shippedCount, cancelledCount] =
      await Promise.all([
        Order.countDocuments({
          $or: [{ paymentStatus: "pending" }, { shippingStatus: "processing" }],
        }),
        Order.countDocuments({ shippingStatus: "shipping" }),
        Order.countDocuments({ shippingStatus: "shipped" }),
        Order.countDocuments({
          $or: [
            { shippingStatus: "cancelled" },
            { paymentStatus: "cancelled" },
          ],
        }),
      ]);

    return res.json({
      unconfirmedCount,
      preparingCount,
      shippedCount,
      cancelledCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Thống kê doanh thu tổng (từ tất cả các đơn hàng không bị hủy).
 * - Mặc định tính tất cả thời gian.
 * - Có thể mở rộng thêm query param: startDate, endDate để lọc theo khoảng thời gian.
 */
exports.getTotalRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = { shippingStatus: { $ne: "cancelled" } };
    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) {
      match.createdAt = match.createdAt || {};
      match.createdAt.$lte = new Date(endDate);
    }

    const result = await Order.aggregate([
      { $match: match },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    return res.json({ totalRevenue });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Thống kê đơn hàng và doanh thu theo tháng của một năm nhất định.
 * Query param: year=YYYY
 * Nếu không truyền year thì lấy năm hiện tại.
 * Có thể mở rộng thêm param month nếu cần thống kê theo từng ngày.
 */
exports.getMonthlyStatistics = async (req, res) => {
  try {
    let { year, startDate, endDate, excludeCancelled } = req.query;
    excludeCancelled = excludeCancelled === "true";

    const match = {};

    // Xác định thời gian lọc
    if (startDate || endDate) {
      // Nếu có startDate, endDate, sử dụng chúng
      if (startDate) match.createdAt = { $gte: new Date(startDate) };
      if (endDate) {
        match.createdAt = match.createdAt || {};
        match.createdAt.$lte = new Date(endDate);
      }
    } else {
      // Nếu không có startDate, endDate thì dùng year
      const yearInt = parseInt(year, 10) || getCurrentYear();
      match.createdAt = {
        $gte: new Date(yearInt, 0, 1),
        $lt: new Date(yearInt + 1, 0, 1),
      };
    }

    // Loại bỏ đơn hàng hủy nếu excludeCancelled = true
    if (excludeCancelled) {
      match.shippingStatus = { $ne: "cancelled" };
    }

    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Trả về kết quả
    return res.json({ monthlyStatistics: data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Thống kê đánh giá:
 * - Tổng số đánh giá
 * - Đánh giá trung bình
 * Có thể mở rộng bằng cách truyền productId để lọc đánh giá theo sản phẩm.
 */
exports.getReviewsStatistics = async (req, res) => {
  try {
    const { productId } = req.query;
    const match = {};
    if (productId) {
      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }
      match.product = productId;
    }

    const totalReviews = await ProductReview.countDocuments(match);

    const avgResult = await ProductReview.aggregate([
      { $match: match },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const avgRating = avgResult.length > 0 ? avgResult[0].avgRating : 0;
    return res.json({
      totalReviews,
      avgRating,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Thống kê số khách hàng đăng ký mới theo tháng/năm.
 * Query param: year=YYYY
 * Mặc định là năm hiện tại nếu không truyền.
 * Có thể mở rộng bằng cách lọc startDate, endDate.
 */
exports.getCustomerStatistics = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || getCurrentYear();

    const matchStage = {
      $match: {
        createAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      },
    };

    const groupStage = {
      $group: {
        _id: { month: { $month: "$createAt" } },
        newCustomers: { $sum: 1 },
      },
    };

    const sortStage = { $sort: { "_id.month": 1 } };

    const data = await User.aggregate([matchStage, groupStage, sortStage]);
    return res.json({ customerStatistics: data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Thống kê top 10 sản phẩm bán chạy nhất (tính theo tổng quantity).
 * Có thể mở rộng thêm lọc thời gian.
 * Query param: startDate, endDate để giới hạn thời gian tính top sản phẩm.
 */
exports.getTopSellingProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {
      shippingStatus: { $ne: "cancelled" },
      paymentStatus: { $ne: "cancelled" },
    };

    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) {
      match.createdAt = match.createdAt || {};
      match.createdAt.$lte = new Date(endDate);
    }

    // Lấy dữ liệu đơn hàng, sum quantity theo product
    const data = await Order.aggregate([
      { $match: match },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }, // Changed to top 10 as per comment
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          totalSold: 1,
          productName: { $arrayElemAt: ["$productInfo.name", 0] },
        },
      },
    ]);

    return res.json({ topSellingProducts: data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
