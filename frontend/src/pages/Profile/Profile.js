import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Login as LoginIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { getProfile } from "../../services/UserService";
import "./Profile.css";

import AccountLayout from "../../components/BreadCrumb/AccountLayout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        if (res.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          setError("Dữ liệu người dùng không hợp lệ");
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        } else {
          setError("Không thể kết nối đến server");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // loading spinner
  if (loading) {
    return (
      <div className="centered">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="login-prompt">
          <div className="login-box">
            <div className="avatar-large">
              <LoginIcon fontSize="large" />
            </div>
            <h2>Vui lòng đăng nhập để tiếp tục</h2>
            <p>Bạn cần đăng nhập để xem thông tin tài khoản của mình.</p>
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
      </>
    );
  }

  return (
    <>
      <AccountLayout user={user}>
        <div className="profile-header">
          <h1>THÔNG TIN TÀI KHOẢN</h1>
          <Link className="btn-edit" to="/user/edit-profile">
            <EditIcon /> Chỉnh sửa
          </Link>
        </div>

        <div className="info-row">
          <div className="info-label">
            <PersonIcon /> Họ tên:
          </div>
          <div className="info-value">{user.name || "Chưa cập nhật"}</div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <EmailIcon /> Email:
          </div>
          <div className="info-value">{user.email || "Chưa cập nhật"}</div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <PhoneIcon /> Số điện thoại:
          </div>
          <div className="info-value">{user.phone || "Chưa cập nhật"}</div>
        </div>
      </AccountLayout>
    </>
  );
}
