import React, { useState } from "react";
import {
  Button,
  TextField,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSendOTP = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.phone
    ) {
      handleAlert("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    if (formData.password.length < 6) {
      handleAlert("Mật khẩu phải có ít nhất 6 ký tự", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      handleAlert("Email không hợp lệ", "error");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      handleAlert("Số điện thoại không hợp lệ (10 số)", "error");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:9999/auth/send-otp", {
        email: formData.email,
        type: "register",
      });
      setOtpDialogOpen(true);
      handleAlert("Mã OTP đã được gửi đến email của bạn", "success");
    } catch (error) {
      handleAlert(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      handleAlert("Vui lòng nhập mã OTP", "error");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:9999/auth/verify-otp", {
        email: formData.email,
        otp,
        type: "register",
      });

      await axios.post("http://localhost:9999/auth/register", formData);

      setOtpDialogOpen(false);

      handleAlert(
        "Đăng ký thành công! Hệ thống sẽ tự chuyển bạn sang trang Login.",
        "success"
      );

      setTimeout(() => {
        navigate("/account/login", {
          state: {
            message:
              "Đăng ký thành công! Hệ thống sẽ tự chuyển bạn sang trang Login.",
            credentials: {
              email: formData.email,
              password: formData.password,
            },
          },
        });
      }, 2000);
    } catch (error) {
      handleAlert(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSendOTP();
  };

  const handleFacebookLogin = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/auth/facebook`, "_self");
    } catch (error) {
      setError("Đăng nhập bằng Facebook thất bại. Vui lòng thử lại.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/auth/google`, "_self");
    } catch (error) {
      setError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    }
  };
  
  const resendOTP = async () => {
    try {
      setLoading(true);
      await handleSendOTP();
      handleAlert("Mã OTP mới đã được gửi đến email của bạn", "success");
    } catch (error) {
      handleAlert("Không thể gửi lại mã OTP. Vui lòng thử lại sau.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="register-container">
      <Box className="register-form-container">
        <Typography variant="h4" className="register-title" gutterBottom>
          Đăng ký
        </Typography>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <TextField
            required
            fullWidth
            id="name"
            label="Họ & tên"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!error && !formData.name}
          />
          <TextField
            required
            fullWidth
            id="phone"
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!error && !formData.phone}
          />
          <TextField
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!error && !formData.email}
          />
          <TextField
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!error && formData.password.length < 6}
            helperText={
              formData.password.length < 6
                ? "Mật khẩu phải có ít nhất 6 ký tự"
                : ""
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            className="register-button"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>

          <Typography align="center" sx={{ mt: 2 }}>
            Đã có tài khoản, đăng nhập&nbsp;
            <Link to="/account/login" className="login-link">
              tại đây
            </Link>
          </Typography>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng nhập bằng
            </Typography>
          </Divider>

          <Box className="social-buttons-container">
            <Button
              variant="outlined"
              onClick={handleFacebookLogin}
              fullWidth
              className="facebook-button"
              disabled={loading}
            >
              <img
                src="https://www.facebook.com/favicon.ico"
                alt="Facebook icon"
                className="social-icon"
              />
              Facebook
            </Button>
            <Button
              variant="outlined"
              onClick={handleGoogleLogin}
              fullWidth
              className="google-button"
              disabled={loading}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google icon"
                className="social-icon"
              />
              Google
            </Button>
          </Box>
        </form>

        {/* OTP Dialog */}
        <Dialog
          open={otpDialogOpen}
          onClose={() => !loading && setOtpDialogOpen(false)}
        >
          <DialogTitle>Xác thực OTP</DialogTitle>
          <DialogContent className="otp-dialog">
            <Typography variant="body2" sx={{ mb: 2 }}>
              Mã OTP đã được gửi đến email <strong>{formData.email}</strong>
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Nhập mã OTP"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button 
              onClick={resendOTP} 
              disabled={loading} 
              className="otp-resend-button"
            >
              Gửi lại mã OTP
            </Button>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => !loading && setOtpDialogOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button onClick={handleVerifyOTP} disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác nhận"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default Register;
