// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Discount = require("../models/Discount");
const Inventory = require("../models/Inventory");

/**
 * Hàm tính tổng số tiền & số lượng sản phẩm trong giỏ,
 * đồng thời áp dụng các mã giảm giá (nếu có).
 */
const calculateCartTotals = async (cart) => {
  let totalQuantity = 0;
  let totalAmount = 0;

  // Duyệt từng sản phẩm trong giỏ
  for (let item of cart.products) {
    totalQuantity += item.quantity;

    // Lấy giá mới nhất của sản phẩm
    const product = await Product.findById(item.product);
    if (product) {
      item.price = product.price;
    }

    // Tính tiền tạm cho sản phẩm
    let itemTotalPrice = item.price * item.quantity;

    // Nếu có discount gán cho sản phẩm, kiểm tra hợp lệ
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
        // Nếu mã giảm giá của sản phẩm đã hết hạn => xóa
        item.discount = null;
      }
    }

    item.totalPrice = itemTotalPrice > 0 ? itemTotalPrice : 0;
    totalAmount += item.totalPrice;
  }

  // Kiểm tra discount cho toàn giỏ (nếu có)
  if (cart.discountCode) {
    const discount = await Discount.findById(cart.discountCode);
    if (discount && discount.isActive && discount.expiryDate >= new Date()) {
      // Kiểm tra minOrderValue
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
        // Không đủ điều kiện => bỏ discount
        cart.discountCode = null;
      }
    } else {
      // Hết hạn hoặc không còn hiệu lực
      cart.discountCode = null;
    }
  }

  // Gán lại giá trị tổng
  cart.totalQuantity = totalQuantity;
  cart.totalAmount = totalAmount > 0 ? totalAmount : 0;
};

/**
 * Lấy giỏ hàng của người dùng
 */
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("products.product")
      .populate("products.discount")
      .populate("discountCode");

    if (!cart) {
      return res
        .status(404)
        .json({ message: "Giỏ hàng của bạn hiện đang trống." });
    }

    // Tính lại tổng trước khi trả về
    await calculateCartTotals(cart);
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    return res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng." });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  // Kiểm tra đầu vào
  if (!productId || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "Sản phẩm hoặc số lượng không hợp lệ." });
  }

  try {
    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      // Nếu chưa có thì tạo mới
      cart = new Cart({
        user: req.user.id,
        products: [],
        totalQuantity: 0,
        totalAmount: 0,
      });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    const price = product.price;

    // Kiểm tra xem đã có sản phẩm này trong giỏ chưa
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingProductIndex >= 0) {
      // Có rồi => tăng số lượng
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Chưa có => push vào
      cart.products.push({
        product: productId,
        quantity,
        price,
        totalPrice: price * quantity,
      });
    }

    // Tính lại và lưu
    await calculateCartTotals(cart);
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi thêm sản phẩm vào giỏ hàng." });
  }
};

/**
 * Xóa 1 sản phẩm khỏi giỏ hàng
 */
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    // Lọc bỏ sản phẩm
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    await calculateCartTotals(cart);
    await cart.save();

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xóa sản phẩm khỏi giỏ hàng." });
  }
};

/**
 * Giảm số lượng sản phẩm
 */
exports.decreaseQuantity = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex >= 0) {
      cart.products[itemIndex].quantity -= 1;

      // Nếu số lượng <= 0 => xóa khỏi giỏ
      if (cart.products[itemIndex].quantity <= 0) {
        cart.products.splice(itemIndex, 1);
      }

      await calculateCartTotals(cart);
      await cart.save();

      return res.status(200).json(cart);
    } else {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng." });
    }
  } catch (error) {
    console.error("Lỗi khi giảm số lượng sản phẩm:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi giảm số lượng sản phẩm." });
  }
};

/**
 * Tăng số lượng sản phẩm
 */
exports.increaseQuantity = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex >= 0) {
      cart.products[itemIndex].quantity += 1;

      await calculateCartTotals(cart);
      await cart.save();

      return res.status(200).json(cart);
    } else {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng." });
    }
  } catch (error) {
    console.error("Lỗi khi tăng số lượng sản phẩm:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi tăng số lượng sản phẩm." });
  }
};

/**
 * Xóa toàn bộ giỏ hàng
 */
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
    return res
      .status(200)
      .json({ message: "Đã xóa toàn bộ sản phẩm trong giỏ hàng." });
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xóa toàn bộ giỏ hàng." });
  }
};

/**
 * Áp dụng mã giảm giá cho giỏ hàng
 */
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

    // Kiểm tra hạn sử dụng
    if (!discount.isActive || discount.expiryDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." });
    }

    // Kiểm tra loại discount
    if (discount.type !== "cart") {
      return res
        .status(400)
        .json({ message: "Mã giảm giá này không áp dụng cho giỏ hàng." });
    }

    // Gán tạm
    cart.discountCode = discount._id;

    // Tính lại
    await calculateCartTotals(cart);

    // Nếu sau tính bị xóa => không đủ điều kiện
    if (!cart.discountCode) {
      return res.status(400).json({
        message:
          "Giỏ hàng chưa đủ điều kiện áp dụng mã giảm giá hoặc mã đã hết hạn.",
      });
    }

    await cart.save();

    // Lấy cart đã populate
    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "products.product",
        select: "name price images",
      })
      .populate("products.discount")
      .populate("discountCode");

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Lỗi khi áp dụng mã giảm giá cho giỏ hàng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi áp dụng mã giảm giá cho giỏ hàng." });
  }
};

/**
 * Bỏ mã giảm giá ra khỏi giỏ hàng
 */
exports.removeCartDiscount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    // Bỏ mã
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

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Lỗi khi xóa mã giảm giá khỏi giỏ hàng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xóa mã giảm giá khỏi giỏ hàng." });
  }
};

/**
 * Bỏ mã giảm giá ra khỏi một sản phẩm
 */
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

      const updatedCart = await Cart.findOne({ user: req.user.id })
        .populate({
          path: "products.product",
          select: "name price images",
        })
        .populate("products.discount")
        .populate("discountCode");

      return res.status(200).json(updatedCart);
    } else {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng." });
    }
  } catch (error) {
    console.error("Lỗi khi xóa mã giảm giá khỏi sản phẩm:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xóa mã giảm giá khỏi sản phẩm." });
  }
};

/**
 * Áp dụng mã giảm giá cho một sản phẩm trong giỏ
 */
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

    if (!discount.isActive || discount.expiryDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." });
    }

    if (discount.type !== "product") {
      return res
        .status(400)
        .json({ message: "Mã giảm giá này không áp dụng cho sản phẩm." });
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex < 0) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng." });
    }

    // Kiểm tra sản phẩm có thuộc danh sách áp dụng discount hay không
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

    if (!cart.products[itemIndex].discount) {
      return res.status(400).json({
        message:
          "Mã giảm giá không hợp lệ hoặc sản phẩm không đủ điều kiện áp mã.",
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "products.product",
        select: "name price images",
      })
      .populate("products.discount")
      .populate("discountCode");

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Lỗi khi áp dụng mã giảm giá cho sản phẩm:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi áp dụng mã giảm giá cho sản phẩm." });
  }
};

/**
 * Kiểm tra tồn kho
 */
exports.checkStock = async (req, res) => {
  try {
    const { products } = req.body;
    // Mảng productId và quantity
    const outOfStockItems = [];
    const nameOfOutOfStockItems = [];

    // Kiểm tra từng sản phẩm
    for (let item of products) {
      const inventory = await Inventory.findOne({ product: item.productId });
      if (!inventory || inventory.quantity < item.quantity) {
        outOfStockItems.push(item.productId);
        const product = await Product.findById(item.productId).select("name");
        if (product) {
          nameOfOutOfStockItems.push(product.name);
        }
      }
    }

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        message: "Một số sản phẩm đã hết hàng.",
        outOfStockItems,
        nameOfOutOfStockItems,
      });
    }

    return res
      .status(200)
      .json({ message: "Tất cả sản phẩm đều còn trong kho." });
  } catch (error) {
    console.error("Lỗi khi kiểm tra tồn kho:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi kiểm tra tồn kho." });
  }
};
