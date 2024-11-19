const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authAdmin = require("../middleware/authAdmin");
// Lấy tất cả tồn kho
router.get("/", authAdmin, inventoryController.getAllInventories);

// Lấy tồn kho theo ID
router.get("/:id", authAdmin, inventoryController.getInventoryById);

// Tạo tồn kho mới
router.post("/", authAdmin, inventoryController.createInventory);

// Cập nhật tồn kho
router.put("/:id", authAdmin, inventoryController.updateInventory);

// Xóa tồn kho
router.delete("/:id", authAdmin, inventoryController.deleteInventory);

module.exports = router;
