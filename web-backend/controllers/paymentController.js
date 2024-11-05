const axios = require("axios");
const CryptoJS = require("crypto-js");
const Order = require("../models/Order");
const Product = require("../models/Product");
const zalopayConfig = require("../utils/zalopayConfig");
const paymentService = require("../services/paymentService");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod } = req.body;

    // Kiểm tra đầu vào
    if (!shippingAddress || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Thông tin đơn hàng không hợp lệ." });
    }

    // Lấy thông tin sản phẩm và tính tổng tiền
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

    // Tạo đơn hàng trong database
    const order = await Order.create({
      user: req.user.id,
      shippingAddress,
      products: productDetails.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      total: totalAmount,
      payment: { method: paymentMethod },
      status: "pending",
    });

    // Tích hợp với ZaloPay nếu chọn phương thức thanh toán là ZaloPay
    if (paymentMethod === "zalopay") {
      const appTransId = generateAppTransId();

      // Chuẩn bị dữ liệu gửi tới ZaloPay
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

      // Gọi dịch vụ tạo đơn hàng với ZaloPay
      const zaloPayResponse = await paymentService.createOrder(orderInfo);

      if (zaloPayResponse.return_code === 1) {
        // Cập nhật thông tin thanh toán vào đơn hàng
        order.payment.transactionId = zaloPayResponse.zp_trans_token;
        order.payment.appTransId = appTransId;
        await order.save();

        // Trả về URL để redirect người dùng tới trang thanh toán của ZaloPay
        return res.status(201).json({ orderUrl: zaloPayResponse.order_url });
      } else {
        console.error("ZaloPay Error:", zaloPayResponse);
        return res
          .status(400)
          .json({ message: zaloPayResponse.sub_return_message });
      }
    }

    // Xử lý cho phương thức thanh toán khác (COD)
    res.status(201).json({ message: "Đơn hàng đã được tạo thành công." });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
  }
};

exports.paymentCallback = async (req, res) => {
  try {
    // Lấy dữ liệu từ ZaloPay
    const data = req.body;

    // Tạo chuỗi data để kiểm tra MAC
    const macData =
      data.app_id +
      "|" +
      data.app_trans_id +
      "|" +
      data.app_time +
      "|" +
      data.app_user +
      "|" +
      data.amount +
      "|" +
      data.embed_data +
      "|" +
      data.item +
      "|" +
      data.zp_trans_id +
      "|" +
      data.server_time +
      "|" +
      data.channel +
      "|" +
      data.status;

    // Tính MAC
    const mac = CryptoJS.HmacSHA256(macData, zalopayConfig.key2).toString();

    // So sánh MAC
    if (mac !== data.mac) {
      console.error("MAC không khớp.");
      return res
        .status(200)
        .json({ return_code: -1, return_message: "MAC không hợp lệ." });
    }

    // Lấy orderId từ embed_data
    const embedData = JSON.parse(data.embed_data);
    const orderId = embedData.orderId;

    // Tìm đơn hàng trong database
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Không tìm thấy đơn hàng với ID: ${orderId}`);
      return res
        .status(200)
        .json({ return_code: -1, return_message: "Đơn hàng không tồn tại." });
    }

    // Cập nhật trạng thái đơn hàng dựa trên kết quả thanh toán
    if (data.status === 1) {
      // Thanh toán thành công
      order.payment.status = "paid";
      order.status = "processing";
      await order.save();
    } else {
      // Thanh toán thất bại
      order.payment.status = "failed";
      order.status = "failed";
      await order.save();
    }

    // Trả về phản hồi cho ZaloPay
    res
      .status(200)
      .json({ return_code: 1, return_message: "Thanh toán thành công." });
  } catch (error) {
    console.error("Error in payment callback:", error);
    res.status(500).json({ return_code: 2, return_message: "Lỗi server." });
  }
};

// Hàm tạo appTransId
function generateAppTransId() {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const random = date.getTime().toString().slice(-6);
  return `${yy}${mm}${dd}_${random}`;
}
