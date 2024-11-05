const paymentService = require("../services/paymentService");
const zalopayConfig = require("../utils/zalopayConfig");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, products, paymentMethod } = req.body;

    // Kiểm tra giá của từng sản phẩm và tính tổng
    const productDetails = await Promise.all(
      products.map(async (item) => {
        const productData = await Product.findById(item.product);
        if (!productData) {
          throw new Error(`Product ${item.product} not found`);
        }
        return {
          product: item.product,
          quantity: item.quantity,
          price: productData.price,
        };
      })
    );

    const total = productDetails.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Tạo đơn hàng trong MongoDB
    const order = await Order.create({
      user: req.user.id,
      shippingAddress,
      products: productDetails,
      total,
      payment: { method: paymentMethod },
    });

    // Tích hợp với ZaloPay nếu phương thức thanh toán là ZaloPay
    if (paymentMethod === "zalopay") {
      const zaloPayOrder = await createOrderWithZaloPay(order);
      // Lưu thông tin giao dịch vào đơn hàng
      order.payment.transactionId = zaloPayOrder.order_token;
      order.payment.appTransId = zaloPayOrder.app_trans_id;
      await order.save();
      return res.status(201).json({ order, orderUrl: zaloPayOrder.order_url }); // Trả về orderUrl để redirect
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

async function createOrderWithZaloPay(order) {
  const appTransId = generateAppTransId();

  // Lấy thông tin sản phẩm để có tên sản phẩm
  const items = await Promise.all(
    order.products.map(async (item) => {
      const productData = await Product.findById(item.product);
      if (!productData) {
        throw new Error(`Product ${item.product} not found`);
      }
      return {
        itemid: item.product.toString(),
        itemname: productData.title, // Lấy tên sản phẩm từ 'title'
        itemprice: item.price,
        itemquantity: item.quantity,
      };
    })
  );

  const orderInfo = {
    amount: order.total,
    appTransId,
    items,
    embedData: {
      orderId: order._id.toString(),
    },
  };

  console.log("Order Info:", orderInfo);

  const zaloPayResponse = await paymentService.createOrder(orderInfo);

  if (zaloPayResponse.return_code === 1) {
    // Trả về thông tin đơn hàng ZaloPay
    return {
      order_url: zaloPayResponse.order_url,
      order_token: zaloPayResponse.zp_trans_token,
      app_trans_id: appTransId,
    };
  } else {
    console.error("ZaloPay Error:", zaloPayResponse);
    throw new Error(zaloPayResponse.return_message);
  }
}

// Hàm tạo appTransId
function generateAppTransId() {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const time = date.getTime().toString().slice(-6);
  return `${yy}${mm}${dd}_${time}`;
}
