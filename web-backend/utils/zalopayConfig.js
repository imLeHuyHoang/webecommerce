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
    "http://tech-store-alb-1327880098.ap-southeast-1.elb.amazonaws.com/api/payment/callback",
  redirectUrl:
    "http://tech-store-alb-1327880098.ap-southeast-1.elb.amazonaws.com",
};
