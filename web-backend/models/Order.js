const Discount = require("./Discount");

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
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        discount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Discount",
          default: null,
        },
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
    note: { type: String, trim: true, maxlength: 500 },
    refund: {
      refundId: { type: String },
      mRefundId: { type: String },
      status: {
        type: String,
        enum: ["processing", "success", "failed"],
      },
      amount: { type: Number, min: 0 },
    },
    orderTimestamps: {
      payment: { type: Date },
      shipping: { type: Date },
      delivery: { type: Date },
      cancellation: { type: Date },
    },
    discountCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware to handle total calculation considering discounts
// order.js

orderSchema.pre("save", async function (next) {
  let total = 0;

  // Recalculate total based on discounted prices
  for (const item of this.products) {
    total += item.price * item.quantity;
  }

  // Apply cart-level discount if present
  if (this.discountCode) {
    const cartDiscount = await Discount.findById(this.discountCode);
    if (cartDiscount) {
      const cartDiscountValue = cartDiscount.isPercentage
        ? (total * cartDiscount.value) / 100
        : cartDiscount.value;
      total -= cartDiscountValue;
    }
  }

  this.total = total;
  next();
});

module.exports = mongoose.model("Order", orderSchema);
