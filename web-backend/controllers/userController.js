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
    version: user.tokenVersion, // Add version control
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESHSECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Cookie configuration
const getCookieConfig = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Đăng ký người dùng mới
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, gender } = req.body;

  try {
    // Input validation
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
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Sai mật khẩu." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in cookie
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
      // Find user and invalidate refresh token
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        user.tokenVersion += 1; // Increment token version
        await user.save();
      }
    }

    // Clear cookie regardless of token presence
    res.clearCookie(
      "refreshToken",
      getCookieConfig(process.env.NODE_ENV === "production")
    );
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

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    res.status(200).json({ message: "Xóa người dùng thành công." });
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

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHSECRET);

    // Find user and validate token version
    const user = await User.findById(decoded.id);
    if (
      !user ||
      user.refreshToken !== refreshToken ||
      user.tokenVersion !== decoded.version
    ) {
      throw new Error("Invalid refresh token");
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Set new refresh token in cookie
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
// Google Login
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, name } = payload;
    const password = googleId; // Sử dụng googleId làm mật khẩu

    console.log("Google ID Token payload:", payload); // Logging chi tiết

    let user = await User.findOne({ email });

    if (!user) {
      // Nếu người dùng chưa tồn tại, tạo tài khoản mới
      user = new User({ email, password, name });
      await user.save();
    }

    // Tạo token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ accessToken, id: user._id });
  } catch (error) {
    console.error("Error during Google login:", error); // Logging chi tiết
    res.status(500).json({ error: error.message });
  }
};

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

    const accessToken = generateToken(user, process.env.JWT_SECRET, "15m");
    const refreshToken = generateToken(
      user,
      process.env.JWT_REFRESHSECRET,
      "7d"
    );

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
    res.status(500).json({ error: error.message });
  }
};

// Hàm cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, gender, addresses, password } = req.body;

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
