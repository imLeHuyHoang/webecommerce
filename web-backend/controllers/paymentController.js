const CryptoJS = require("crypto-js");
const Order = require("../models/Order");
const zalopayConfig = require("../utils/zalopayConfig"); // Ensure this line is present
const Cart = require("../models/Cart");
const Inventory = require("../models/Inventory");

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

    // Tìm đơn hàng trong cơ sở dữ liệu dựa trên app_trans_id
    const order = await Order.findOne({
      "payment.appTransId": app_trans_id,
    });
    if (!order) {
      console.error(`Order with appTransId: ${app_trans_id} not found`);
      return res.sendStatus(404);
    }

    // Lưu mã giao dịch Zalopay vào đơn hàng
    order.payment.transactionId = zp_trans_id;

    // Nếu đơn hàng thanh toán thành công (type === 1)
    if (type === 1) {
      order.payment.isVerified = true;
      order.paymentStatus = "paid";
      order.shippingStatus = "processing";
      order.paymentDate = new Date();

      // Cập nhật số lượng tồn kho
      for (const productItem of order.products) {
        const productId = productItem.product; // Lấy productId từ đơn hàng
        const quantitySold = productItem.quantity; // Lấy số lượng bán được

        // Cập nhật kho
        const inventory = await Inventory.findOne({ product: productId });

        if (inventory) {
          // Kiểm tra xem kho có đủ số lượng không
          if (inventory.quantity < quantitySold) {
            console.error(`Not enough stock for product ${productId}`);
            return res
              .status(400)
              .send("Not enough stock for one or more products.");
          }

          // Trừ số lượng sản phẩm trong kho
          inventory.quantity -= quantitySold;
          inventory.lastUpdated = new Date(); // Cập nhật thời gian
          await inventory.save();
        } else {
          console.error(`Inventory not found for product ${productId}`);
          return res.status(404).send("Product inventory not found.");
        }
      }

      // Xóa giỏ hàng sau khi thanh toán thành công
      await Cart.deleteMany({ user: order.user });
    }
    // Nếu thanh toán bị huỷ (type === 2)
    else if (type === 2) {
      order.paymentStatus = "cancelled";
      order.cancelledDate = new Date();
    }
    // Nếu thanh toán đang chờ (type === 3)
    else if (type === 3) {
      order.paymentStatus = "pending";
    } else {
      console.error(`Unknown type: ${type}`);
      return res.sendStatus(400);
    }

    // Lưu thông tin đơn hàng đã cập nhật
    await order.save();
    res.sendStatus(200);
  } catch (error) {
    console.error("Error in payment callback:", error);
    res.sendStatus(500);
  }
};
