// models/Discount.js
const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["product", "cart"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    isPercentage: {
      type: Boolean,
      default: false,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableProducts: [
      // Danh sách sản phẩm áp dụng
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
