const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// Tạo JWT token
const generateTokens = (user) => {
  const tokenPayload = {
    id: user._id,
    email: user.email,
    roles: user.roles,
    version: user.tokenVersion, // Thêm kiểm soát phiên bản
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESHSECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Cấu hình cookie
const getCookieConfig = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
});

// Đăng ký người dùng mới
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, gender } = req.body;

  try {
    // Kiểm tra đầu vào
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      tokenVersion: 0,
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

// Đăng nhập và tạo JWT token
// controllers/userController.js

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // Kiểm tra đầu vào
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại." });
    }

    // **New Check: Verify if the user's account is active**
    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Tài khoản của bạn hiện đang bị cấm, hãy liên hệ với đội ngũ admin để được tư vấn.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Sai mật khẩu." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Cập nhật refresh token trong cơ sở dữ liệu
    user.refreshToken = refreshToken;
    await user.save();

    // Đặt refresh token trong cookie
    res.cookie("refreshToken", refreshToken, getCookieConfig(isProduction));

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };

    res.status(200).json({
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

// Đăng xuất
exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Tìm người dùng và vô hiệu hóa refresh token
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        user.tokenVersion += 1; // Tăng phiên bản token
        await user.save();
      }
    }

    // Xóa cookie mà không có tùy chọn maxAge
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });
    res.status(200).json({ message: "Đăng xuất thành công." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

// Lấy thông tin người dùng theo ID (profile)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Không tìm thấy refresh token." });
    }

    // Xác minh refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHSECRET);

    // Tìm người dùng và xác thực phiên bản token
    const user = await User.findById(decoded.id);
    if (
      !user ||
      user.refreshToken !== refreshToken ||
      user.tokenVersion !== decoded.version
    ) {
      throw new Error("Invalid refresh token");
    }

    // Tạo token mới
    const tokens = generateTokens(user);

    // Cập nhật refresh token trong cơ sở dữ liệu
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Đặt refresh token mới trong cookie
    res.cookie(
      "refreshToken",
      tokens.refreshToken,
      getCookieConfig(process.env.NODE_ENV === "production")
    );

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

// Đăng nhập bằng Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, name } = payload;
    const password = googleId; // Sử dụng googleId làm mật khẩu

    let user = await User.findOne({ email });

    if (!user) {
      // Nếu người dùng không tồn tại, tạo người dùng mới
      user = new User({
        email,
        password,
        name,
        tokenVersion: 0, // Đảm bảo tokenVersion được thiết lập
      });
      await user.save();
    }

    // Tạo token
    const { accessToken, refreshToken } = generateTokens(user);

    // Cập nhật refresh token trong cơ sở dữ liệu
    user.refreshToken = refreshToken;
    await user.save();

    // Đặt refresh token trong cookie
    res.cookie("refreshToken", refreshToken, getCookieConfig(isProduction));

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };

    res.status(200).json({
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({ error: error.message });
  }
};

// Đăng nhập admin

exports.loginUserAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại." });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(400).json({ message: "Sai mật khẩu." });

    if (!user.roles.includes("admin")) {
      return res
        .status(403)
        .json({ message: "Không có quyền truy cập admin." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Trả về thông tin đầy đủ của admin
    res.status(200).json({
      accessToken,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error("Error in loginUserAdmin:", error);
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật thông tin người dùng

exports.updateUser = async (req, res) => {
  try {
    const { name, phone, gender, addresses, password } = req.body;
    console.log(req.body);
    const updates = {};

    // Thêm các trường cần cập nhật nếu chúng tồn tại trong request body
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (gender) updates.gender = gender;
    if (addresses) updates.addresses = addresses;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu mới
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // ID lấy từ token đã giải mã
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update error:", error); // Log lỗi chi tiết
    res.status(500).json({ error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    // Check if the requester has the 'admin' role
    console.log(req.user);
    if (!req.user.roles || !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Fetch all users, excluding sensitive fields
    const users = await User.find().select("-password -refreshToken");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error." });
  }
};

///
// controllers/userController.js

// Create a new user by admin
exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, gender, roles } = req.body;

    // Validate input
    if (!name || !email || !password || !roles) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      roles,
      tokenVersion: 0,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Create user by admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// controllers/userController.js

// Update a user by admin
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, gender, addresses, password, roles, isActive } =
      req.body;

    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (gender) updates.gender = gender;
    if (addresses) updates.addresses = addresses;
    if (roles) updates.roles = roles;
    if (typeof isActive !== "undefined") updates.isActive = isActive;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user by admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
// controllers/userController.js

// Delete a user by admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
