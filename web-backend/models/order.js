const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    payment: {
      method: {
        type: String,
        enum: ["cod", "zalopay"],
        required: true,
      },
      transactionId: { type: String },
      appTransId: { type: String }, // Thêm trường này
      isVerified: { type: Boolean, default: false }, // trường này để xác nhận thanh toán đã được xác minh hay chưa
    },

    note: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
