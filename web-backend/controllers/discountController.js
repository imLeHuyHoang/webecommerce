// controllers/discountController.js
const Discount = require("../models/Discount");
const Product = require("../models/Product");

// Tạo mã giảm giá mới
exports.createDiscount = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      isPercentage,
      minOrderValue,
      startDate,
      expiryDate,
      isActive,
      applicableProducts,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!code || !type || !value || !expiryDate || !startDate) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    //kiểm tra xem đã có code nào trùng chưa
    const discountExist = await Discount.findOne({ code: code });
    if (discountExist) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại." });
    }

    // Kiểm tra loại product
    if (type === "product") {
      if (!applicableProducts || applicableProducts.length === 0) {
        return res
          .status(400)
          .json({ message: "Vui lòng chọn ít nhất một sản phẩm áp dụng." });
      }

      // Kiểm tra xem tất cả sản phẩm có tồn tại không
      const products = await Product.find({ _id: { $in: applicableProducts } });
      if (products.length !== applicableProducts.length) {
        return res
          .status(400)
          .json({ message: "Một hoặc nhiều sản phẩm không tồn tại." });
      }
    }

    // Kiểm tra startDate <= expiryDate
    if (new Date(startDate) > new Date(expiryDate)) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu không được lớn hơn ngày hết hạn." });
    }

    // Tạo mã giảm giá mới
    const discount = new Discount({
      code,
      type,
      value,
      isPercentage,
      minOrderValue,
      startDate,
      expiryDate,
      isActive,
      applicableProducts: type === "product" ? applicableProducts : [],
    });

    await discount.save();
    res.status(201).json(discount);
  } catch (error) {
    console.error("Error in createDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật mã giảm giá
exports.updateDiscount = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      isPercentage,
      minOrderValue,
      startDate,
      expiryDate,
      isActive,
      applicableProducts,
    } = req.body;

    if (!code || !type || !value || !expiryDate || !startDate) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    if (type === "product") {
      if (!applicableProducts || applicableProducts.length === 0) {
        return res
          .status(400)
          .json({ message: "Vui lòng chọn ít nhất một sản phẩm áp dụng." });
      }

      const products = await Product.find({ _id: { $in: applicableProducts } });
      if (products.length !== applicableProducts.length) {
        return res
          .status(400)
          .json({ message: "Một hoặc nhiều sản phẩm không tồn tại." });
      }
    }

    // Kiểm tra startDate <= expiryDate
    if (new Date(startDate) > new Date(expiryDate)) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu không được lớn hơn ngày hết hạn." });
    }

    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
    }

    discount.code = code;
    discount.type = type;
    discount.value = value;
    discount.isPercentage = isPercentage;
    discount.minOrderValue = minOrderValue;
    discount.startDate = startDate;
    discount.expiryDate = expiryDate;
    discount.isActive = isActive;
    discount.applicableProducts = type === "product" ? applicableProducts : [];

    await discount.save();
    res.status(200).json(discount);
  } catch (error) {
    console.error("Error in updateDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả mã giảm giá
exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find().populate({
      path: "applicableProducts",
      select: "name code",
    });
    res.status(200).json(discounts);
  } catch (error) {
    console.error("Error in getAllDiscounts:", error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy mã giảm giá theo ID
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id).populate({
      path: "applicableProducts",
      select: "name code",
    });
    if (!discount) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
    }
    res.status(200).json(discount);
  } catch (error) {
    console.error("Error in getDiscountById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Xóa mã giảm giá
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại." });
    }
    res.status(200).json({ message: "Xóa mã giảm giá thành công." });
  } catch (error) {
    console.error("Error in deleteDiscount:", error);
    res.status(500).json({ error: error.message });
  }
};
