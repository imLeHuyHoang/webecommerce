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
  loginUserAdmin, // Admin login function
  updateUserProfile,
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/auth");

// Define user routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getProfile);
router.get("/refreshToken", refreshToken);
router.post("/logout", logoutUser);
router.put("/update/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/google-login", googleLogin);
router.put("/profile", verifyToken, updateUserProfile);

// Admin login route
router.post("/loginadmin", loginUserAdmin);

module.exports = router;
