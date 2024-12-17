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
    "https://3b92-2001-ee0-41c1-1855-6c10-303c-c81a-1434.ngrok-free.app/api/payment/callback",
  redirectUrl:
    "http://my-app-alb-1931839826.ap-southeast-1.elb.amazonaws.com/home",
};
