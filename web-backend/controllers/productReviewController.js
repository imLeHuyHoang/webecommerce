// controllers/productReviewController.js
const ProductReview = require("../models/ProductReview");
const Product = require("../models/Product");

// Tạo hoặc chỉnh sửa đánh giá sản phẩm
const createOrUpdateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    let review = await ProductReview.findOne({
      product: productId,
      user: userId,
    });
    if (review) {
      // Nếu đã có đánh giá, chỉnh sửa đánh giá cũ
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Nếu chưa có đánh giá, tạo mới
      review = new ProductReview({
        product: productId,
        user: userId,
        rating,
        comment,
      });
      await review.save();
    }

    // Cập nhật lại điểm trung bình của sản phẩm
    const reviews = await ProductReview.find({ product: productId });
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount: reviews.length,
    });

    res.status(200).json({ message: "Đánh giá thành công", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

// Lấy danh sách đánh giá của sản phẩm
const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await ProductReview.find({ product: productId }).populate(
      "user",
      "name"
    );
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

module.exports = { createOrUpdateReview, getProductReviews };
