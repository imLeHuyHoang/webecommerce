const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  logoutUser,
  updateUser, // Sử dụng updateUser thay vì updateUserProfile
  deleteUser,
  googleLogin,
  loginUserAdmin,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/auth");

// Định nghĩa các route
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getProfile);
router.get("/refreshToken", refreshToken);
router.post("/logout", logoutUser);
router.put("/profile", verifyToken, updateUser);
router.delete("/:id", deleteUser);
router.post("/google-login", googleLogin);

// Route cho admin login
router.post("/loginadmin", loginUserAdmin);

module.exports = router;
