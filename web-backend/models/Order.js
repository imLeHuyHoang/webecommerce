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

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "pending", "cancelled"],
      default: "unpaid",
    },
    shippingStatus: {
      type: String,
      enum: ["processing", "shipping", "shipped", "cancelled"],
      default: "processing",
    },

    payment: {
      method: {
        type: String,
        enum: ["cod", "zalopay"],
        required: true,
      },
      transactionId: { type: String },
      appTransId: { type: String },
      isVerified: { type: Boolean, default: false },
    },
    note: { type: String, trim: true },
    refundId: { type: String },
    mRefundId: { type: String }, // Đảm bảo trường này có mặt trong schema
    refundStatus: { type: String, enum: ["processing", "success", "failed"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
