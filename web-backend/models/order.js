const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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
          min: 1,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered"],
      default: "pending",
    },
    payment: {
      method: {
        type: String,
        enum: ["credit card", "debit card", "paypal"],
      },
      transactionId: {
        type: String,
      },
      isVerified: {
        type: Boolean, // Xác thực thanh toán thành công hay chưa
        default: false,
      },
    },
    coupon: {
      code: {
        type: String, // Mã giảm giá
        default: null,
      },
      discount: {
        type: Number, // Phần trăm hoặc số tiền giảm
        min: 0,
        default: 0,
      },
    },
    note: {
      type: String, // Ghi chú thêm từ người dùng
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
