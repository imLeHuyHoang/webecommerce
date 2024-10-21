const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  logoutUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController"); // Kiểm tra import hàm

const { verifyToken } = require("../middleware/auth");

// Định nghĩa các route
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getProfile);
router.get("/refreshToken", refreshToken); // Route để refresh token
router.post("/logout", logoutUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
