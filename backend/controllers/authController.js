const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Tạo JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Đăng ký
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Tạo user mới
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Sign up successful",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Tìm user và include password (vì đã set select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Kiểm tra password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Tạo token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Đăng xuất (chủ yếu xử lý ở client, backend chỉ trả về success)
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
};

// Quên mật khẩu - gửi reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Không tiết lộ user có tồn tại hay không (security best practice)
      return res.json({
        success: true,
        message: "Nếu email tồn tại, bạn sẽ nhận được link reset password",
      });
    }

    // Tạo reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Tạo reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;

    // Gửi email
    const message = `
Bạn đã yêu cầu reset password.

Link reset password của bạn:
${resetUrl}

Link này sẽ hết hạn sau 10 phút.

Nếu bạn không yêu cầu reset password, vui lòng bỏ qua email này.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password Token",
        message,
      });

      res.json({
        success: true,
        message: "Email đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
        resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined, // Chỉ trả về token trong development
      });
    } catch (error) {
      // Nếu gửi email thất bại, xóa token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Không thể gửi email. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Reset password với token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập password mới",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password phải có ít nhất 6 ký tự",
      });
    }

    // Hash token để so sánh với database
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Set password mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password đã được đổi thành công",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
