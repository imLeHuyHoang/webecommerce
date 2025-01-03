const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("./db/connectDB");
const cronJobs = require("./services/cronJobs");
require("dotenv").config();

const app = express();
// Health check routes
app.get("/api/health", (req, res) => {
  console.log("Health check");
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
const corsOrigin = process.env.corsOrigin;
app.get("/api/unhealth", (req, res) => {
  console.log("Unhealth check");
  res.status(200).json({ status: "OK" });
});

if (!corsOrigin) {
  console.error("Error: corsOrigin environment variable is not set.");
  process.exit(1);
}

// Middleware setup
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Import routes
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const discountRoutes = require("./routes/discountRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const commentRoutes = require("./routes/commentRoutes");
const shopCommentsRouter = require("./routes/shopCommentRoutes");
//thống kê
const statisticRoutes = require("./routes/statisticRoutes");

// Route setup
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/products", reviewRoutes);
app.use("/api/products", commentRoutes);
app.use("/api/shop/comments", shopCommentsRouter);
app.use("/api/statistic", statisticRoutes);

// Static file serving
app.use("/category", express.static(__dirname + "/upload/category"));
app.use("/products", express.static(__dirname + "/upload/products"));

// Initialize cron jobs
cronJobs;

// Additional health check

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
