// controllers/paymentController.js

const axios = require("axios");
const CryptoJS = require("crypto-js");
const Order = require("../models/Order");
const Product = require("../models/Product");
const zalopayConfig = require("../utils/zalopayConfig");
const paymentService = require("../services/paymentService");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod } = req.body;

    // Validate input
    if (!shippingAddress || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Thông tin đơn hàng không hợp lệ." });
    }

    // Fetch product information and calculate total amount
    const productDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${item.product}`);
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

    // Create order in database
    const order = await Order.create({
      user: req.user.id,
      shippingAddress,
      products: productDetails.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      total: totalAmount,
      payment: { method: paymentMethod, isVerified: false },
      paymentStatus: "pending", // Set initial payment status
      shippingStatus: "processing", // Set initial shipping status
    });

    // Integrate with ZaloPay if selected payment method is ZaloPay
    if (paymentMethod === "zalopay") {
      const appTransId = generateAppTransId();

      // Prepare data to send to ZaloPay
      const orderInfo = {
        appTransId,
        amount: totalAmount,
        items: productDetails.map((item) => ({
          itemid: item.product.toString(),
          itemname: item.title,
          itemprice: item.price,
          itemquantity: item.quantity,
        })),
        embedData: {
          orderId: order._id.toString(),
        },
      };

      console.log("Order Info:", orderInfo);

      // Call ZaloPay service to create order
      const zaloPayResponse = await paymentService.createOrder(orderInfo);
      console.log("ZaloPay Response:", zaloPayResponse);

      if (zaloPayResponse.return_code === 1) {
        // Update order with ZaloPay transaction info
        order.payment.transactionId = zaloPayResponse.zp_trans_token;
        order.payment.appTransId = appTransId;
        await order.save();

        // Return URL to redirect user to ZaloPay payment page
        return res.status(201).json({ orderUrl: zaloPayResponse.order_url });
      } else {
        console.error("ZaloPay Error:", zaloPayResponse);
        return res
          .status(400)
          .json({ message: zaloPayResponse.sub_return_message });
      }
    }

    // Handle other payment methods (e.g., COD)
    res.status(201).json({ message: "Đơn hàng đã được tạo thành công." });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
  }
};

exports.paymentCallback = async (req, res) => {
  try {
    console.log("Received callback from ZaloPay:", req.body);

    const { data: dataStr, mac: reqMac, type } = req.body;

    // Check if data, mac, or type is missing
    if (!dataStr || !reqMac || type === undefined) {
      console.error("Thiếu data, mac hoặc type trong callback.");
      return res.sendStatus(400);
    }

    // Calculate MAC to validate
    const mac = CryptoJS.HmacSHA256(dataStr, zalopayConfig.key2).toString();

    // Compare MACs
    if (mac !== reqMac) {
      console.error("MAC không khớp.");
      return res.sendStatus(400);
    }

    // Parse data from JSON string
    const data = JSON.parse(dataStr);

    // Extract required fields from data
    const { app_id, app_trans_id } = data;

    // Check if required fields are missing
    if (!app_id || !app_trans_id) {
      console.error("Thiếu thông tin cần thiết trong data.");
      return res.sendStatus(400);
    }

    // Find order in database by app_trans_id
    const order = await Order.findOne({
      "payment.appTransId": app_trans_id,
    });
    if (!order) {
      console.error(`Không tìm thấy đơn hàng với appTransId: ${app_trans_id}`);
      return res.sendStatus(404);
    }

    // Update order based on type
    if (type === 1) {
      // Payment successful
      order.payment.isVerified = true;
      order.paymentStatus = "paid";
      order.shippingStatus = "processing";
    } else if (type === 2) {
      // Transaction cancelled
      order.paymentStatus = "cancelled";
    } else if (type === 3) {
      // Payment failed
      order.paymentStatus = "failed";
    } else {
      // Undefined type
      console.error(`Loại type không xác định: ${type}`);
      return res.sendStatus(400);
    }

    await order.save();

    res.sendStatus(200);
  } catch (error) {
    console.error("Error in payment callback:", error);
    res.sendStatus(500);
  }
};

// Function to generate appTransId
function generateAppTransId() {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const random = date.getTime().toString().slice(-6);
  return `${yy}${mm}${dd}_${random}`;
}
