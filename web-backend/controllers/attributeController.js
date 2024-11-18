const Attribute = require("../models/Attribute");
const mongoose = require("mongoose");

// Lấy tất cả attributes
/**
 * @route   GET /api/attributes
 * @desc    Lấy tất cả attributes
 * @access  Public
 */
exports.getAllAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find().populate("categoryId", "name");
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy attributes theo categoryId
/**
 * @route   GET /api/attributes/category/:categoryId
 * @desc    Lấy attributes theo categoryId
 * @access  Public
 */
exports.getAttributesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Kiểm tra ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const attributes = await Attribute.find({ categoryId }).populate(
      "categoryId",
      "name"
    );
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy attribute theo ID
/**
 * @route   GET /api/attributes/:id
 * @desc    Lấy attribute theo ID
 * @access  Public
 */
exports.getAttributeById = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id).populate(
      "categoryId",
      "name"
    );
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }
    res.json(attribute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo attribute mới
/**
 * @route   POST /api/attributes
 * @desc    Tạo attribute mới
 * @access  Private (Admin Only)
 */
exports.createAttribute = async (req, res) => {
  try {
    const { categoryId, key, type } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!categoryId || !key || !type) {
      return res
        .status(400)
        .json({ message: "Category ID, key, and type are required" });
    }

    // Kiểm tra categoryId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Kiểm tra đã trùng key chưa
    const checkKey = await Attribute.findOne({
      key: key,
      categoryId: categoryId,
    });

    if (checkKey) {
      return res.status(400).json({ message: "Key already exists" });
    }

    const attribute = new Attribute({
      categoryId,
      key,
      type,
    });

    const newAttribute = await attribute.save();
    res.status(201).json(newAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật attribute
/**
 * @route   PUT /api/attributes/:id
 * @desc    Cập nhật attribute
 * @access  Private (Admin Only)
 */
exports.updateAttribute = async (req, res) => {
  try {
    const { key, type } = req.body;
    const attributeId = req.params.id;

    // Kiểm tra các trường bắt buộc
    if (!key || !type) {
      return res.status(400).json({ message: "Key and type are required" });
    }

    // Kiểm tra key đã tồn tại chưa
    const checkKey = await Attribute.findOne({
      key: key,
      _id: { $ne: attributeId },
    });

    if (checkKey) {
      return res.status(400).json({ message: "Key already exists" });
    }

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    attribute.key = key;
    attribute.type = type;

    const updatedAttribute = await attribute.save();
    res.json(updatedAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa attribute
/**
 * @route   DELETE /api/attributes/:id
 * @desc    Xóa attribute
 * @access  Private (Admin Only)
 */
exports.deleteAttribute = async (req, res) => {
  try {
    const attributeId = req.params.id;

    // Kiểm tra ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(attributeId)) {
      return res.status(400).json({ message: "Invalid attribute ID" });
    }

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    await attribute.deleteOne();
    res.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
