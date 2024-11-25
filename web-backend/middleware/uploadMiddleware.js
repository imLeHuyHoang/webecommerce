const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Kiểm tra và tạo thư mục tạm thời nếu chưa tồn tại
const tempDir = path.join(__dirname, "../upload/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * Middleware để upload ảnh danh mục
 * Sử dụng multer để lưu trữ ảnh trong thư mục tạm thời
 */
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đặt thư mục lưu trữ ảnh là thư mục tạm thời
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Đặt tên file là tên gốc của file
    cb(null, file.originalname);
  },
});

// Tạo middleware uploadCategory sử dụng cấu hình lưu trữ categoryStorage
const uploadCategory = multer({ storage: categoryStorage });

/**
 * Middleware để upload ảnh sản phẩm
 * Sử dụng multer để lưu trữ ảnh trong thư mục tạm thời
 */
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đặt thư mục lưu trữ ảnh là thư mục tạm thời
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Đặt tên file là tên gốc của file
    cb(null, file.originalname);
  },
});

// Tạo middleware uploadProduct sử dụng cấu hình lưu trữ productStorage
const uploadProduct = multer({ storage: productStorage });

// Xuất các middleware để sử dụng trong các route khác
module.exports = {
  uploadCategory,
  uploadProduct,
};
