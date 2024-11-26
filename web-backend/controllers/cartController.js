// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Discount = require("../models/Discount");

// Helper function to calculate cart totals
const calculateCartTotals = async (cart) => {
  let totalQuantity = 0;
  let totalAmount = 0;

  for (let item of cart.products) {
    totalQuantity += item.quantity;

    // Recalculate totalPrice for each item
    let itemTotalPrice = item.price * item.quantity;

    if (item.discount) {
      const discount = await Discount.findById(item.discount);
      if (discount) {
        if (discount.type === "percentage") {
          itemTotalPrice = itemTotalPrice * (1 - discount.value / 100);
        } else if (discount.type === "fixed") {
          itemTotalPrice = itemTotalPrice - discount.value;
        }
      }
    }

    item.totalPrice = itemTotalPrice > 0 ? itemTotalPrice : 0;
    totalAmount += item.totalPrice;
  }

  // Apply cart discount if applicable
  if (cart.discountCode) {
    const discount = await Discount.findById(cart.discountCode);
    if (discount) {
      if (discount.type === "percentage") {
        totalAmount = totalAmount * (1 - discount.value / 100);
      } else if (discount.type === "fixed") {
        totalAmount = totalAmount - discount.value;
      }
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

    // Check if the discount code is expired
    if (discount.expirationDate && discount.expirationDate < new Date()) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn." });
    }

    cart.discountCode = discount._id;

    await calculateCartTotals(cart);

    await cart.save();
    res.status(200).json(cart);
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
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error in removeCartDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};
