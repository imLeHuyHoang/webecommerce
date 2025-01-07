// controllers/categoryController.js
const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");

// --- Hàm phụ để xóa file trong temp ---
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

// Lấy tất cả categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy category theo ID
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

// Tạo category
exports.createCategory = async (req, res) => {
  try {
    const { name, descriptions } = req.body;

    // Kiểm tra tồn tại
    const categoryExist = await Category.findOne({ name });
    if (categoryExist) {
      await deleteUploadedFiles(req.files);
      return res.status(400).json({ message: "Category already exists" });
    }

    // Tạo model
    const category = new Category({
      name,
      descriptions,
      images: [],
    });

    // Lưu DB
    const newCategory = await category.save();

    // Tạo thư mục cho category
    const categoryDir = path.join(__dirname, "../upload/category", name);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Di chuyển file từ temp sang folder của category
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

    newCategory.images = images;
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error in createCategory:", error);
    // Xóa file nếu lỗi
    await deleteUploadedFiles(req.files);
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, descriptions } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      await deleteUploadedFiles(req.files);
      return res.status(404).json({ message: "Category not found" });
    }

    // Thư mục cũ và mới
    const oldDir = path.join(__dirname, "../upload/category", category.name);
    const newDir = path.join(
      __dirname,
      "../upload/category",
      name || category.name
    );

    // Đổi tên thư mục nếu category name thay đổi
    if (name && category.name !== name && fs.existsSync(oldDir)) {
      fs.renameSync(oldDir, newDir);
    } else if (!fs.existsSync(newDir)) {
      // Nếu newDir chưa tồn tại (trường hợp category.name như cũ, hoặc folder chưa có)
      fs.mkdirSync(newDir, { recursive: true });
    }

    // Nếu có file ảnh, di chuyển vào newDir, nếu không thì giữ nguyên
    const newImages =
      req.files && req.files.length > 0
        ? req.files.map((file) => {
            const tempPath = path.join(
              __dirname,
              "../upload/temp",
              file.filename
            );
            const targetPath = path.join(newDir, file.filename);

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

    // Update category
    category.name = name || category.name;
    category.descriptions = descriptions || category.descriptions;
    category.images = newImages;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error in updateCategory:", error);
    await deleteUploadedFiles(req.files);
    res.status(400).json({ message: error.message });
  }
};

// Xóa category
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

    // Xóa thư mục
    const categoryDir = path.join(
      __dirname,
      "../upload/category",
      category.name
    );
    if (fs.existsSync(categoryDir)) {
      fs.rmSync(categoryDir, { recursive: true, force: true });
    }

    // Xóa DB
    await Category.findByIdAndDelete(categoryId);

    res
      .status(200)
      .json({ message: `Category ${category.name} deleted successfully` });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: error.message });
  }
};
