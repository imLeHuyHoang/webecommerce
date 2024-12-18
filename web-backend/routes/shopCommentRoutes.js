// routes/shopComments.js
const express = require("express");
const { verifyToken } = require("../middleware/auth");
const shopCommentController = require("../controllers/shopCommentController");

const router = express.Router();

// Route to create a new shop comment (protected)
router.post("/", verifyToken, shopCommentController.createShopComment);

// Route to get all shop comments (public)
router.get("/", shopCommentController.getShopComments);

module.exports = router;
