const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); // Ghi log cho request
require("dotenv").config();
require("./db/connectDB"); // Kết nối tới MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Middleware - Ghi log và xử lý JSON request
app.use(morgan("dev")); // Ghi log cho request HTTP
app.use(
  cors({
    origin: "http://localhost:5173", // Chỉ cho phép frontend gọi API từ địa chỉ này
    credentials: true, // Cho phép gửi cookie
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (Hình ảnh, danh mục)
app.use("/category", express.static(__dirname + "/upload/category"));
app.use("/profile", express.static(__dirname + "/upload/profiles"));
app.use("/products", express.static(__dirname + "/upload/products"));
app.use("/images", express.static(__dirname + "/upload/products"));

// Định tuyến cho các API
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// Middleware xử lý lỗi (Error Handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
