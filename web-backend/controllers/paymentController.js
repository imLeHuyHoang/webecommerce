const CryptoJS = require("crypto-js");
const Order = require("../models/Order");
const zalopayConfig = require("../utils/zalopayConfig"); // Ensure this line is present
const Cart = require("../models/Cart");

exports.paymentCallback = async (req, res) => {
  try {
    console.log("Received callback from ZaloPay:", req.body);

    const { data: dataStr, mac: reqMac, type } = req.body;

    if (!dataStr || !reqMac || type === undefined) {
      console.error("Missing data, mac, or type in callback.");
      return res.sendStatus(400);
    }

    const mac = CryptoJS.HmacSHA256(dataStr, zalopayConfig.key2).toString();

    if (mac !== reqMac) {
      console.error("MAC mismatch.");
      return res.sendStatus(400);
    }

    const data = JSON.parse(dataStr);
    const { app_id, app_trans_id, zp_trans_id } = data;

    if (!app_id || !app_trans_id || !zp_trans_id) {
      console.error("Missing necessary information in data.");
      return res.sendStatus(400);
    }

    const order = await Order.findOne({
      "payment.appTransId": app_trans_id,
    });
    if (!order) {
      console.error(`Order with appTransId: ${app_trans_id} not found`);
      return res.sendStatus(404);
    }

    order.payment.transactionId = zp_trans_id;

    if (type === 1) {
      order.payment.isVerified = true;
      order.paymentStatus = "paid";
      order.shippingStatus = "processing";
      order.paymentDate = new Date();

      await Cart.deleteMany({ user: order.user });
    } else if (type === 2) {
      order.paymentStatus = "cancelled";
      order.cancelledDate = new Date();
    } else if (type === 3) {
      order.paymentStatus = "pending";
    } else {
      console.error(`Unknown type: ${type}`);
      return res.sendStatus(400);
    }

    await order.save();
    res.sendStatus(200);
  } catch (error) {
    console.error("Error in payment callback:", error);
    res.sendStatus(500);
  }
};
