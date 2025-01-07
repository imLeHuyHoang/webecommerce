const cron = require("node-cron");
const mongoose = require("mongoose");
const Order = require("../models/Order"); // Đảm bảo import đúng model Order

// Cron job 1: Hủy các đơn hàng `pending` quá hạn (chạy mỗi 5 phút)
cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    // Lấy tất cả đơn hàng có trạng thái "pending" và hết hạn
    const expiredOrders = await Order.find({
      paymentStatus: "pending",
      paymentExpiry: { $lt: now },
    });

    if (expiredOrders.length > 0) {
      console.log(
        `Found ${expiredOrders.length} expired orders. Cancelling...`
      );

      // Xoá order khỏi DB
      for (const order of expiredOrders) {
        await Order.findByIdAndDelete(order._id);
        console.log(`Order ${order._id} cancelled (pending expired).`);
      }
    } else {
      console.log("No expired orders found.");
    }
  } catch (error) {
    console.error("Error in cron job (pending cancellation):", error);
  }
});

// Cron job 2: Tự động chuyển đơn hàng từ "shipping" sang "shipped" sau 7 ngày

cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    // Tính thời điểm 7 ngày trước
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Tìm các đơn hàng đang ở "shipping" và đã shipping >= 7 ngày
    const ordersToAutoShip = await Order.find({
      shippingStatus: "shipping",
      "orderTimestamps.shipping": { $lte: sevenDaysAgo },
    });

    if (ordersToAutoShip.length > 0) {
      console.log(
        `Found ${ordersToAutoShip.length} orders in "shipping" for >=7 days. Auto-updating...`
      );

      for (const order of ordersToAutoShip) {
        order.shippingStatus = "shipped";
        order.orderTimestamps.delivery = new Date();
        await order.save();
        console.log(`Order ${order._id} auto-updated to "shipped".`);
      }
    } else {
      console.log("No orders to auto-update to shipped.");
    }
  } catch (error) {
    console.error("Error in cron job (auto shipping->shipped):", error);
  }
});

module.exports = cron;
