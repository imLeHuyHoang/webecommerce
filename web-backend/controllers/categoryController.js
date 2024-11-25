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
    const { name, descriptions } = req.body;

    // Kiểm tra xem category đã tồn tại hay chưa
    const categoryExist = await Category.findOne({ name });
    if (categoryExist) {
      await deleteUploadedFiles(req.files); // Xóa ảnh đã upload nếu danh mục đã tồn tại
      return res.status(400).json({ message: "Category already exists" });
    }

    // Tạo đối tượng category mới
    const category = new Category({
      name,
      descriptions,
      images: [], // Khởi tạo mảng ảnh rỗng
    });

    // Lưu category vào cơ sở dữ liệu
    const newCategory = await category.save();

    // Tạo thư mục riêng cho danh mục sau khi danh mục đã được tạo thành công
    const categoryDir = path.join(__dirname, "../upload/category", name);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Di chuyển ảnh từ thư mục tạm thời sang thư mục riêng
    const images = req.files
      ? req.files.map((file) => {
          const tempPath = path.join(
            __dirname,
            "../upload/temp",
            file.filename
          );
          const targetPath = path.join(categoryDir, file.filename);
          if (fs.existsSync(tempPath)) {
            fs.renameSync(tempPath, targetPath);
          } else {
            throw new Error(`File not found: ${tempPath}`);
          }
          return path.relative(
            path.join(__dirname, "../upload/category"),
            targetPath
          );
        })
      : [];

    // Cập nhật category với danh sách ảnh
    newCategory.images = images;
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error in createCategory:", error);

    // Xóa ảnh đã upload nếu có lỗi xảy ra
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
    const { name, descriptions } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      await deleteUploadedFiles(req.files);
      return res.status(404).json({ message: "Category not found" });
    }

    const oldDir = path.join(__dirname, "../upload/category", category.name);
    const newDir = path.join(
      __dirname,
      "../upload/category",
      name || category.name
    );

    // Đổi tên thư mục nếu tên danh mục thay đổi
    if (name && category.name !== name && fs.existsSync(oldDir)) {
      fs.renameSync(oldDir, newDir);
    }

    // Di chuyển ảnh mới vào thư mục danh mục
    const newImages = req.files
      ? req.files.map((file) => {
          const tempPath = path.join(
            __dirname,
            "../upload/temp",
            file.filename
          );
          const targetPath = path.join(newDir, file.filename);

          // Kiểm tra xem file có tồn tại ở temp không
          if (fs.existsSync(tempPath)) {
            fs.renameSync(tempPath, targetPath);
            return path.relative(
              path.join(__dirname, "../upload/category"),
              targetPath
            );
          } else {
            console.error(`File not found: ${tempPath}`);
            throw new Error(`File not found: ${file.filename}`);
          }
        })
      : category.images;

    // Cập nhật thông tin danh mục
    category.name = name || category.name;
    category.descriptions = descriptions || category.descriptions;
    category.images = newImages;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error in updateCategory:", error);

    // Xóa ảnh đã upload nếu có lỗi xảy ra
    await deleteUploadedFiles(req.files);

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
    }

    // Xóa thư mục chứa ảnh của danh mục
    const categoryDir = path.join(
      __dirname,
      "../upload/category",
      category.name
    );
    if (fs.existsSync(categoryDir)) {
      fs.rmSync(categoryDir, { recursive: true, force: true });
    }

    // Xóa danh mục khỏi cơ sở dữ liệu
    await Category.findByIdAndDelete(categoryId);
    res
      .status(200)
      .json({ message: `Category ${category.name} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: error.message });
  }
};

// Hàm để xóa các tệp đã upload
const deleteUploadedFiles = async (files) => {
  if (files && files.length > 0) {
    const deletePromises = files.map((file) => {
      const filePath = path.join(__dirname, "../upload/temp", file.filename);
      return fs.promises.unlink(filePath).catch((err) => {
        console.error(`Error deleting file ${filePath}:`, err);
      });
    });
    await Promise.all(deletePromises);
  }
};
