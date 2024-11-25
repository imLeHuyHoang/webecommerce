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
        price: { type: Number, required: true }, // Giá tại thời điểm mua
        discount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Discount", // Tham chiếu đến bảng Discount
          default: null,
        },
      },
    ],
    total: { type: Number, required: true, min: 0 }, // Tổng số tiền đơn hàng

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

    refund: {
      refundId: { type: String }, // Mã hoàn tiền từ phía ngân hàng hoặc ZaloPay
      mRefundId: { type: String }, // Mã hoàn tiền từ hệ thống nội bộ
      status: {
        type: String,
        enum: ["processing", "success", "failed"],
      },
      amount: { type: Number, min: 0 }, // Số tiền được hoàn lại
    },

    timestamps: {
      paymentDate: { type: Date }, // Ngày thanh toán
      shippingDate: { type: Date }, // Ngày giao hàng
      deliveryDate: { type: Date }, // Ngày hoàn tất giao hàng
      cancelledDate: { type: Date }, // Ngày hủy đơn hàng
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
