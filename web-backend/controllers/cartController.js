const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Lấy giỏ hàng của người dùng đã đăng nhập
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống." });
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in getCart:", error); // Log lỗi chi tiết
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity." });
  }

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, products: [], total: 0 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingProductIndex >= 0) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    // Tính tổng tiền và kiểm tra dữ liệu hợp lệ
    cart.total = cart.products.reduce((sum, item) => {
      const productPrice = item.product.price || 0; // Kiểm tra giá trị hợp lệ
      return sum + item.quantity * productPrice;
    }, 0);

    if (isNaN(cart.total)) {
      return res.status(400).json({ message: "Invalid quantity or price." });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    const item = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (item) {
      const product = await Product.findById(productId);
      product.stock += item.quantity; // Trả lại số lượng sản phẩm
      await product.save();
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    cart.total = cart.products.reduce((sum, item) => {
      const productPrice = item.product?.price || 0; // Đảm bảo giá trị hợp lệ
      return sum + item.quantity * productPrice;
    }, 0);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in removeFromCart:", error); // Log lỗi chi tiết
    res.status(500).json({ error: error.message });
  }
};

// Giảm số lượng sản phẩm trong giỏ hàng
exports.decreaseQuantity = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );

    const itemIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex >= 0) {
      cart.products[itemIndex].quantity -= 1;

      if (cart.products[itemIndex].quantity === 0) {
        cart.products.splice(itemIndex, 1);
      }

      const product = await Product.findById(productId);
      product.stock += 1;
      await product.save();
    }

    cart.total = cart.products.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in decreaseQuantity:", error); // Log lỗi chi tiết
    res.status(500).json({ error: error.message });
  }
};

// Tăng số lượng sản phẩm trong giỏ hàng
exports.increaseQuantity = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }
    if (product.stock <= 0) {
      return res.status(400).json({ message: "Sản phẩm đã hết hàng." });
    }

    const item = cart.products.find(
      (item) => item.product._id.toString() === productId
    );

    if (item) {
      item.quantity += 1;
      product.stock -= 1;
      await product.save();
    }

    cart.total = cart.products.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in increaseQuantity:", error); // Log lỗi chi tiết
    res.status(500).json({ error: error.message });
  }
};
