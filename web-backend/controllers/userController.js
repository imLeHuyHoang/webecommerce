const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// Tạo JWT token
const generateToken = (user, secret, expiresIn) => {
  return jwt.sign({ id: user._id, roles: user.roles }, secret, { expiresIn });
};

// Đăng ký người dùng mới
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, gender } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đăng nhập và tạo JWT token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === "production";

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Tài khoản không tồn tại." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Sai mật khẩu." });

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
      secure: isProduction, // Sử dụng biến isProduction
      sameSite: "lax", // Thay "strict" bằng "lax" để tương thích hơn
      path: "/",
    });

    res.status(200).json({ accessToken, id: user._id, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Đăng xuất
exports.logoutUser = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  try {
    console.log("Cookies received:", req.cookies);

    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      console.log("No refresh token found in cookies.");
      return res.status(204).json({ message: "No content" });
    }

    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction, // Sử dụng biến isProduction
      sameSite: "lax", // Thay "strict" bằng "lax" để tương thích hơn
      path: "/",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
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

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, gender, addresses, password } = req.body;

    const updates = {};

    // Thêm vào các trường cần cập nhật nếu chúng tồn tại trong request body
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (gender) updates.gender = gender;
    if (addresses) updates.addresses = addresses;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Mã hoá mật khẩu mới
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
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token missing." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHSECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newAccessToken = generateToken(user, process.env.JWT_SECRET, "15m");
    const newRefreshToken = generateToken(
      user,
      process.env.JWT_REFRESHSECRET,
      "7d"
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
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
