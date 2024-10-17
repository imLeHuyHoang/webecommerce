const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const _ = require("lodash");
require("dotenv").config(); // Import dotenv để sử dụng biến môi trường
const authMiddleware = require("../middleware/auth");

const User = require("../models/users");
const auth = require("../middleware/auth");
const JWTSECRET = process.env.JWTSECRET;
// LoggedIN user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get toàn bộ user
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Setting up multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/profiles");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + "-" + Date.now() + ext;
    cb(null, filename);
    req.filename = filename; // save filename in request object
  },
});
const upload = multer({ storage });

router.post("/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    gender,
    roles,
    isActive,
    addresses,
    lastLogin,
  } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      gender,
      roles,
      isActive,
      addresses,
      lastLogin,
    });

    await newUser.save();

    res.status(201).json({ message: "Sign Up Successful!" });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ message: "Sign Up Failed!" });
  }
});

// User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Create a JWT token
    const token = jwt.sign({ _id: user._id }, JWTSECRET, { expiresIn: "60d" });

    // Send the token in response
    res.json({ token });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Login Failed!" });
  }
});

router.get("/api/user/dashboard", authMiddleware, (req, res) => {
  // User-specific dashboard logic
  res.json({ message: "Welcome to your dashboard!", user: req.user });
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Không tìm thấy refresh token." });
  }

  try {
    // Xác thực Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Tìm người dùng và xóa Refresh Token trong cơ sở dữ liệu
    const user = await User.findById(decoded.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Xóa cookie Refresh Token
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // Đặt thành true nếu sử dụng HTTPS
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Đăng xuất thành công." });
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
    res.status(500).json({ message: "Đăng xuất thất bại." });
  }
});

module.exports = router;
