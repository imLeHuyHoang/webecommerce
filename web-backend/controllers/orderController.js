const Order = require("../models/Order");
const Product = require("../models/Product");
const Discount = require("../models/Discount");
const paymentService = require("../services/paymentService");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod, cartDiscountCode, note } =
      req.body;

    if (!shippingAddress || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid order information." });
    }

    // Ensure shippingAddress.phone is a string
    if (Array.isArray(shippingAddress.phone)) {
      shippingAddress.phone = shippingAddress.phone[0];
    }

    let totalAmount = 0;
    let cartDiscount = null;

    // Process product details with discounts
    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product with ID: ${item.product} not found`);
        }

        let price = product.price;
        let discount = null;

        // Process product discount if available
        if (item.discount) {
          discount = await Discount.findById(item.discount);
          if (discount) {
            const discountValue = discount.isPercentage
              ? (price * discount.value) / 100
              : discount.value;
            price -= discountValue;
          }
        }

        totalAmount += price * item.quantity;

        return {
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: price,
          discount: discount ? discount._id : null,
        };
      })
    );

    // Process cart-level discount if available
    if (cartDiscountCode) {
      cartDiscount = await Discount.findById(cartDiscountCode);
      if (cartDiscount) {
        const cartDiscountValue = cartDiscount.isPercentage
          ? (totalAmount * cartDiscount.value) / 100
          : cartDiscount.value;
        totalAmount -= cartDiscountValue;
      }
    }

    // Create the order
    const order = new Order({
      user: req.user._id,
      shippingAddress,
      products: productDetails,
      total: totalAmount,
      payment: { method: paymentMethod, isVerified: false },
      paymentStatus: "pending",
      shippingStatus: "processing",
      discountCode: cartDiscount ? cartDiscount._id : null,
      note: note || "",
      refund: {
        refundId: null,
        mRefundId: null,
        status: null,
        amount: null,
      },
    });

    if (paymentMethod === "zalopay") {
      const paymentResult = await paymentService.processZaloPayPayment(
        order,
        productDetails
      );
      if (paymentResult.success) {
        await order.save();
        return res.status(201).json({ orderUrl: paymentResult.orderUrl });
      } else {
        return res.status(400).json({ message: paymentResult.message });
      }
    }

    await order.save();

    res.status(201).json({ message: "Order created successfully.", order });
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
      .populate("products.product", "name price images")
      .populate("discountCode", "code value isPercentage");

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
    })
      .populate("products.product", "name price images")
      .populate("discountCode", "code value isPercentage");

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

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.shippingStatus !== "processing") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    if (order.paymentStatus === "paid" && order.payment.method === "zalopay") {
      // Initiate refund process with ZaloPay
      const refundResult = await paymentService.refundZaloPayOrder(order);

      if (!refundResult.success) {
        return res.status(500).json({
          message: "Refund failed",
          error: refundResult.message,
        });
      }

      // Update order status
      order.paymentStatus = "cancelled";
      order.shippingStatus = "cancelled";
      order.refund = {
        refundId: refundResult.refundId,
        mRefundId: refundResult.mRefundId,
        status: "processing",
        amount: refundResult.amount,
      };
      order.orderTimestamps.cancellation = new Date();

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
      order.orderTimestamps.cancellation = new Date();

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

    if (!order.refund || !order.refund.mRefundId) {
      return res
        .status(400)
        .json({ message: "Order has no refund information" });
    }

    const refundStatusResponse = await paymentService.getRefundStatus(
      order.refund.mRefundId
    );

    let refundStatusText = "";
    switch (refundStatusResponse.returncode) {
      case 1:
        refundStatusText = "success";
        break;
      case 2:
        refundStatusText = "processing";
        break;
      case 0:
      case -1:
        refundStatusText = "failed";
        break;
      default:
        refundStatusText = "unknown";
    }

    // Update refund status in the database
    order.refund.status = refundStatusText;
    await order.save();

    res.status(200).json({
      orderId: order._id,
      refundStatus: refundStatusText,
      message: refundStatusResponse.returnmessage,
      mRefundId: order.refund.mRefundId,
      rawData: refundStatusResponse,
    });
  } catch (error) {
    console.error("Error getting refund status:", error);
    res.status(500).json({ message: "Error getting refund status" });
  }
};

// New Admin Controllers

exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

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
      .populate("user", "name email")
      .populate("products.product", "name price images")
      .populate("discountCode", "code value isPercentage");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update shippingStatus and paymentStatus timestamps
    if (
      updateData.shippingStatus &&
      updateData.shippingStatus !== order.shippingStatus
    ) {
      order.shippingStatus = updateData.shippingStatus;
      if (updateData.shippingStatus === "shipping") {
        order.orderTimestamps.shipping = new Date();
      } else if (updateData.shippingStatus === "shipped") {
        order.orderTimestamps.delivery = new Date();
      }
    }

    if (
      updateData.paymentStatus &&
      updateData.paymentStatus !== order.paymentStatus
    ) {
      order.paymentStatus = updateData.paymentStatus;
      if (updateData.paymentStatus === "paid") {
        order.orderTimestamps.payment = new Date();
      }
    }

    // Ensure refund.status is not null
    if (updateData.refund && updateData.refund.status === null) {
      updateData.refund.status = "processing"; // Set a default value
    }

    // Update other fields
    Object.assign(order, updateData);

    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting order" });
  }
};
