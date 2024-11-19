const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

/**
 * @desc    Lấy tất cả tồn kho
 * @route   GET /api/inventories
 * @access  Private (Admin Only)
 */
exports.getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find().populate("product", "name code");
    res.json(inventories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Lấy tồn kho theo ID
 * @route   GET /api/inventories/:id
 * @access  Private (Admin Only)
 */
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate(
      "product",
      "name code"
    );
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Tạo tồn kho mới
 * @route   POST /api/inventories
 * @access  Private (Admin Only)
 */
exports.createInventory = async (req, res) => {
  try {
    const { product, location, quantity } = req.body;

    const productExist = await Product.findById(product);
    if (!productExist) {
      return res.status(400).json({ message: "Product not found" });
    }

    const inventory = new Inventory({
      product,
      location,
      quantity,
    });

    const newInventory = await inventory.save();
    res.status(201).json(newInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Cập nhật tồn kho
 * @route   PUT /api/inventories/:id
 * @access  Private (Admin Only)
 */
exports.updateInventory = async (req, res) => {
  try {
    const { product, location, quantity } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (product) {
      const productExist = await Product.findById(product);
      if (!productExist) {
        return res.status(400).json({ message: "Product not found" });
      }
      inventory.product = product;
    }

    inventory.location = location || inventory.location;
    inventory.quantity = quantity || inventory.quantity;
    inventory.lastUpdated = Date.now();

    const updatedInventory = await inventory.save();
    res.json(updatedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Xóa tồn kho
 * @route   DELETE /api/inventories/:id
 * @access  Private (Admin Only)
 */
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    await inventory.remove();
    res.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
