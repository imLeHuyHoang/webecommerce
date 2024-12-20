const cron = require("node-cron");
const mongoose = require("mongoose");
const Order = require("../models/Order"); // Đảm bảo import đúng model Order

// Cron job để hủy các đơn hàng `pending` quá hạn
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

      expiredOrders.forEach(async (order) => {
        //xóa order khỏi db
        await Order.findByIdAndDelete(order._id);
        console.log(`Order ${order._id} cancelled.`);
      });
    } else {
      console.log("No expired orders found.");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

module.exports = cron;
