const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Tham chiếu đến bảng Product
      required: true,
    },
    location: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"], // Số lượng tồn kho
    },
    lastUpdated: {
      type: Date,
      default: Date.now, // Thời gian cập nhật tồn kho lần cuối
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
