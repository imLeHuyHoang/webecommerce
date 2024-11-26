const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); // Logging
require("dotenv").config();
require("./db/connectDB"); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

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

// Middleware setup
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CorsOrigin,
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

// Static file serving
app.use("/category", express.static(__dirname + "/upload/category"));
app.use("/products", express.static(__dirname + "/upload/products"));

// Route registration

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
