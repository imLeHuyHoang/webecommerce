// services/paymentService.js

const axios = require("axios");
const CryptoJS = require("crypto-js");
const qs = require("qs");
const zalopayConfig = require("../utils/zalopayConfig");

exports.createOrder = async (orderInfo) => {
  const order = {
    app_id: zalopayConfig.appid,
    app_trans_id: orderInfo.appTransId,
    app_user: "ZaloPayDemo",
    app_time: Date.now(),
    amount: orderInfo.amount,
    item: JSON.stringify(orderInfo.items || []),
    embed_data: JSON.stringify(orderInfo.embedData || {}),
    description: `Thanh toán cho đơn hàng #${orderInfo.appTransId}`,
    bank_code: "",
    callback_url: zalopayConfig.callbackUrl,
    redirect_url: zalopayConfig.redirectUrl, // Thêm dòng này
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

  try {
    // Gửi yêu cầu tạo đơn hàng đến ZaloPay
    const response = await axios.post(
      zalopayConfig.createOrderUrl,
      qs.stringify(order),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

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
