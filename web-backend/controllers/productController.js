const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Attribute = require("../models/Attribute");
const Inventory = require("../models/Inventory");
const Category = require("../models/Category");
const mongoose = require("mongoose");

/**
 * @route   GET /api/products
 * @desc    Lấy tất cả sản phẩm (có thể lọc theo category, brand, search)
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, brand, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).populate("category", "name");

    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.findOne({ product: product._id });
        return {
          ...product.toObject(),
          stock: inventory ? inventory.quantity : 0,
        };
      })
    );

    res.json(productsWithInventory);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Lấy sản phẩm theo ID
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      console.log("Product not found for ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }
    const inventory = await Inventory.findOne({ product: product._id });
    const productWithInventory = {
      ...product.toObject(),
      stock: inventory ? inventory.quantity : 0,
    };
    res.json(productWithInventory);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới
 * @access  Private (Admin Only)
 */
exports.createProduct = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    const { code, name, description, brand, price, category, attributes } =
      req.body;

    if (!code || !name || !brand || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const productExist = await Product.findOne({ code });
    if (productExist) {
      return res.status(400).json({ message: "Product code already exists" });
    }

    const nameExist = await Product.findOne({ name });
    if (nameExist) {
      return res.status(400).json({ message: "Product name already exists" });
    }

    const parsedAttributes = attributes ? JSON.parse(attributes) : [];

    const product = new Product({
      code,
      name,
      description,
      brand,
      price,
      category,
      attributes: parsedAttributes,
      images: [],
    });

    const newProduct = await product.save();

    const productFolder = path.join(__dirname, "../upload/products", name);
    if (!fs.existsSync(productFolder)) {
      fs.mkdirSync(productFolder, { recursive: true });
    }

    const images = req.files
      ? req.files.map((file) => {
          const tempPath = path.join(
            __dirname,
            "../upload/temp",
            file.filename
          );
          const filePath = path.join(productFolder, file.filename);
          if (fs.existsSync(tempPath)) {
            fs.renameSync(tempPath, filePath);
          } else {
            throw new Error(`File not found: ${tempPath}`);
          }
          return path.relative(
            path.join(__dirname, "../upload/products"),
            filePath
          );
        })
      : [];

    newProduct.images = images;
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm
 * @access  Private (Admin Only)
 */
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { code, name, description, brand, price, category, attributes } =
      req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const oldFolder = path.join(__dirname, "../upload/products", product.name);
    const newFolder = path.join(__dirname, "../upload/products", name);

    if (name && product.name !== name && fs.existsSync(oldFolder)) {
      fs.renameSync(oldFolder, newFolder);
    }

    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => {
            const filePath = path.join(newFolder, file.filename);
            fs.renameSync(file.path, filePath);
            return path.relative(
              path.join(__dirname, "../upload/products"),
              filePath
            );
          })
        : product.images;

    const parsedAttributes = attributes
      ? JSON.parse(attributes)
      : product.attributes;

    product.code = code || product.code;
    product.name = name || product.name;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.price = price || product.price;
    product.category = category || product.category;
    product.attributes = parsedAttributes;
    product.images = images;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm
 * @access  Private (Admin Only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const productFolder = path.join(
      __dirname,
      "../upload/products",
      product.name
    );
    if (fs.existsSync(productFolder)) {
      fs.rmSync(productFolder, { recursive: true, force: true });
    }

    await Product.findByIdAndDelete(productId);
    res
      .status(200)
      .json({ message: `Product ${product.name} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/products/compare
 * @desc    So sánh hai sản phẩm
 * @access  Public
 */
exports.compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length !== 2) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đúng hai ID sản phẩm" });
    }

    productIds.forEach((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid product ID: ${id}`);
      }
    });

    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "category",
      "name"
    );
    if (products.length !== 2) {
      return res
        .status(404)
        .json({ message: "Một hoặc cả hai sản phẩm không tồn tại" });
    }

    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.findOne({ product: product._id });
        return {
          ...product.toObject(),
          stock: inventory ? inventory.quantity : 0,
        };
      })
    );

    res.json(productsWithInventory);
  } catch (error) {
    console.error("Error comparing products:", error);
    res.status(500).json({ message: error.message });
  }
};
