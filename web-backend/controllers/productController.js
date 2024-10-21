const Product = require("../models/Product");
const Category = require("../models/Category");

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, perPage = 8 } = req.query;

    // Khởi tạo query trống
    let query = {};

    // Lọc theo category nếu có
    if (category) {
      const foundCategory = await Category.findOne({ name: category }).exec();
      if (!foundCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      query.category = foundCategory._id; // Gán ID của category vào query
    }

    // Tìm kiếm theo tiêu đề nếu có
    if (search) {
      query.title = { $regex: search, $options: "i" }; // Không phân biệt chữ hoa/thường
    }

    // Phân trang
    const totalProducts = await Product.countDocuments(query); // Tổng số sản phẩm
    const products = await Product.find(query)
      .populate("category", "name") // Populate để lấy tên category
      .skip((page - 1) * perPage) // Bỏ qua các sản phẩm của trang trước
      .limit(perPage); // Lấy số sản phẩm tương ứng mỗi trang

    // Trả về dữ liệu cho frontend
    res.status(200).json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / perPage),
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error); // Log lỗi chi tiết
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
