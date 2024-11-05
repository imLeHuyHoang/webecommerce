// services/paymentService.js

const axios = require("axios");
const CryptoJS = require("crypto-js");
const qs = require("qs"); // Thêm thư viện này để sử dụng qs.stringify
const zalopayConfig = require("../utils/zalopayConfig");

exports.createOrder = async (orderInfo) => {
  const order = {
    app_id: zalopayConfig.appid,
    app_trans_id: orderInfo.appTransId,
    app_user: "ZaloPayDemo", // Sử dụng 'ZaloPayDemo' cho môi trường Sandbox
    app_time: Date.now(),
    amount: orderInfo.amount,
    item: JSON.stringify(orderInfo.items || []),
    embed_data: JSON.stringify(orderInfo.embedData || {}),
    description: `ZaloPayDemo - Thanh toán cho đơn hàng #${orderInfo.appTransId}`,
    bank_code: "", // Theo tài liệu, cần truyền 'zalopayapp' cho bank_code
    callback_url: zalopayConfig.callbackUrl,
    mac: "", // Sẽ tính sau
  };

  // Tạo chuỗi hmac_input để tính MAC
  const hmacInput =
    order.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;

  // Tính MAC
  order.mac = CryptoJS.HmacSHA256(hmacInput, zalopayConfig.key1).toString();

  // In ra dữ liệu để kiểm tra
  console.log("Order data sent to ZaloPay:", order);
  console.log("HMAC Input:", hmacInput);
  console.log("Calculated MAC:", order.mac);

  try {
    // Gửi yêu cầu tạo đơn hàng đến ZaloPay
    const response = await axios.post(
      zalopayConfig.createOrderUrl,
      qs.stringify(order), // Sử dụng qs.stringify để chuyển đổi dữ liệu
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("ZaloPay response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Error creating ZaloPay order:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      error.response ? error.response.data.return_message : error.message
    );
  }
};
