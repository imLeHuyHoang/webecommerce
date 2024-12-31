// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Discount = require("../models/Discount");
const Inventory = require("../models/Inventory");

// Helper function to calculate cart totals
const calculateCartTotals = async (cart) => {
  let totalQuantity = 0;
  let totalAmount = 0;

  for (let item of cart.products) {
    totalQuantity += item.quantity;

    // Get the latest price from the product
    const product = await Product.findById(item.product);
    if (product) {
      item.price = product.price;
    }

    let itemTotalPrice = item.price * item.quantity;

    // Apply product discount if applicable
    if (item.discount) {
      const discount = await Discount.findById(item.discount);
      if (discount && discount.isActive && discount.expiryDate >= new Date()) {
        let discountAmount = 0;
        if (discount.isPercentage) {
          discountAmount = (itemTotalPrice * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
        if (discount.maxDiscountValue) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountValue);
        }
        itemTotalPrice -= discountAmount;
      } else {
        // Remove invalid discount
        item.discount = null;
      }
    }

    item.totalPrice = itemTotalPrice > 0 ? itemTotalPrice : 0;
    totalAmount += item.totalPrice;
  }

  // Apply cart discount if applicable
  if (cart.discountCode) {
    const discount = await Discount.findById(cart.discountCode);
    if (discount && discount.isActive && discount.expiryDate >= new Date()) {
      if (totalAmount >= discount.minOrderValue) {
        let discountAmount = 0;
        if (discount.isPercentage) {
          discountAmount = (totalAmount * discount.value) / 100;
        } else {
          discountAmount = discount.value;
        }
        if (discount.maxDiscountValue) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountValue);
        }
        totalAmount -= discountAmount;
      } else {
        // Không đủ điều kiện áp dụng mã giảm giá
        cart.discountCode = null;
      }
    } else {
      // Mã giảm giá không hợp lệ hoặc đã hết hạn
      cart.discountCode = null;
    }
  }

  cart.totalQuantity = totalQuantity;
  cart.totalAmount = totalAmount > 0 ? totalAmount : 0;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("products.product")
      .populate("products.discount")
      .populate("discountCode");

    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống." });

    await calculateCartTotals(cart);

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity, discountCode } = req.body;

  if (!productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity." });
  }

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        products: [],
        totalQuantity: 0,
        totalAmount: 0,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const price = product.price;

    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingProductIndex >= 0) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({
        product: productId,
        quantity,
        price,
        totalPrice: price * quantity,
      });
    }

    await calculateCartTotals(cart);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    await calculateCartTotals(cart);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ error: error.message });
  }
};

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

      if (cart.products[itemIndex].quantity <= 0) {
        cart.products.splice(itemIndex, 1);
      }

      await calculateCartTotals(cart);

      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart." });
    }
  } catch (error) {
    console.error("Error in decreaseQuantity:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.increaseQuantity = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );

    const itemIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex >= 0) {
      cart.products[itemIndex].quantity += 1;

      await calculateCartTotals(cart);

      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart." });
    }
  } catch (error) {
    console.error("Error in increaseQuantity:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    cart.products = [];
    cart.totalQuantity = 0;
    cart.totalAmount = 0;
    cart.discountCode = null;

    await cart.save();
    res.status(200).json({ message: "Giỏ hàng đã được xóa." });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({ error: error.message });
  }
};

// Apply discount code to the entire cart
exports.applyCartDiscount = async (req, res) => {
  const { discountCode } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const discount = await Discount.findOne({ code: discountCode });
    if (!discount) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
    }

    // Check if the discount code is expired or inactive
    if (!discount.isActive || discount.expiryDate < new Date()) {
      return res.status(400).json({ message: "Mã giảm giá không hợp lệ." });
    }

    // Check if discount type is 'cart'
    if (discount.type !== "cart") {
      return res
        .status(400)
        .json({ message: "Mã giảm giá này không áp dụng cho giỏ hàng." });
    }

    cart.discountCode = discount._id;

    await calculateCartTotals(cart);
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "products.product",
        select: "name price images",
      })
      .populate("products.discount")
      .populate("discountCode");

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error in applyCartDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};

// Remove discount code from the cart
exports.removeCartDiscount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    cart.discountCode = null;

    await calculateCartTotals(cart);

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "products.product",
        select: "name price images",
      })
      .populate("products.discount")
      .populate("discountCode");

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error in removeCartDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};

// Remove discount from a product in the cart
exports.removeProductDiscount = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex >= 0) {
      cart.products[itemIndex].discount = null;

      await calculateCartTotals(cart);

      await cart.save();

      // Lấy lại cart với thông tin đầy đủ
      const updatedCart = await Cart.findOne({ user: req.user.id })
        .populate({
          path: "products.product",
          select: "name price images",
        })
        .populate("products.discount")
        .populate("discountCode");

      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng." });
    }
  } catch (error) {
    console.error("Error in removeProductDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};
// Apply discount to a product in the cart
exports.applyProductDiscount = async (req, res) => {
  const { productId, discountCode } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const discount = await Discount.findOne({ code: discountCode });
    if (!discount) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
    }

    // Check if the discount code is expired or inactive
    if (!discount.isActive || discount.expiryDate < new Date()) {
      return res.status(400).json({ message: "Mã giảm giá không hợp lệ." });
    }

    // Check if discount type is 'product'
    if (discount.type !== "product") {
      return res
        .status(400)
        .json({ message: "Mã giảm giá này không áp dụng cho sản phẩm." });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex >= 0) {
      // kiểm tra xem mã giảm giá này có áp dụng cho sản phẩm không
      if (
        discount.applicableProducts.length > 0 &&
        !discount.applicableProducts
          .map((id) => id.toString())
          .includes(productId)
      ) {
        return res
          .status(400)
          .json({ message: "Mã giảm giá này không áp dụng cho sản phẩm này." });
      }

      cart.products[itemIndex].discount = discount._id;

      await calculateCartTotals(cart);

      await cart.save();
      const updatedCart = await Cart.findOne({ user: req.user.id })
        .populate({
          path: "products.product",
          select: "name price images",
        })
        .populate("products.discount")
        .populate("discountCode");

      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng." });
    }
  } catch (error) {
    console.error("Error in applyProductDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.checkStock = async (req, res) => {
  try {
    const { products } = req.body;
    console.log(products);

    const outOfStockItems = [];
    const nameOfOutOfStockItems = [];

    for (let item of products) {
      const inventory = await Inventory.findOne({ product: item.productId });
      if (!inventory || inventory.quantity < item.quantity) {
        outOfStockItems.push(item.productId);
        const product = await Product.findById(item.productId).select("name");
        nameOfOutOfStockItems.push(product.name);
      }
    }

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: "Một số sản phẩm hết hàng.",
        outOfStockItems,
        nameOfOutOfStockItems,
      });
    }

    res.status(200).json({ message: "Tất cả sản phẩm có sẵn trong kho." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi kiểm tra tồn kho." });
  }
};
