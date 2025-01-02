const CryptoJS = require("crypto-js");
const Order = require("../models/Order");
const zalopayConfig = require("../utils/zalopayConfig");
const Cart = require("../models/Cart");
const Inventory = require("../models/Inventory");

exports.paymentCallback = async (req, res) => {
  try {
    console.log("Received callback from ZaloPay:", req.body);

    const { data: dataStr, mac: reqMac, type } = req.body;

    // Kiểm tra dữ liệu, mac và type có tồn tại không
    if (!dataStr || !reqMac || type === undefined) {
      console.error("Thiếu dữ liệu, mac hoặc type trong callback.");
      return res.sendStatus(400);
    }

    // Tạo mã MAC từ dữ liệu nhận được và khóa
    const mac = CryptoJS.HmacSHA256(dataStr, zalopayConfig.key2).toString();

    // Kiểm tra xem mã MAC có khớp với mã MAC nhận được không
    if (mac !== reqMac) {
      console.error("MAC không khớp.");
      return res.sendStatus(400);
    }

    // Phân tích file JSON
    const data = JSON.parse(dataStr);
    console.log("Dữ liệu đã phân tích từ Callback:", data);

    const { app_id, app_trans_id, zp_trans_id } = data;

    // Kiểm tra xem các thông tin cần thiết có tồn tại không
    if (!app_id || !app_trans_id || !zp_trans_id) {
      console.error("Thiếu thông tin cần thiết trong dữ liệu.");
      return res.sendStatus(400);
    }

    // Tìm đơn hàng trong cơ sở dữ liệu dựa trên app_trans_id
    const order = await Order.findOne({
      "payment.appTransId": app_trans_id,
    });
    if (!order) {
      console.error(`Không tìm thấy đơn hàng với appTransId: ${app_trans_id}`);
      return res.sendStatus(404);
    }

    // Chuyển đổi zp_trans_id thành chuỗi
    const zpTransIdStr = String(zp_trans_id);

    // Lưu mã giao dịch Zalopay vào đơn hàng dưới dạng chuỗi
    order.payment.transactionId = zpTransIdStr;

    console.log(
      `Đã tìm thấy đơn hàng: ${order._id}, transactionId: ${order.payment.transactionId}`
    );

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

        // Tìm kho hàng dựa trên productId
        const inventory = await Inventory.findOne({ product: productId });

        if (inventory) {
          // Kiểm tra xem kho có đủ số lượng không
          if (inventory.quantity < quantitySold) {
            console.error(`Không đủ hàng tồn kho cho sản phẩm ${productId}`);
            return res
              .status(400)
              .send("Không đủ hàng tồn kho cho một hoặc nhiều sản phẩm.");
          }

          // Trừ số lượng sản phẩm trong kho
          inventory.quantity -= quantitySold;
          inventory.lastUpdated = new Date(); // Cập nhật thời gian
          await inventory.save();
        } else {
          console.error(`Không tìm thấy kho hàng cho sản phẩm ${productId}`);
          return res.status(404).send("Không tìm thấy kho hàng cho sản phẩm.");
        }
      }
      // Xóa giỏ hàng của người dùng sau khi thanh toán thành công
      await Cart.deleteMany({ user: order.user });
    }
    // Nếu thanh toán bị huỷ (type === 2)
    else if (type === 2) {
      order.paymentStatus = "cancelled";
      order.cancelledDate = new Date();
    }

    // Lưu thông tin đơn hàng đã cập nhật
    await order.save();
    res.sendStatus(200);
  } catch (error) {
    console.error("Lỗi trong callback thanh toán:", error);
    res.sendStatus(500);
  }
};
