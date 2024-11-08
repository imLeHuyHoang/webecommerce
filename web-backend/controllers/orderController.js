// controllers/orderController.js

const paymentService = require("../services/paymentService");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod } = req.body;
    if (!["cod", "zalopay"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }
    // Validate input and calculate total amount
    const productDetails = await Promise.all(
      products.map(async (item) => {
        const productData = await Product.findById(item.product);
        if (!productData) {
          throw new Error(`Product ${item.product} not found`);
        }
        return {
          product: item.product,
          quantity: item.quantity,
          price: productData.price,
        };
      })
    );

    const total = productDetails.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create the order in MongoDB
    const order = await Order.create({
      user: req.user.id,
      shippingAddress,
      products: productDetails,
      total,
      payment: { method: paymentMethod, isVerified: false },
      paymentStatus: "pending", // Use the new paymentStatus field
      shippingStatus: "processing", // Use the new shippingStatus field
    });

    // Integrate with ZaloPay if the payment method is ZaloPay
    if (paymentMethod === "zalopay") {
      const zaloPayOrder = await createOrderWithZaloPay(order);

      // Save transaction information in the order
      order.payment.transactionId = zaloPayOrder.order_token;
      order.payment.appTransId = zaloPayOrder.app_trans_id;
      await order.save();

      return res.status(201).json({ orderUrl: zaloPayOrder.order_url });
    }

    // Handle other payment methods (e.g., COD)
    res.status(201).json({ message: "Order created successfully." });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

async function createOrderWithZaloPay(order) {
  const appTransId = generateAppTransId();

  // Retrieve product information for the item names
  const items = await Promise.all(
    order.products.map(async (item) => {
      const productData = await Product.findById(item.product);
      if (!productData) {
        throw new Error(`Product ${item.product} not found`);
      }
      return {
        itemid: item.product.toString(),
        itemname: productData.title,
        itemprice: item.price,
        itemquantity: item.quantity,
      };
    })
  );

  const orderInfo = {
    amount: order.total,
    appTransId,
    items,
    embedData: {
      orderId: order._id.toString(),
    },
  };

  console.log("Order Info:", orderInfo);

  const zaloPayResponse = await paymentService.createOrder(orderInfo);

  if (zaloPayResponse.return_code === 1) {
    return {
      order_url: zaloPayResponse.order_url,
      order_token: zaloPayResponse.zp_trans_token,
      app_trans_id: appTransId,
    };
  } else {
    console.error("ZaloPay Error:", zaloPayResponse);
    throw new Error(zaloPayResponse.return_message);
  }
}

function generateAppTransId() {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const time = date.getTime().toString().slice(-6);
  return `${yy}${mm}${dd}_${time}`;
}

// 1. List all orders for the authenticated user
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

// 3. Cancel an order if it's still processing
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancellation if the order is still processing
    if (order.shippingStatus !== "processing") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    if (order.paymentStatus === "paid" && order.payment.method === "zalopay") {
      // Initiate refund process with ZaloPay
      const refundResult = await paymentService.refundOrder(
        order.payment.appTransId,
        order.total
      );

      if (refundResult.return_code !== 1) {
        return res.status(500).json({
          message: "Refund failed",
          error: refundResult.return_message,
        });
      }

      order.paymentStatus = "cancelled";
      order.shippingStatus = "cancelled";
      await order.save();

      return res
        .status(200)
        .json({ message: "Order cancelled and refund initiated successfully" });
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

// 4. Placeholder for requesting support for an order

exports.requestSupport = async (req, res) => {
  try {
    const { message } = req.body;

    // Save support request to database
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

// 5. Placeholder for leaving a review for a product
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

    // Create or update the review
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
