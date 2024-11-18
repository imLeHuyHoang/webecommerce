const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"], // Giá tại thời điểm thêm sản phẩm vào giỏ
        },
        discount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Discount", // Tham chiếu đến bảng Discount
          default: null,
        },
        totalPrice: {
          type: Number,
          required: true, // Tổng giá sau chiết khấu (price * quantity - discount)
        },
      },
    ],
    discountCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount", // Mã giảm giá áp dụng cho toàn bộ giỏ hàng
      default: null,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0, // Tổng số lượng sản phẩm trong giỏ
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0, // Tổng số tiền của giỏ (sau chiết khấu)
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
