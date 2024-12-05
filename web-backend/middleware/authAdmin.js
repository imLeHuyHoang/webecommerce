// middleware/authAdmin.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Kiểm tra sự tồn tại và định dạng của header Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  // Trích xuất token từ header
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    // Kiểm tra xem người dùng có phải là admin hay không (giả sử decoded có thuộc tính role)
    if (!decoded.roles.includes("admin")) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded; // Gán thông tin người dùng vào req.user
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};
