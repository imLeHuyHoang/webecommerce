const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and validate token version
    const user = await User.findById(decoded.id);
    if (!user || user.tokenVersion !== decoded.version) {
      throw new Error("Invalid token version");
    }

    req.user = user; // Set req.user to the full user object
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};
