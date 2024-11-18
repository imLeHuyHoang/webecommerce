// controllers/productController.js
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Attribute = require("../models/Attribute");

// Lấy tất cả sản phẩm
/**
 * @route   GET /api/products
 * @desc    Lấy tất cả sản phẩm
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
/**
 * @route   GET /api/products/:id
 * @desc    Lấy sản phẩm theo ID
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo sản phẩm mới
/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới
 * @access  Private (Admin Only)
 */
exports.createProduct = async (req, res) => {
  try {
    // Kiểm tra dữ liệu nhận được từ frontend
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // Lấy dữ liệu từ req.body
    const { code, name, description, brand, price, category, attributes } =
      req.body;

    // Kiểm tra các trường bắt buộc
    if (!code || !name || !brand || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra xem sản phẩm đã tồn tại hay chưa
    const productExist = await Product.findOne({ code });
    if (productExist) {
      return res.status(400).json({ message: "Product code already exists" });
    }

    // Lấy danh sách ảnh từ request
    const images = req.files ? req.files.map((file) => file.filename) : [];

    // Chuyển đổi attributes từ JSON string sang object
    const parsedAttributes = attributes ? JSON.parse(attributes) : [];

    // Kiểm tra trường nhập value cho key có đúng định dạng của key hay không
    const attributeKeys = await Attribute.find().distinct("key");
    const attributeKeysFromRequest = parsedAttributes.map((attr) => attr.key);
    const isValidAttributeKeys = attributeKeysFromRequest.every((key) =>
      attributeKeys.includes(key)
    );
    if (!isValidAttributeKeys) {
      return res.status(400).json({ message: "Invalid attribute keys" });
    }

    // Xác thực giá trị của từng attribute
    for (const attr of parsedAttributes) {
      const attribute = await Attribute.findOne({ key: attr.key });
      if (attribute) {
        switch (attribute.type) {
          case "String":
            if (typeof attr.value !== "string") {
              return res.status(400).json({
                message: `Invalid value type for attribute ${attr.key}. Expected String.`,
              });
            }
            break;
          case "Number":
            if (isNaN(attr.value)) {
              return res.status(400).json({
                message: `Invalid value type for attribute ${attr.key}. Expected Number.`,
              });
            }
            break;
          case "Boolean":
            if (typeof attr.value !== "boolean") {
              return res.status(400).json({
                message: `Invalid value type for attribute ${attr.key}. Expected Boolean.`,
              });
            }
            break;
          default:
            return res
              .status(400)
              .json({ message: `Unknown attribute type for ${attr.key}.` });
        }
      }
    }

    // Tạo đối tượng product mới
    const product = new Product({
      code,
      name,
      description,
      brand,
      price,
      category,
      attributes: parsedAttributes,
      images,
    });
    console.log("product:", product);

    // Lưu product mới vào cơ sở dữ liệu
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm
 * @access  Private (Admin Only)
 */

// Cập nhật sản phẩm
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
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Lấy danh sách ảnh từ request hoặc giữ nguyên ảnh cũ nếu không có ảnh mới
    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.filename)
        : product.images;

    // Chuyển đổi attributes từ JSON string sang object
    const parsedAttributes = attributes
      ? JSON.parse(attributes)
      : product.attributes;

    // Kiểm tra trường nhập value cho key có đúng định dạng của key hay không
    const attributeKeys = await Attribute.find().distinct("key");
    const attributeKeysFromRequest = parsedAttributes.map((attr) => attr.key);
    const isValidAttributeKeys = attributeKeysFromRequest.every((key) =>
      attributeKeys.includes(key)
    );
    if (!isValidAttributeKeys) {
      return res.status(400).json({ message: "Invalid attribute keys" });
    }

    // Xác thực giá trị của từng attribute
    for (const attr of parsedAttributes) {
      const attribute = await Attribute.findOne({ key: attr.key });
      if (attribute) {
        switch (attribute.type) {
          case "String":
            if (typeof attr.value !== "string") {
              return res
                .status(400)
                .json({
                  message: `Invalid value type for attribute ${attr.key}. Expected String.`,
                });
            }
            break;
          case "Number":
            if (isNaN(attr.value)) {
              return res
                .status(400)
                .json({
                  message: `Invalid value type for attribute ${attr.key}. Expected Number.`,
                });
            }
            break;
          case "Boolean":
            if (typeof attr.value !== "boolean") {
              return res
                .status(400)
                .json({
                  message: `Invalid value type for attribute ${attr.key}. Expected Boolean.`,
                });
            }
            break;
          default:
            return res
              .status(400)
              .json({ message: `Unknown attribute type for ${attr.key}.` });
        }
      }
    }

    // Cập nhật thông tin sản phẩm
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

// Xóa sản phẩm
/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm
 * @access  Private (Admin Only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    } else {
      // Xóa các tệp ảnh liên quan
      const imagePath = path.join(__dirname, "../upload/products");
      product.images.forEach((image) => {
        const filePath = path.join(imagePath, image);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}:`, err);
          }
        });
      });

      // Xóa product
      await Product.findByIdAndDelete(productId);
      res
        .status(200)
        .json({ message: `Product ${product.name} deleted successfully` });
    }
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: error.message });
  }
};
