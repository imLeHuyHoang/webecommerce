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
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    res.json(user);
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

    // Generate tokens
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWTSECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWTREFRESHSECRET,
      { expiresIn: "60d" }
    );

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Đổi thành true nếu dùng HTTPS
      sameSite: "Lax",
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 ngày
    });

    // Send access token to client
    res.json({ accessToken });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Login Failed123!" });
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Now this should work

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found." });
  }

  try {
    // Verify and invalidate refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWTREFRESHSECRET);
    const user = await User.findById(decoded._id);

    if (user && user.refreshToken === refreshToken) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "Lax",
    });

    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Logout failed." });
  }
});

router.post("/refresh_token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Refresh token not found, please login again." });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWTREFRESHSECRET);

    // Find the user
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ message: "Invalid refresh token, please login again." });
    }

    // Generate new access token
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWTSECRET, {
      expiresIn: "15m",
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res
      .status(403)
      .json({ message: "Invalid refresh token, please login again." });
  }
});

module.exports = router;
