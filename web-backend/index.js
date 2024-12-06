const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); // Logging
require("dotenv").config();
require("./db/connectDB"); // Connect to MongoDB
const cronJobs = require("./services/cronJobs");

const app = express();
const PORT = process.env.PORT;
const CorsOrigin = process.env.CorsOrigin;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

// Middleware setup
app.use(morgan("dev"));
app.use(
  cors({
    origin: CorsOrigin,
    credentials: true,
  })
);
app.use(cookieParser());

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

// Static file serving
app.use("/category", express.static(__dirname + "/upload/category"));
app.use("/products", express.static(__dirname + "/upload/products"));

cronJobs;
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
