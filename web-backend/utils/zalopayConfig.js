// utils/zalopayConfig.js

module.exports = {
  appid: 2554,
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  createOrderUrl: "https://sb-openapi.zalopay.vn/v2/create",
  refundUrl: "https://sandbox.zalopay.com.vn/v001/tpe/partialrefund",
  getRefundStatusUrl:
    "https://sandbox.zalopay.com.vn/v001/tpe/getpartialrefundstatus",
  callbackUrl:
    "https://8aea-2001-ee0-41c1-992d-5db4-1cbe-1f1f-6ab6.ngrok-free.app/api/payment/callback",
  redirectUrl:
    "https://8aea-2001-ee0-41c1-992d-5db4-1cbe-1f1f-6ab6.ngrok-free.app/api/payment-result",
};
