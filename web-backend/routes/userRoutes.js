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
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/auth");
const authAdminMiddleware = require("../middleware/authAdmin");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/loginadmin", loginUserAdmin);

// Forgot password flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyResetCode);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateUser);
router.get("/refreshToken", refreshToken);
router.post("/logout", logoutUser);

router.get("/users", authAdminMiddleware, getAllUsers);
router.post("/admin", authAdminMiddleware, createUserByAdmin);
router.put("/:id", authAdminMiddleware, updateUserByAdmin);
router.delete("/:id", authAdminMiddleware, deleteUser);

module.exports = router;
