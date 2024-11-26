// models/Discount.js
const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // Mã giảm giá là duy nhất
      trim: true,
    },
    type: {
      type: String,
      enum: ["product", "cart"], // "product": áp dụng cho sản phẩm, "cart": áp dụng cho giỏ hàng
      required: true,
    },
    value: {
      type: Number,
      required: true, // Giá trị giảm giá
    },
    isPercentage: {
      type: Boolean,
      default: false, // true: giảm giá theo phần trăm, false: giảm giá cố định
    },
    minOrderValue: {
      type: Number,
      default: 0, // Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Sản phẩm áp dụng giảm giá (nếu có)
      },
    ],
    expiryDate: {
      type: Date,
      required: true, // Ngày hết hạn của mã giảm giá
    },
    isActive: {
      type: Boolean,
      default: true, // Trạng thái của mã giảm giá
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
