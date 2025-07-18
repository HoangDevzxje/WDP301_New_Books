import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedIcon from "@mui/icons-material/Verified";
import LockResetIcon from "@mui/icons-material/LockReset";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import "./ForgotPassword.css";
import { resetPassword, sendOTP, verifyOTP } from "../../services/UserService";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(false);

  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });

    // Auto hide alert after 6 seconds
    setTimeout(() => {
      setAlert({ open: false, message: "", severity: "info" });
    }, 6000);
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, message: "", severity: "info" });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sendOTP(email);
      handleAlert(res.data.message, "success");
      setStep(2);
    } catch (error) {
      handleAlert(error.response?.data?.message || "Lỗi gửi OTP!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOTP(email, otp);
      handleAlert(res.data.message, "success");
      setStep(3);
    } catch (error) {
      handleAlert(
        error.response?.data?.message || "OTP không hợp lệ!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      handleAlert("Mật khẩu phải có ít nhất 6 ký tự!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      handleAlert("Mật khẩu xác nhận không khớp!", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(email, newPassword);
      handleAlert(res.data.message, "success");
      setTimeout(() => {
        navigate("/account/login", {
          state: {
            credentials: { email, password: newPassword },
          },
        });
      }, 1000);
    } catch (error) {
      handleAlert(
        error.response?.data?.message || "Lỗi đặt lại mật khẩu!",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case "success":
        return <CheckCircleIcon className="alert-icon" />;
      case "error":
        return <ErrorIcon className="alert-icon" />;
      case "info":
      default:
        return <InfoIcon className="alert-icon" />;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="forgot-password-form">
            <div className="form-group">
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label className="form-label">Email</label>
            </div>
            <button type="submit" disabled={loading} className="form-button">
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <EmailIcon className="form-button-icon" />
                  Gửi mã OTP
                </>
              )}
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="forgot-password-form">
            <div className="form-group">
              <input
                type="text"
                required
                className="form-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder=" "
              />
              <label className="form-label">Mã OTP</label>
            </div>
            <button type="submit" disabled={loading} className="form-button">
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <VerifiedIcon className="form-button-icon" />
                  Xác nhận OTP
                </>
              )}
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label">Mật khẩu mới</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                />
                <label className="form-label">Xác nhận mật khẩu</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="form-button">
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <LockResetIcon className="form-button-icon" />
                  Đặt lại mật khẩu
                </>
              )}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <LockIcon className="forgot-password-icon" />
        <h1 className="forgot-password-title">Quên Mật Khẩu</h1>
      </div>

      {renderStep()}

      <div className="login-link">
        Đã có tài khoản? <Link to="/account/login">Đăng nhập</Link>
      </div>

      {/* Alert */}
      {alert.open && (
        <div className={`alert ${alert.severity}`}>
          {getAlertIcon(alert.severity)}
          <span className="alert-message">{alert.message}</span>
          <button className="alert-close" onClick={handleCloseAlert}>
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
