// controllers/paymentController.js

const CryptoJS = require("crypto-js");
const Order = require("../models/Order");
const Product = require("../models/Product");
const zalopayConfig = require("../utils/zalopayConfig");
const paymentService = require("../services/paymentService");

/**
 * Tạo đơn hàng mới
 * @param {Object} req - Yêu cầu HTTP
 * @param {Object} res - Phản hồi HTTP
 */
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod } = req.body;

    if (!shippingAddress || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Thông tin đơn hàng không hợp lệ." });
    }

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
      paymentStatus: "pending",
      shippingStatus: "processing",
    });

    if (paymentMethod === "zalopay") {
      const appTransId = generateAppTransId();
      order.paymentStatus = "pending";
      order.paymentDate = new Date();

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

      const zaloPayResponse = await paymentService.createOrder(orderInfo);

      if (zaloPayResponse.return_code === 1) {
        order.payment.transactionId = zaloPayResponse.zp_trans_token;
        order.payment.appTransId = appTransId;
        await order.save();

        return res.status(201).json({ orderUrl: zaloPayResponse.order_url });
      } else {
        console.error("ZaloPay Error:", zaloPayResponse);
        return res
          .status(400)
          .json({ message: zaloPayResponse.sub_return_message });
      }
    }

    order.paymentStatus = "unpaid";
    order.shippingStatus = "processing";
    await order.save();
    res.status(201).json({ message: "Đơn hàng đã được tạo thành công." });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
  }
};

/**
 * Xử lý callback thanh toán từ ZaloPay
 * @param {Object} req - Yêu cầu HTTP
 * @param {Object} res - Phản hồi HTTP
 */
exports.paymentCallback = async (req, res) => {
  try {
    console.log("Received callback from ZaloPay:", req.body);

    const { data: dataStr, mac: reqMac, type } = req.body;

    if (!dataStr || !reqMac || type === undefined) {
      console.error("Thiếu data, mac hoặc type trong callback.");
      return res.sendStatus(400);
    }

    const mac = CryptoJS.HmacSHA256(dataStr, zalopayConfig.key2).toString();

    if (mac !== reqMac) {
      console.error("MAC không khớp.");
      return res.sendStatus(400);
    }

    const data = JSON.parse(dataStr);
    const { app_id, app_trans_id } = data;

    if (!app_id || !app_trans_id) {
      console.error("Thiếu thông tin cần thiết trong data.");
      return res.sendStatus(400);
    }

    const order = await Order.findOne({
      "payment.appTransId": app_trans_id,
    });
    if (!order) {
      console.error(`Không tìm thấy đơn hàng với appTransId: ${app_trans_id}`);
      return res.sendStatus(404);
    }

    if (type === 1) {
      order.payment.isVerified = true;
      order.paymentStatus = "paid";
      order.shippingStatus = "processing";
      order.paymentDate = new Date();
    } else if (type === 2) {
      order.paymentStatus = "cancelled";
      order.cancelledDate = new Date();
    } else if (type === 3) {
      order.paymentStatus = "pending";
    } else {
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

/**
 * Hàm tạo appTransId
 * @returns {string} - appTransId
 */
function generateAppTransId() {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const random = date.getTime().toString().slice(-6);
  return `${yy}${mm}${dd}_${random}`;
}
