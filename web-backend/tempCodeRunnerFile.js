const mongoose = require("mongoose");
require("dotenv").config();

// Import các schemas
const Cart = require("./models/Cart");
const Category = require("./models/Category");
const CategoryAttributes = require("./models/CategoryAttributes");
const Discount = require("./models/Discount");
const Inventory = require("./models/Inventory");
const Order = require("./models/Order");
const Product = require("./models/Product");
const Reply = require("./models/Reply");
const Review = require("./models/Review");
const User = require("./models/User");

// Kết nối đến MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Nạp dữ liệu mẫu
const seedData = async () => {
  try {
    // Xóa dữ liệu cũ trong các collections
    await Cart.deleteMany({});
    await Category.deleteMany({});
    await CategoryAttributes.deleteMany({});
    await Discount.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Reply.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});

    console.log("Dữ liệu cũ đã được xóa!");

    // Thêm dữ liệu mẫu
    const user = await User.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
      gender: "male",
      addresses: [
        {
          province: "Hà Nội",
          district: "Ba Đình",
          ward: "Ngọc Hà",
          street: "123 Đội Cấn",
          default: true,
        },
      ],
    });

    const category = await Category.create({
      name: "Laptops",
      images: ["https://example.com/laptop.jpg"],
      descriptions: "Danh mục các loại laptop hiện đại.",
    });

    const categoryAttributes = await CategoryAttributes.create({
      categoryId: category._id,
      attributes: [
        { key: "Processor", type: "String" },
        { key: "RAM", type: "Number" },
        { key: "Storage", type: "String" },
      ],
    });

    const product = await Product.create({
      name: "MacBook Pro 16-inch",
      description: "Laptop cao cấp của Apple.",
      images: ["https://example.com/macbook.jpg"],
      brand: "Apple",
      price: 2000,
      category: category._id,
      attributes: [
        { key: "Processor", value: "M1 Max" },
        { key: "RAM", value: "32GB" },
      ],
    });

    const inventory = await Inventory.create({
      product: product._id,
      quantity: 10,
    });

    const discount = await Discount.create({
      code: "SUMMER2024",
      percentage: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 tuần
    });

    const review = await Review.create({
      user: user._id,
      product: product._id,
      comment: "Sản phẩm rất tốt!",
      rating: 5,
    });

    const reply = await Reply.create({
      user: user._id,
      review: review._id,
      comment: "Cảm ơn bạn đã phản hồi!",
    });

    const order = await Order.create({
      user: user._id,
      shippingAddress: {
        name: user.name,
        phone: "0123456789",
        address: "123 Đội Cấn, Hà Nội",
      },
      products: [
        {
          product: product._id,
          quantity: 1,
          price: 2000,
          discount: discount._id,
        },
      ],
      total: 1600,
      payment: { method: "cod", isVerified: true },
    });

    const cart = await Cart.create({
      user: user._id,
      products: [
        {
          product: product._id,
          quantity: 1,
          price: 2000,
          totalPrice: 2000,
        },
      ],
      totalQuantity: 1,
      totalAmount: 2000,
    });

    console.log("Dữ liệu mẫu đã được nạp thành công!");
    process.exit();
  } catch (error) {
    console.error("Lỗi khi nạp dữ liệu:", error);
    process.exit(1);
  }
};

// Thực thi
(async () => {
  await connectDB();
  await seedData();
})();
