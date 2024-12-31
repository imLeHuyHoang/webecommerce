// routes/inventory.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authAdmin = require("../middleware/authAdmin");

router.get("/", authAdmin, inventoryController.getAllInventories);

router.get("/:id", authAdmin, inventoryController.getInventoryById);

router.post("/", authAdmin, inventoryController.createInventory);

router.put("/:id", authAdmin, inventoryController.updateInventory);

router.delete("/:id", authAdmin, inventoryController.deleteInventory);

module.exports = router;
