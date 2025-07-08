import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Login as LoginIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { getProfile, changePassword } from "../../services/UserService";
import AccountLayout from "../../components/BreadCrumb/AccountLayout";
import "./ChangePassword.css";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("warning");

  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // kiểm tra login
  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        if (res.data?.user) {
          setUser(res.data.user);
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // xử lý form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setAlertType("warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Xác nhận mật khẩu không khớp.");
      setAlertType("warning");
      return;
    }
    try {
      const res = await changePassword({ oldPassword, newPassword });
      setMessage(res.data.message || "Đổi mật khẩu thành công.");
      setAlertType("success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Lỗi khi đổi mật khẩu, thử lại sau."
      );
      setAlertType("error");
    }
  };

  if (loading) {
    return (
      <div className="centered">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="login-prompt">
        <div className="login-box">
          <div className="avatar-large">
            <LoginIcon fontSize="large" />
          </div>
          <h2>Vui lòng đăng nhập để tiếp tục</h2>
          <p>Bạn cần đăng nhập để đổi mật khẩu.</p>
          <div className="login-actions">
            <Link className="btn primary" to="/login">
              <LoginIcon /> Đăng nhập
            </Link>
            <Link className="btn" to="/">
              <HomeIcon /> Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AccountLayout user={user}>
        <h1>
          <SecurityIcon /> Đổi mật khẩu
        </h1>
        <p className="subtitle">
          Đặt mật khẩu mới ít nhất 6 ký tự để bảo mật tài khoản.
        </p>

        {message && (
          <div className={`alert ${alertType}`}>
            {alertType === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
            <span>{message}</span>
          </div>
        )}

        <form className="password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <LockIcon /> Mật khẩu hiện tại
            </label>
            <div className="input-wrap">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowOld((v) => !v)}
              >
                {showOld ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              <LockIcon /> Mật khẩu mới
            </label>
            <div className="input-wrap">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              <LockIcon /> Xác nhận mật khẩu
            </label>
            <div className="input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn primary">
            Đổi mật khẩu
          </button>
        </form>
      </AccountLayout>
    </>
  );
}
