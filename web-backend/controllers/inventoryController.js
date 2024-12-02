const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

/**
 * @desc    Lấy tất cả tồn kho
 * @route   GET /api/inventory
 * @access  Private (Admin Only)
 */
exports.getAllInventories = async (req, res) => {
  try {
    // Lấy tất cả tồn kho và populate thông tin sản phẩm
    const inventories = await Inventory.find().populate(
      "product",
      "name code category price"
    );
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách tồn kho.",
      error: error.message,
    });
  }
};

/**
 * @desc    Lấy tồn kho theo ID
 * @route   GET /api/inventory/:id
 * @access  Private (Admin Only)
 */
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate(
      "product",
      "name code category price"
    );

    if (!inventory) {
      return res.status(404).json({ message: "Tồn kho không tồn tại." });
    }

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin tồn kho.",
      error: error.message,
    });
  }
};

/**
 * @desc    Tạo tồn kho mới
 * @route   POST /api/inventory
 * @access  Private (Admin Only)
 */
exports.createInventory = async (req, res) => {
  try {
    const { product, location, quantity } = req.body;

    if (!product || !location || !quantity) {
      return res.status(400).json({
        message:
          "Vui lòng nhập đầy đủ thông tin: sản phẩm, địa điểm, và số lượng.",
      });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const productExist = await Product.findById(product);
    if (!productExist) {
      return res.status(400).json({ message: "Sản phẩm không tồn tại." });
    }
    // Kiểm tra sản phẩm đã từng được tạo tồn kho chưa
    const inventoryExist = await Inventory.findOne({ product });
    if (inventoryExist) {
      return res.status(400).json({
        message: "Tồn kho cho sản phẩm này tại địa điểm này đã tồn tại.",
      });
    }
    const inventory = new Inventory({
      product,
      location,
      quantity,
    });

    const newInventory = await inventory.save();
    res.status(201).json(newInventory);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo tồn kho.",
      error: error.message,
    });
  }
};

/**
 * @desc    Cập nhật tồn kho
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin Only)
 */
exports.updateInventory = async (req, res) => {
  try {
    const { product, location, quantity } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Tồn kho không tồn tại." });
    }

    if (product) {
      const productExist = await Product.findById(product);
      if (!productExist) {
        return res.status(400).json({ message: "Sản phẩm không tồn tại." });
      }
      inventory.product = product;
    }

    inventory.location = location || inventory.location;
    inventory.quantity = quantity || inventory.quantity;
    inventory.lastUpdated = Date.now();

    const updatedInventory = await inventory.save();
    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật tồn kho.",
      error: error.message,
    });
  }
};

/**
 * @desc    Xóa tồn kho
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin Only)
 */

exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Tồn kho không tồn tại." });
    }

    res.status(200).json({ message: "Xóa tồn kho thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa tồn kho:", error);
    res.status(500).json({
      message: "Lỗi khi xóa tồn kho.",
      error: error.message,
    });
  }
};
