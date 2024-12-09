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
    "https://8c23-2001-ee0-41c1-992d-e469-6629-d674-e9c3.ngrok-free.app/api/payment/callback",
  redirectUrl:
    "https://8c23-2001-ee0-41c1-992d-e469-6629-d674-e9c3.ngrok-free.app/api/payment-result",
};
