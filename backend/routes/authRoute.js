const router = require("express").Router();
const authController = require("../controllers/AuthController");

// Xử lý OTP
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

// Đăng ký người dùng
router.post("/register", authController.register);

// Đăng nhập
router.post("/login", authController.login);

// Rest mật khẩu
router.post("/reset-password", authController.resetPassword);

module.exports = router;
