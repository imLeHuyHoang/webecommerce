// controllers/productCommentController.js
const mongoose = require("mongoose");
const ProductComment = require("../models/ProductComment");

/**
 * Tạo bình luận mới
 */
exports.createComment = async (req, res) => {
  try {
    const { comment, parentComment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id; // lấy từ verifyToken

    console.log("Creating comment:", {
      comment,
      parentComment,
      productId,
      userId,
    });

    // Tạo new comment
    const newComment = new ProductComment({
      product: productId,
      user: userId,
      comment,
      parentComment: parentComment || null,
    });

    await newComment.save();
    res.status(201).json({
      message: "Bình luận thành công",
      newComment,
    });
  } catch (error) {
    console.error("Error in createComment:", error);
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

/**
 * Lấy danh sách bình luận cho 1 sản phẩm (dạng phẳng)
 */
exports.getProductComments = async (req, res) => {
  try {
    const productIdStr = req.params.productId;

    // Kiểm tra productId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productIdStr)) {
      console.error("Invalid productId:", productIdStr);
      return res.status(400).json({ message: "Product ID không hợp lệ." });
    }

    const productId = new mongoose.Types.ObjectId(productIdStr);

    // Populate user => trả về { _id, name, roles }
    const comments = await ProductComment.find({ product: productId })
      .populate("user", "name _id roles")
      .sort({ createdAt: -1 })
      .lean(); // .lean() => plain object

    // Trả về client
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getProductComments:", error);
    res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

/**
 * Cập nhật bình luận
 */
exports.updateComment = async (req, res) => {
  try {
    const { productId, commentId } = req.params;
    const { comment } = req.body;

    // Tìm comment
    const existingComment = await ProductComment.findById(commentId).populate(
      "user",
      "roles _id"
    );
    if (!existingComment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bình luận cần cập nhật." });
    }

    // Kiểm tra comment có thuộc product này không
    if (existingComment.product.toString() !== productId) {
      return res
        .status(400)
        .json({ message: "Bình luận không thuộc về sản phẩm này." });
    }

    // Kiểm tra quyền
    const isOwner =
      existingComment.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");

    // => CHỈ chủ sở hữu HOẶC admin => Mới sửa
    // (Ở đây, tùy bạn: admin có thể sửa luôn hay không. Mình cho admin chỉ xóa, còn sửa
    //  thì vẫn cần là chủ => isOwner. Sửa tùy logic.)
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền sửa bình luận này." });
    }

    // Cập nhật
    existingComment.comment = comment;
    await existingComment.save();

    return res.status(200).json({
      message: "Cập nhật bình luận thành công.",
      updatedComment: existingComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi cập nhật bình luận." });
  }
};

/**
 * Xóa bình luận
 */
exports.deleteComment = async (req, res) => {
  try {
    const { productId, commentId } = req.params;

    // Tìm comment
    const existingComment = await ProductComment.findById(commentId).populate(
      "user",
      "roles _id"
    );
    if (!existingComment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bình luận cần xóa." });
    }

    // Kiểm tra comment có thuộc product này không
    if (existingComment.product.toString() !== productId) {
      return res
        .status(400)
        .json({ message: "Bình luận không thuộc về sản phẩm này." });
    }

    // Kiểm tra quyền
    const isOwner =
      existingComment.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes("admin");

    // => CHỦ HOẶC ADMIN => có quyền xóa
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bình luận này." });
    }

    await ProductComment.findByIdAndRemove(commentId);

    return res.status(200).json({ message: "Xóa bình luận thành công." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi xóa bình luận." });
  }
};
