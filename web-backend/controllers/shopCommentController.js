// controllers/shopCommentController.js
const ShopComment = require("../models/ShopComment");

// Create a new shop comment
exports.createShopComment = async (req, res) => {
  try {
    const { text } = req.body;
    const author = req.user.id; // Assuming `verifyToken` middleware adds `user` to `req`

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const newComment = new ShopComment({
      text,
      author,
    });

    await newComment.save();

    await newComment.populate("author", "name");

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating shop comment:", error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getShopComments = async (req, res) => {
  try {
    const comments = await ShopComment.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching shop comments:", error);
    res.status(500).json({ message: "Server error." });
  }
};
exports.deleteShopComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await ShopComment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    return res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting shop comment:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
