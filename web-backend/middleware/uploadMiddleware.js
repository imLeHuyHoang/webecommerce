const multer = require("multer");
const path = require("path");

// Middleware for uploading category images
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../upload/category");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadCategory = multer({ storage: categoryStorage });

// Middleware for uploading product images
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../upload/products");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadProduct = multer({ storage: productStorage });

module.exports = {
  uploadCategory,
  uploadProduct,
};
