// controllers/productCommentController.js
const mongoose = require("mongoose");
const ProductComment = require("../models/ProductComment");

// Tạo bình luận mới
const createComment = async (req, res) => {
  try {
    const { comment, parentComment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    console.log("Creating comment:", {
      comment,
      parentComment,
      productId,
      userId,
    });

    const newComment = new ProductComment({
      product: productId,
      user: userId,
      comment,
      parentComment: parentComment || null,
    });

    await newComment.save();
    res.status(201).json({ message: "Bình luận thành công", newComment });
  } catch (error) {
    console.error("Error in createComment:", error);
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

// Lấy danh sách bình luận cho sản phẩm dưới dạng danh sách phẳng
const getProductComments = async (req, res) => {
  try {
    const productIdStr = req.params.productId;

    // Kiểm tra xem productId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(productIdStr)) {
      console.error("Invalid productId:", productIdStr);
      return res.status(400).json({ message: "Product ID không hợp lệ." });
    }

    const productId = new mongoose.Types.ObjectId(productIdStr);

    const comments = await ProductComment.find({ product: productId })
      .populate("user", "name") // Chỉ lấy trường 'name' từ user
      .sort({ createdAt: -1 })
      .lean(); // Sử dụng lean để nhận được các đối tượng JavaScript thuần

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getProductComments:", error);
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

module.exports = { createComment, getProductComments };
