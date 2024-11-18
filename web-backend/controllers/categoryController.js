// controllers/categoryController.js
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");

// Lấy tất cả categories
/**
 * @route   GET /api/categories
 * @desc    Lấy tất cả categories
 * @access  Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy category theo ID
/**
 * @route   GET /api/categories/:id
 * @desc    Lấy category theo ID
 * @access  Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo category mới
/**
 * @route   POST /api/categories
 * @desc    Tạo category mới
 * @access  Private (Admin Only)
 */
exports.createCategory = async (req, res) => {
  try {
    // Kiểm tra xem category đã tồn tại hay chưa
    const categoryExist = await Category.findOne({ name: req.body.name });
    if (categoryExist) {
      // Xóa các file đã được upload
      await deleteUploadedFiles(req.files);
      return res.status(400).json({ message: "Category already exists" });
    }

    // Lấy danh sách ảnh từ request
    const images = req.files ? req.files.map((file) => file.filename) : [];

    // Tạo đối tượng category mới
    const category = new Category({
      name: req.body.name,
      images: images,
      descriptions: req.body.descriptions,
    });

    // Lưu category mới vào cơ sở dữ liệu
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error in createCategory:", error);

    // Xóa các file đã được upload nếu có lỗi xảy ra
    await deleteUploadedFiles(req.files);

    res.status(400).json({ message: error.message });
  }
};

// Cập nhật category
/**
 * @route   PUT /api/categories/:id
 * @desc    Cập nhật category
 * @access  Private (Admin Only)
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Lấy danh sách ảnh từ request hoặc giữ nguyên ảnh cũ nếu không có ảnh mới
    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.filename)
        : category.images;

    // Cập nhật thông tin category
    category.name = req.body.name || category.name;
    category.images = images;
    category.descriptions = req.body.descriptions || category.descriptions;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa category
/**
 * @route   DELETE /api/categories/:id
 * @desc    Xóa category
 * @access  Private (Admin Only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    } else {
      // Xóa category
      await Category.findByIdAndDelete(categoryId);
      res
        .status(200)
        .json({ message: `Category ${category.name} deleted successfully` });
    }
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: error.message });
  }
};

// Hàm để xóa các tệp đã upload
const deleteUploadedFiles = async (files) => {
  if (files && files.length > 0) {
    const deletePromises = files.map((file) => {
      const filePath = path.join(
        __dirname,
        "../upload/category",
        file.filename
      );
      return fs.promises.unlink(filePath).catch((err) => {
        console.error(`Error deleting file ${filePath}:`, err);
      });
    });
    await Promise.all(deletePromises);
  }
};
