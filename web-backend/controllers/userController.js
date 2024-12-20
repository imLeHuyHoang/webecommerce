const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

// Tạo JWT token
const generateTokens = (user) => {
  const tokenPayload = {
    id: user._id,
    email: user.email,
    roles: user.roles,
    version: user.tokenVersion,
  };

  // Tạo Access Token với thời gian sống 15 phút
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Tạo Refresh Token với thời gian sống 7 ngày
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESHSECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Cấu hình cookie cho Refresh Token
const getCookieConfig = () => {
  return {
    httpOnly: true, // Chỉ có server mới có thể đọc được cookie
    secure: true, // Chỉ dùng HTTP, không HTTPS (nên đặt là true trong production)
    sameSite: "lax", // Giảm thiểu rủi ro CSRF
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày tính bằng mili giây
  };
};

/**
 * Đăng ký người dùng mới
 */
exports.registerUser = async (req, res) => {
  const { name, email, password, phone, gender } = req.body;

  try {
    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    // Kiểm tra xem email đã được sử dụng chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      tokenVersion: 0,
    });

    // Lưu người dùng mới vào cơ sở dữ liệu
    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

/**
 * Đăng nhập người dùng
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === "production";

  try {
    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại." });
    }

    // Kiểm tra xem tài khoản có bị khóa hay không
    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Tài khoản của bạn hiện đang bị cấm, hãy liên hệ với đội ngũ admin để được tư vấn.",
      });
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong cơ sở dữ liệu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Sai mật khẩu." });
    }

    // Tạo Access Token và Refresh Token
    const { accessToken, refreshToken } = generateTokens(user);

    // Cập nhật Refresh Token trong cơ sở dữ liệu
    user.refreshToken = refreshToken;
    await user.save();

    // Đặt Refresh Token trong cookie
    res.cookie("refreshToken", refreshToken, getCookieConfig(isProduction));

    // Chuẩn bị dữ liệu người dùng trả về cho client
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

/**
 * Đăng xuất người dùng
 */
exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Tìm người dùng có Refresh Token tương ứng
      const user = await User.findOne({ refreshToken });
      if (user) {
        // Xóa Refresh Token và tăng tokenVersion để làm bất hợp pháp các token hiện tại
        user.refreshToken = null;
        user.tokenVersion += 1;
        await user.save();
      }
    }

    // Xóa cookie Refresh Token trên client
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // Nên đặt là true trong production
      sameSite: "lax",
      path: "/",
    });
    res.status(200).json({ message: "Đăng xuất thành công." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

/**
 * Lấy thông tin hồ sơ người dùng
 */
exports.getProfile = async (req, res) => {
  try {
    // Tìm người dùng theo ID từ token đã giải mã và loại bỏ các trường nhạy cảm
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

/**
 * Làm mới Access Token bằng Refresh Token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Không tìm thấy refresh token." });
    }

    // Giải mã Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESHSECRET);

    // Tìm người dùng theo ID từ payload
    const user = await User.findById(decoded.id);
    if (
      !user ||
      user.refreshToken !== refreshToken ||
      user.tokenVersion !== decoded.version
    ) {
      throw new Error("Invalid refresh token");
    }

    // Tạo lại Access Token và Refresh Token mới
    const tokens = generateTokens(user);

    // Cập nhật Refresh Token mới trong cơ sở dữ liệu
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Đặt Refresh Token mới trong cookie
    res.cookie("refreshToken", tokens.refreshToken, getCookieConfig());

    // Chuẩn bị dữ liệu người dùng trả về cho client
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };

    res.json({ accessToken: tokens.accessToken, user: userResponse });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

// Khởi tạo OAuth2Client cho đăng nhập bằng Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Đăng nhập bằng Google OAuth
 */
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    // Xác thực ID Token từ Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, name } = payload;
    const password = googleId; // Sử dụng Google ID làm mật khẩu tạm thời

    // Tìm hoặc tạo người dùng mới
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        password,
        name,
        tokenVersion: 0,
      });
      await user.save();
    }

    // Tạo Access Token và Refresh Token
    const { accessToken, refreshToken } = generateTokens(user);

    // Cập nhật Refresh Token trong cơ sở dữ liệu
    user.refreshToken = refreshToken;
    await user.save();

    // Đặt Refresh Token trong cookie
    res.cookie("refreshToken", refreshToken, getCookieConfig());

    // Chuẩn bị dữ liệu người dùng trả về cho client
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

/**
 * Đăng nhập admin
 */
exports.loginUserAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email và mật khẩu là bắt buộc." });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại." });
    }

    // Kiểm tra xem tài khoản có bị khóa hay không
    if (!user.isActive) {
      return res.status(403).json({
        message: "Tài khoản của bạn đang bị cấm, liên hệ admin để được tư vấn.",
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Sai mật khẩu." });
    }

    // Tạo Access Token và Refresh Token
    const { accessToken, refreshToken } = generateTokens(user);

    // Cập nhật Refresh Token trong cơ sở dữ liệu
    user.refreshToken = refreshToken;
    await user.save();

    // Đặt Refresh Token trong cookie
    res.cookie("refreshToken", refreshToken, getCookieConfig());

    // Chuẩn bị dữ liệu người dùng trả về cho client
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

/**
 * Cập nhật thông tin người dùng
 */
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

    // Nếu có mật khẩu mới, mã hóa trước khi cập nhật
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu mới
      updates.password = hashedPassword;
    }

    // Cập nhật người dùng trong cơ sở dữ liệu
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // ID lấy từ token đã giải mã
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken"); // Loại bỏ các trường nhạy cảm

    if (!updatedUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update error:", error); // Log lỗi chi tiết
    res.status(500).json({ error: error.message });
  }
};

/**
 * Lấy tất cả người dùng (chỉ dành cho admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user.roles || !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { search } = req.query;
    let query = {};

    // Nếu có tham số tìm kiếm, tạo điều kiện tìm kiếm theo tên, email hoặc điện thoại
    if (search) {
      const searchRegex = new RegExp(search, "i"); // 'i' để tìm kiếm không phân biệt hoa thường
      query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      };
    }

    // Lấy danh sách người dùng từ cơ sở dữ liệu
    const users = await User.find(query).select("-password -refreshToken");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Tạo người dùng mới bởi admin
 */
exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, gender, roles } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !roles) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Kiểm tra xem email đã được sử dụng chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    // Mã hóa mật khẩu trước khi lưu
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

    // Lưu người dùng mới vào cơ sở dữ liệu
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Create user by admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Cập nhật người dùng bởi admin
 */
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, gender, addresses, password, roles, isActive } =
      req.body;

    const updates = {};

    // Thêm các trường cần cập nhật nếu chúng tồn tại trong request body
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (gender) updates.gender = gender;
    if (addresses) updates.addresses = addresses;
    if (roles) updates.roles = roles;
    if (typeof isActive !== "undefined") updates.isActive = isActive;

    // Nếu có mật khẩu mới, mã hóa trước khi cập nhật
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.password = hashedPassword;
    }

    // Cập nhật người dùng trong cơ sở dữ liệu
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken"); // Loại bỏ các trường nhạy cảm

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user by admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Xóa người dùng bởi admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa người dùng theo ID
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Quên mật khẩu - Gửi mã xác thực tới email
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống." });
    }

    // Tạo mã xác thực 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Mã hết hạn sau 10 phút
    await user.save();

    // Cấu hình transporter cho Nodemailer sử dụng Gmail
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email gửi
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng hoặc mật khẩu email
      },
    });

    // Cấu hình thông tin email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác thực đặt lại mật khẩu",
      text: `Mã xác thực của bạn là: ${code}. Mã này sẽ hết hạn sau 10 phút.`,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    res.json({ message: "Mã xác thực đã được gửi tới email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

/**
 * Xác thực mã reset password
 */
exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ message: "Thông tin không hợp lệ." });
    }

    // Kiểm tra mã xác thực
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: "Mã xác thực không đúng." });
    }

    // Kiểm tra thời gian hết hạn của mã
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: "Mã xác thực đã hết hạn." });
    }

    // Nếu mã đúng và chưa hết hạn, trả về thông báo hợp lệ
    res.json({ message: "Mã xác thực hợp lệ." });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

/**
 * Đặt lại mật khẩu
 */
exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  try {
    // Tìm người dùng theo email và mã xác thực
    const user = await User.findOne({ email });
    if (!user || user.resetPasswordCode !== code) {
      return res.status(400).json({ message: "Thông tin không hợp lệ." });
    }

    // Kiểm tra thời gian hết hạn của mã
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: "Mã xác thực đã hết hạn." });
    }

    // Mã hóa mật khẩu mới và cập nhật trong cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
