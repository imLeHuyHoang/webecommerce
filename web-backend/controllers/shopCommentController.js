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

    // Populate the author field with user details (e.g., name)
    await newComment.populate("author", "name");

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating shop comment:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all shop comments
exports.getShopComments = async (req, res) => {
  try {
    const comments = await ShopComment.find()
      .populate("author", "name") // Populate author details
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching shop comments:", error);
    res.status(500).json({ message: "Server error." });
  }
};
