// routes/userRoutes.js

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
  googleLogin,
  loginUserAdmin,
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/loginadmin", loginUserAdmin);

// Protected routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateUser);
router.get("/refreshToken", refreshToken);
router.post("/logout", logoutUser);

// Admin routes
router.get("/users", verifyToken, authAdmin, getAllUsers);
router.post("/admin", verifyToken, authAdmin, createUserByAdmin);
router.put("/:id", verifyToken, authAdmin, updateUserByAdmin);
router.delete("/:id", verifyToken, authAdmin, deleteUser);

module.exports = router;
