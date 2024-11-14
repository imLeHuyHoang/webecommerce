const Order = require("../models/Order");
const Product = require("../models/Product");
const paymentService = require("../services/paymentService");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod } = req.body;

    if (!shippingAddress || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid order information." });
    }

    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product with ID: ${item.product} not found`);
        }
        return {
          product: product._id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
        };
      })
    );

    const totalAmount = productDetails.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id, // Ensure the user field is included
      shippingAddress,
      products: productDetails.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      total: totalAmount,
      payment: { method: paymentMethod, isVerified: false },
      paymentStatus: "pending",
      shippingStatus: "processing",
    });

    if (paymentMethod === "zalopay") {
      const paymentResult = await paymentService.processZaloPayPayment(
        order,
        productDetails
      );
      if (paymentResult.success) {
        return res.status(201).json({ orderUrl: paymentResult.orderUrl });
      } else {
        return res.status(400).json({ message: paymentResult.message });
      }
    }

    await order.save();

    res.status(201).json({ message: "Order created successfully." });
  } catch (error) {
    console.error("Error creating order:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };

    if (status) {
      query.shippingStatus = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("products.product", "title price images");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id,
    }).populate("products.product", "title price images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Error fetching order details" });
  }
};
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    console.log(
      `Attempting to cancel order with ID: ${orderId} for user ID: ${userId}`
    );

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      console.error(
        `Order with ID: ${orderId} not found for user ID: ${userId}`
      );
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.shippingStatus !== "processing") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    if (order.paymentStatus === "paid" && order.payment.method === "zalopay") {
      // Initiate refund process with ZaloPay
      const refundResult = await paymentService.refundZaloPayOrder(order);

      if (!refundResult.success) {
        console.error("Refund failed:", refundResult.message);
        return res.status(500).json({
          message: "Refund failed",
          error: refundResult.message,
        });
      }

      // Cập nhật trạng thái đơn hàng
      order.paymentStatus = "cancelled";
      order.shippingStatus = "cancelled";

      // Lưu order một lần duy nhất
      await order.save();

      return res.status(200).json({
        message:
          refundResult.message ||
          "Order cancelled and refund initiated successfully",
      });
    } else {
      // For unpaid orders or COD payment method
      order.paymentStatus = "cancelled";
      order.shippingStatus = "cancelled";
      await order.save();

      return res.status(200).json({ message: "Order cancelled successfully" });
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};
exports.requestSupport = async (req, res) => {
  try {
    const { message } = req.body;

    await SupportRequest.create({
      user: req.user.id,
      order: req.params.orderId,
      message,
    });

    res.status(200).json({ message: "Support request submitted successfully" });
  } catch (error) {
    console.error("Error submitting support request:", error);
    res.status(500).json({ message: "Error submitting support request" });
  }
};

exports.leaveReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productInOrder = order.products.find(
      (item) => item.product.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({ message: "Product not found in order" });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user.id, product: productId },
      { rating, comment },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Error submitting review" });
  }
};
// orderController.js

exports.getRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.refundId || !order.mRefundId) {
      return res
        .status(400)
        .json({ message: "Order has no refund information" });
    }

    const refundStatusResponse = await paymentService.getRefundStatus(
      order.mRefundId
    );

    // Xử lý returncode để hiển thị trạng thái dễ hiểu
    let refundStatusText = "";
    switch (refundStatusResponse.returncode) {
      case 1:
        refundStatusText = "success";
        break;
      case 2:
        refundStatusText = "processing";
        break;
      case 0:
        refundStatusText = "failed";
        break;
      case -1:
        refundStatusText = "failed";
        break;
      default:
        refundStatusText = "Không xác định";
    }

    // Cập nhật trạng thái hoàn tiền trong cơ sở dữ liệu
    order.refundStatus = refundStatusText;
    await order.save();

    res.status(200).json({
      orderId: order._id,
      refundStatus: refundStatusText,
      message: refundStatusResponse.returnmessage,
      mRefundId: order.mRefundId,
      rawData: refundStatusResponse,
    });
  } catch (error) {
    console.error("Error getting refund status:", error);
    res.status(500).json({ message: "Error getting refund status" });
  }
};
