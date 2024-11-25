const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const Attribute = require("../models/Attribute");
const Inventory = require("../models/Inventory");
const Category = require("../models/Category");

// Lấy tất cả sản phẩm
/**
 * @route   GET /api/products
 * @desc    Lấy tất cả sản phẩm
 * @access  Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};

    if (category) {
      const categoryObj = await Category.findOne({ name: category });
      if (categoryObj) {
        query.category = categoryObj._id;
      } else {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const products = await Product.find(query).populate("category", "name");

    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.findOne({ product: product._id });
        return {
          ...product.toObject(),
          stock: inventory ? inventory.quantity : 0,
        };
      })
    );
    console.log("Products with inventory:", productsWithInventory);
    res.json(productsWithInventory);
  } catch (error) {
    console.error("Error fetching products:", error);
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
    console.log("Received request for product ID:", req.params.id);

    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      console.log("Product not found for ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product found:", product);

    const inventory = await Inventory.findOne({ product: product._id });
    console.log("Inventory found:", inventory);

    const productWithInventory = {
      ...product.toObject(),
      stock: inventory ? inventory.quantity : 0,
    };

    console.log("Product with inventory:", productWithInventory);
    res.json(productWithInventory);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
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
    const { code, name, description, brand, price, category, attributes } =
      req.body;

    // Kiểm tra các trường bắt buộc
    if (!code || !name || !brand || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra xem mã sản phẩm đã tồn tại chưa
    const productExist = await Product.findOne({ code });
    if (productExist) {
      return res.status(400).json({ message: "Product code already exists" });
    }

    // Kiểm tra xem tên sản phẩm đã tồn tại chưa
    const nameExist = await Product.findOne({ name });
    if (nameExist) {
      return res.status(400).json({ message: "Product name already exists" });
    }

    // Parse attributes nếu có
    const parsedAttributes = attributes ? JSON.parse(attributes) : [];

    // Tạo đối tượng sản phẩm mới
    const product = new Product({
      code,
      name,
      description,
      brand,
      price,
      category,
      attributes: parsedAttributes,
      images: [], // Khởi tạo mảng ảnh rỗng
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const newProduct = await product.save();

    // Tạo thư mục riêng cho sản phẩm sau khi sản phẩm đã được tạo thành công
    const productFolder = path.join(__dirname, "../upload/products", name);
    if (!fs.existsSync(productFolder)) {
      fs.mkdirSync(productFolder, { recursive: true });
    }

    // Lấy danh sách ảnh từ thư mục tạm thời và di chuyển vào thư mục sản phẩm
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

    // Cập nhật sản phẩm với danh sách ảnh
    newProduct.images = images;
    await newProduct.save();

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
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { code, name, description, brand, price, category, attributes } =
      req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldFolder = path.join(__dirname, "../upload/products", product.name);
    const newFolder = path.join(__dirname, "../upload/products", name);

    // Nếu tên sản phẩm thay đổi, đổi tên thư mục
    if (product.name !== name && fs.existsSync(oldFolder)) {
      fs.renameSync(oldFolder, newFolder);
    }

    // Lấy danh sách ảnh từ request hoặc giữ nguyên ảnh cũ
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
    }

    // Xóa thư mục chứa ảnh sản phẩm
    const productFolder = path.join(
      __dirname,
      "../upload/products",
      product.name
    );
    if (fs.existsSync(productFolder)) {
      fs.rmSync(productFolder, { recursive: true, force: true });
    }

    // Xóa sản phẩm khỏi cơ sở dữ liệu
    await Product.findByIdAndDelete(productId);
    res
      .status(200)
      .json({ message: `Product ${product.name} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: error.message });
  }
};
