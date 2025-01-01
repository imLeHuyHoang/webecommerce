const axios = require("axios");
const CryptoJS = require("crypto-js");
const qs = require("qs");
const moment = require("moment");
const zalopayConfig = require("../utils/zalopayConfig");

function generateAppTransId() {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const random = date.getTime().toString().slice(-6);
  return `${yy}${mm}${dd}_${random}`;
}

exports.createOrder = async (orderInfo) => {
  const order = {
    app_id: parseInt(zalopayConfig.appid, 10),
    app_trans_id: orderInfo.appTransId,
    app_user: orderInfo.appUserId,
    app_time: Date.now(),
    amount: parseInt(orderInfo.amount, 10),
    item: JSON.stringify(orderInfo.items || []),
    embed_data: JSON.stringify(orderInfo.embedData || {}),
    description: `Payment for order #${orderInfo.appTransId}`,
    bank_code: "",
    callback_url: zalopayConfig.callbackUrl,
    redirect_url: zalopayConfig.redirectUrl,
  };

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

  order.mac = CryptoJS.HmacSHA256(hmacInput, zalopayConfig.key1).toString();

  try {
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

exports.processZaloPayPayment = async (order, productDetails) => {
  const appTransId = generateAppTransId();
  const orderInfo = {
    appUserId: order.user.toString(),
    appTransId,
    amount: parseInt(order.total, 10),
    items: productDetails.map((item) => ({
      itemid: item.product.toString(),
      itemname: item.name,
      itemprice: parseInt(item.price, 10),
      itemquantity: parseInt(item.quantity, 10),
    })),
    embedData: {
      orderId: order._id.toString(),
    },
  };

  try {
    const zaloPayResponse = await this.createOrder(orderInfo);

    if (zaloPayResponse.return_code === 1) {
      // Lưu appTransId
      order.payment.appTransId = appTransId;
      await order.save();

      return { success: true, orderUrl: zaloPayResponse.order_url };
    } else {
      console.error("ZaloPay Error:", zaloPayResponse);
      return { success: false, message: zaloPayResponse.sub_return_message };
    }
  } catch (error) {
    console.error("Error processing ZaloPay payment:", error);
    return { success: false, message: error.message };
  }
};

exports.refundZaloPayOrder = async (order) => {
  try {
    console.log("Using zptransid for refund:", order.payment.transactionId);

    // Gọi hàm refundOrder
    const { refundResult, mRefundId } = await this.refundOrder(
      order.payment.transactionId,
      parseInt(order.total, 10),
      "Order Cancellation Refund"
    );

    // Update refund fields:
    order.refund = {
      refundId: refundResult.refundid,
      mRefundId: mRefundId,
      status: "processing",
      amount: parseInt(order.total, 10),
    };
    await order.save();

    return {
      success: true,
      refundId: refundResult.refundid,
      mRefundId: mRefundId,
      amount: parseInt(order.total, 10),
      message: "Refund initiated",
    };
  } catch (error) {
    console.error("Error refunding ZaloPay order:", error);
    return { success: false, message: error.message };
  }
};

exports.refundOrder = async (
  zpTransId,
  amount,
  description = "Customer Refund"
) => {
  const timestamp = Date.now();
  const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`;
  const mRefundId = `${moment().format("YYMMDD")}_${
    zalopayConfig.appid
  }_${uid}`;

  const data = {
    appid: parseInt(zalopayConfig.appid, 10),
    mrefundid: mRefundId,
    zptransid: String(zpTransId),
    amount: parseInt(amount, 10),
    timestamp: parseInt(timestamp, 10),
    description: description,
  };

  const dataString = `${data.appid}|${data.zptransid}|${data.amount}|${data.description}|${data.timestamp}`;
  data.mac = CryptoJS.HmacSHA256(dataString, zalopayConfig.key1).toString();

  console.log("Refund Request Data:", data);

  try {
    const response = await axios.post(
      zalopayConfig.refundUrl,
      qs.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("ZaloPay Refund Response:", response.data);

    return { refundResult: response.data, mRefundId };
  } catch (error) {
    console.error(
      "Error refunding ZaloPay order:",
      error.response ? error.response.data : error.message
    );
    throw new Error(
      error.response ? error.response.data.returnmessage : error.message
    );
  }
};

exports.getRefundStatus = async (mRefundId) => {
  const timestamp = Date.now();

  const params = {
    appid: parseInt(zalopayConfig.appid, 10),
    mrefundid: mRefundId,
    timestamp: timestamp,
  };

  const dataString = `${params.appid}|${params.mrefundid}|${params.timestamp}`;
  params.mac = CryptoJS.HmacSHA256(dataString, zalopayConfig.key1).toString();

  console.log("Get Refund Status Request Params:", params);

  try {
    const response = await axios.get(zalopayConfig.getRefundStatusUrl, {
      params,
    });
    console.log("ZaloPay Get Refund Status Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting refund status:", error);
    throw new Error(
      error.response ? error.response.data.returnmessage : error.message
    );
  }
};
