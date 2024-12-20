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
    "https://0ce0-113-190-245-86.ngrok-free.app/api/payment/callback",
  redirectUrl: "http://my-app-alb-1931839826.ap-southeast-1.elb.amazonaws.com",
};
