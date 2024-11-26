// models/Cart.js
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
          min: [0, "Price cannot be negative"], // Price at the time of adding to cart
        },
        discount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Discount", // Reference to Discount model
          default: null,
        },
        totalPrice: {
          type: Number,
          required: true, // Total price after discount (price * quantity - discount)
        },
      },
    ],
    discountCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount", // Discount code applied to the entire cart
      default: null,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0, // Total quantity of products in the cart
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0, // Total amount of the cart (after discounts)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
