const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendMail");
const User = require('../models/User');
const generateToken = require('../utils/generalToken');
const verifyEmail = require('../utils/verifyMail');
const validateUtils = require('../utils/validateInput');
dotenv.config()
let otpStore = {};

const sendOtp = async (req, res) => {
  const { type, email } = req.body;
  try {
    const errMsg = validateUtils.validateEmail(email);
    if (errMsg !== null) {
      return res.status(400).json({ message: errMsg });
    }
    if (!["register", "reset-password"].includes(type)) {
      return res.status(400).json({ message: "Loại OTP không hợp lệ!" });
    }
    if (type === "register") {
      const userExists = await User.findOne({ email });
      if (userExists)
        return res.status(400).json({ message: "Email đã tồn tại!" });
    } else if (type === "reset-password") {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Email không tồn tại!" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const expiresAt = Date.now() + 1 * 60 * 1000; // OTP hết hạn sau 5 phút
    if (!otpStore[email]) otpStore[email] = {};
    otpStore[email][type] = { otp, isVerified: false, expiresAt }; // Lưu OTP kèm thời gian hết hạn
    if (!(await verifyEmail(email))) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    try {
      await sendEmail(email, otp, type);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Không thể gửi email. Vui lòng thử lại!" });
    }

    res.status(200).json({ message: `OTP đã được gửi để ${type === "register" ? "đăng ký" : "đặt lại mật khẩu"}!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};
const verifyOtp = (req, res) => {
  const { type, email, otp } = req.body;

  if (!["register", "reset-password"].includes(type)) {
    return res.status(400).json({ message: "Loại OTP không hợp lệ!" });
  }
  if (!otpStore[email] || !otpStore[email][type])
    return res.status(400).json({ message: "OTP không tồn tại hoặc đã hết hạn!" });
  const storedOtp = otpStore[email][type];

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email][type];
    return res.status(400).json({ message: "OTP đã hết hạn!" });
  }

  // Kiểm tra OTP có khớp không
  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: "OTP không chính xác!" });
  }

  // Đánh dấu OTP là đã xác minh
  storedOtp.isVerified = true;
  res.status(200).json({ message: "OTP xác thực thành công!" });
};
const refreshToken = async (req, res) => {
  try {
    // const token = req.cookies.refresh_token;
    // if (!token) {
    //     return res.status(404).json({
    //         status: 'ERR',
    //         message: 'Refresh token is required'
    //     });
    // }
    const { token } = req.body
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });
    // Đối chiếu token trong DB (bảo mật hơn)
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        status: 'ERR',
        message: 'Invalid refresh token or user'
      });
    }

    const access_token = await generateToken.genneralAccessToken({
      id: user.id,
      role: user.role
    });

    user.accessToken = access_token;
    await user.save();

    return res.status(200).json({
      status: 'OK',
      message: 'Access Token được cập nhật thành công',
      access_token
    });
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      status: 'ERR',
      message: 'Invalid or expired token'
    });
  }
}
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const checkEmail = validateUtils.validateEmail(email);
    if (checkEmail !== null) {
      return res.status(400).json({ message: checkEmail });
    }
    const errMsg = validateUtils.validatePassword(password);
    if (errMsg !== null) {
      return res.status(400).json({ message: errMsg });
    }
    const checkPhone = validateUtils.validatePhone(phone);
    if (checkPhone !== null) {
      return res.status(400).json({ message: checkPhone });
    }
    if (!otpStore[email] || !otpStore[email]["register"]?.isVerified)
      return res.status(400).json({ message: "Chưa xác thực OTP!" });

    // Kiểm tra OTP có hết hạn không
    if (Date.now() > storedOtp.expiresAt) {
      delete otpStore[email]["register"];
      return res.status(400).json({ message: "OTP đã hết hạn!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });
    await newUser.save();

    // Xóa OTP sau khi đăng ký thành công
    delete otpStore[email]["register"];

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi hệ thống!" });

  }
};
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!otpStore[email] || !otpStore[email]["reset-password"]?.isVerified)
    return res.status(400).json({ message: "Chưa xác thực OTP!" });


  // // Kiểm tra OTP có hết hạn không
  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email]["reset-password"];
    return res.status(400).json({ message: "OTP đã hết hạn!" });
  }

  // // Xóa OTP sau khi sử dụng
  delete otpStore[email]["resetPassword"];

  const errMsg = validateUtils.validatePassword(newPassword);
  if (errMsg !== null) {
    return res.status(400).json({ message: errMsg });
  }
  // Cập nhật mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    await User.updateOne({ email }, { password: hashedPassword });
    res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }

}
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng!" });

    if (user.isActivated === false)
      return res.status(400).json({ message: "Tài khoản bị khóa!" });

    const payload = { id: user._id, role: user.role };

    const accessToken = generateToken.genneralAccessToken(payload);
    const refreshToken = generateToken.genneralRefreshToken(payload);


    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();


    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    })

    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = req.user;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });

    const errMsg = validateUtils.validatePassword(newPassword);
    if (errMsg !== null) {
      return res.status(400).json({ message: errMsg });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Thay đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};
module.exports = {
  refreshToken,
  register,
  resetPassword,
  login,
  sendOtp,
  verifyOtp,
  changePassword
}