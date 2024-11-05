// utils/zalopayConfig.js

module.exports = {
  appid: 2554, // Chuyển thành số nguyên
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  createOrderUrl: "https://sb-openapi.zalopay.vn/v2/create",
  callbackUrl: "http://localhost:5000/api/payment/zalopay/callback",
  redirectUrl: "http://localhost:5173/product",
};
