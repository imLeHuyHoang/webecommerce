const Order = require("../models/Order");
const Product = require("../models/Product");
const Discount = require("../models/Discount");
const paymentService = require("../services/paymentService");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { shippingAddress, products, paymentMethod, cartDiscountCode, note } =
      req.body;

    if (!shippingAddress || !products || products.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Thông tin đơn hàng không hợp lệ." });
    }

    // Đảm bảo phone là string
    if (Array.isArray(shippingAddress.phone)) {
      shippingAddress.phone = shippingAddress.phone[0];
    }

    let totalAmount = 0;
    let cartDiscount = null;

    // Xử lý chi tiết sản phẩm với discount
    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${item.product}`);
        }

        let price = product.price;
        let discount = null;

        // Xử lý discount sản phẩm nếu có
        if (item.discount) {
          discount = await Discount.findById(item.discount).session(session);
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

    // Xử lý discount cho toàn bộ giỏ hàng nếu có
    if (cartDiscountCode) {
      cartDiscount = await Discount.findById(cartDiscountCode).session(session);
      if (cartDiscount) {
        const cartDiscountValue = cartDiscount.isPercentage
          ? (totalAmount * cartDiscount.value) / 100
          : cartDiscount.value;
        totalAmount -= cartDiscountValue;
      }
    }

    // Tạo đơn hàng
    const order = new Order({
      user: req.user._id,
      shippingAddress,
      products: productDetails,
      total: totalAmount,
      payment: { method: paymentMethod, isVerified: false },
      paymentStatus: paymentMethod === "zalopay" ? "pending" : "unpaid",
      paymentExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 phút
      shippingStatus: "processing",
      discountCode: cartDiscount ? cartDiscount._id : null,
      note: note || "",
      refund: {
        refundId: null,
        mRefundId: null,
        status: "null",
        amount: null,
      },
    });

    // Lưu đơn hàng trước khi xử lý thanh toán
    await order.save({ session });

    if (paymentMethod === "zalopay") {
      // Gọi dịch vụ thanh toán ZaloPay sau khi đơn hàng đã được lưu
      const paymentResult = await paymentService.processZaloPayPayment(
        order,
        productDetails
      );
      if (paymentResult.success) {
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({ orderUrl: paymentResult.orderUrl });
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: paymentResult.message });
      }
    }

    if (paymentMethod === "cod") {
      // Xử lý giảm tồn kho và xóa giỏ hàng
      // 1. Kiểm tra và giảm tồn kho
      for (const item of productDetails) {
        const inventory = await Inventory.findOne({
          product: item.product,
        }).session(session);
        if (!inventory) {
          throw new Error(
            `Không tìm thấy tồn kho cho sản phẩm: ${item.product}`
          );
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(
            `Sản phẩm ${item.name} không đủ số lượng. Tồn kho hiện tại: ${inventory.quantity}`
          );
        }

        // Giảm số lượng tồn kho
        inventory.quantity -= item.quantity;
        inventory.lastUpdated = new Date();
        await inventory.save({ session });
      }

      // 2. Xóa giỏ hàng của người dùng
      await Cart.findOneAndDelete({ user: req.user._id }).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({ message: "Đặt hàng thành công.", order });
    }

    // Nếu phương thức thanh toán không hợp lệ
    await session.abortTransaction();
    session.endSession();
    return res
      .status(400)
      .json({ message: "Phương thức thanh toán không hợp lệ." });
  } catch (error) {
    console.error("Error creating order:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: "Có lỗi xảy ra khi tạo đơn hàng.",
      error: error.message,
    });
  }
};
exports.getOrderStatusCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`Fetching order status counts for user: ${userId}`);

    const counts = await Order.aggregate([
      {
        $match: {
          user: userId,
          paymentStatus: { $ne: "pending" },
        },
      },
      {
        $group: {
          _id: "$shippingStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log(`Order counts by status for user ${userId}:`, counts);

    const statusCounts = {
      processing: 0,
      shipping: 0,
      shipped: 0,
      cancelled: 0,
    };

    counts.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    console.log(`Final status counts for user ${userId}:`, statusCounts);

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error("Error fetching order status counts:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin đơn hàng." });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query; // Không dùng page, limit
    const userId = req.user._id;

    const query = {
      user: userId,
      paymentStatus: { $ne: "pending" },
    };

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

// controllers/orderController.js

// controllers/orderController.js

exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { orderId } = req.params;
    const userId = req.user.id;

    console.log(`Cancelling Order ID: ${orderId} for User ID: ${userId}`);

    const order = await Order.findOne({ _id: orderId, user: userId }).session(
      session
    );

    if (!order) {
      console.log("Order not found during cancellation.");
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order found:", order);

    if (order.shippingStatus !== "processing") {
      console.log("Order cannot be cancelled due to its shipping status.");
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    // Process ZaloPay Refund if payment is done via ZaloPay and status is 'paid'
    if (order.paymentStatus === "paid" && order.payment.method === "zalopay") {
      console.log("Processing ZaloPay refund...");
      const refundResult = await paymentService.refundZaloPayOrder(order);
      console.log("Refund Result:", refundResult);

      if (!refundResult.success) {
        console.log("Refund failed:", refundResult.message);
        await session.abortTransaction();
        return res.status(500).json({
          message: "Refund failed",
          error: refundResult.message,
        });
      }

      // Update order refund status
      order.paymentStatus = "cancelled";
      order.shippingStatus = "cancelled";
      // Cập nhật thông tin hoàn tiền từ refundResult
      order.refund = {
        refundId: refundResult.refundId, // ID hoàn tiền từ ZaloPay
        mRefundId: refundResult.mRefundId, // Mã hoàn tiền bổ sung nếu có
        status: "processing", // Trạng thái ban đầu
        amount: refundResult.amount, // Số tiền hoàn lại
      };
      order.orderTimestamps.cancellation = new Date();

      console.log("Updated Order with Refund Information:", order);

      // Lưu đơn hàng với các thay đổi
      await order.save({ session });

      await session.commitTransaction();

      return res.status(200).json({
        message: "Order cancelled and refund initiated successfully",
      });
    } else {
      // For unpaid orders or COD payment method
      console.log("Cancelling order without refund (unpaid or COD).");
      order.paymentStatus = "cancelled";
      order.shippingStatus = "cancelled";
      order.orderTimestamps.cancellation = new Date();

      // Step 2: Update Inventory (since no ZaloPay refund is involved)
      const productDetails = order.products;

      for (const item of productDetails) {
        const inventory = await Inventory.findOne({
          product: item.product,
        }).session(session);

        if (inventory) {
          // Increase the inventory by the quantity of the cancelled order
          inventory.quantity += item.quantity; // Refund means we restock the products

          // Update the last updated timestamp
          inventory.lastUpdated = new Date();

          await inventory.save({ session });
        } else {
          console.error(`Inventory not found for product ${item.product}`);
          throw new Error(`Inventory not found for product ${item.product}`);
        }
      }

      await order.save({ session });

      await session.commitTransaction();
      return res.status(200).json({ message: "Order cancelled successfully" });
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    await session.abortTransaction();
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  } finally {
    session.endSession();
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

// controllers/orderController.js

// controllers/orderController.js

exports.getRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      console.error("Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Order Refund Information:", order.refund);

    if (!order.refund || !order.refund.mRefundId) {
      console.log("Order has no refund information");
      return res
        .status(400)
        .json({ message: "Order has no refund information" });
    }

    // Gọi paymentService để lấy tình trạng hoàn tiền
    const refundStatusResponse = await paymentService.getRefundStatus(
      order.refund.mRefundId // Truyền đúng mRefundId
    );

    console.log("Refund Status Response:", refundStatusResponse);

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
        refundStatusText = "failed"; // Chuyển 'unknown' thành 'failed'
    }

    console.log("Refund Status Text:", refundStatusText);

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

// controllers/orderController.js

exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, orderId } = req.query;

    const query = {
      paymentStatus: { $ne: "pending" }, // Exclude orders with payment status "pending"
    };

    // Lọc theo orderId nếu có
    if (orderId) {
      // Vì orderId là ObjectId, ta sẽ thử check ObjectId hợp lệ
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        query._id = orderId;
      } else {
        // Nếu muốn tìm orderId dạng text (không phải ObjectId):
        // query._id = { $regex: orderId, $options: "i" };
        // Tuy nhiên, _id thường là ObjectId và không nên tìm bằng regex.
        // Ở đây, ta chỉ tìm chính xác. Nếu không hợp lệ, trả về rỗng.
        query._id = { $exists: false }; // Không match kết quả nào
      }
    }

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
      .populate("user", "name email")
      .populate("products.product", "name price images")
      .populate("discountCode", "code value isPercentage");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Update Order Controller
exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    // Validate the orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Handle shippingStatus update
    if (
      updateData.shippingStatus &&
      updateData.shippingStatus !== order.shippingStatus
    ) {
      // Validate shippingStatus value
      const validStatuses = ["processing", "shipping", "shipped", "cancelled"];
      if (!validStatuses.includes(updateData.shippingStatus)) {
        return res
          .status(400)
          .json({ message: "Invalid shipping status value" });
      }

      // Update shippingStatus and set corresponding timestamp
      order.shippingStatus = updateData.shippingStatus;
      if (updateData.shippingStatus === "shipping") {
        order.orderTimestamps.shipping = new Date();
      } else if (updateData.shippingStatus === "shipped") {
        order.orderTimestamps.delivery = new Date();
      } else if (updateData.shippingStatus === "cancelled") {
        order.orderTimestamps.cancellation = new Date();
      }

      // Additional logic can be added here if needed
    }

    // Handle paymentStatus update
    if (
      updateData.paymentStatus &&
      updateData.paymentStatus !== order.paymentStatus
    ) {
      // Validate paymentStatus value
      const validPaymentStatuses = ["unpaid", "paid", "pending", "cancelled"];
      if (!validPaymentStatuses.includes(updateData.paymentStatus)) {
        return res
          .status(400)
          .json({ message: "Invalid payment status value" });
      }

      // Update paymentStatus and set corresponding timestamp
      order.paymentStatus = updateData.paymentStatus;
      if (updateData.paymentStatus === "paid") {
        order.orderTimestamps.payment = new Date();
      }
    }

    // Handle refund status
    if (updateData.refund && updateData.refund.status) {
      const validRefundStatuses = ["processing", "success", "failed", "null"];
      if (!validRefundStatuses.includes(updateData.refund.status)) {
        return res.status(400).json({ message: "Invalid refund status value" });
      }

      order.refund.status = updateData.refund.status;
      if (updateData.refund.amount !== undefined) {
        order.refund.amount = updateData.refund.amount;
      }
      if (updateData.refund.refundId !== undefined) {
        order.refund.refundId = updateData.refund.refundId;
      }
      if (updateData.refund.mRefundId !== undefined) {
        order.refund.mRefundId = updateData.refund.mRefundId;
      }
    }

    // Handle other fields if necessary
    // For example, updating notes or other non-status fields
    if (updateData.note !== undefined) {
      order.note = updateData.note;
    }

    // Save the updated order
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

async function updateInventoryAfterRefund(order) {
  // Get product details from the order
  const productDetails = order.products; // Assuming 'products' chứa thông tin sản phẩm

  for (const item of productDetails) {
    // Find the product in the inventory
    const inventory = await Inventory.findOne({ product: item.product });

    if (inventory) {
      // Increase the inventory by the quantity of the cancelled order
      inventory.quantity += item.quantity; // Refund means we restock the products

      // Update the last updated timestamp
      inventory.lastUpdated = new Date();

      await inventory.save();
    } else {
      console.error(`Inventory not found for product ${item.product}`);
    }
  }
}
