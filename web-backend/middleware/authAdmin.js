// middleware/authAdmin.js

module.exports = function (req, res, next) {
  // Kiểm tra xem môi trường có yêu cầu xác thực hay không
  if (!process.env.AUTH) return next();

  // Kiểm tra xem người dùng có quyền admin hay không
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send("Access denied (Admin Only)");
  }

  next();
};
