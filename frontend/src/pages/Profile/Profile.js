import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  ShoppingBag as ShoppingBagIcon,
  Login as LoginIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { getProfile } from "../../services/UserService";

import "./Profile.css";
import AccountBreadCrumb from "../../components/BreadCrumb/AccountBreadCrumb";

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
        <AccountBreadCrumb
          paths={[{ name: "Tài khoản", to: "/user/profile" }]}
        />
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
      <AccountBreadCrumb
        paths={[
          { name: "Tài khoản", to: "/user/profile" },
          { name: "Thông tin tài khoản" },
        ]}
      />

      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name?.charAt(0).toUpperCase() || <PersonIcon />}
            </div>
            <div className="profile-name">{user.name || "Khách"}</div>
            <div className="profile-role">Thành viên</div>
          </div>

          <ul className="profile-nav">
            <li className="nav-item active">
              <Link to="/user/profile">
                <PersonIcon /> Thông tin tài khoản
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/auth/change-password">
                <LockIcon /> Đổi mật khẩu
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/track-order">
                <ShoppingBagIcon /> Đơn hàng của tôi
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/user/addresses">
                <HomeIcon /> Địa chỉ
              </Link>
            </li>
          </ul>
        </aside>

        <main className="profile-main">
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
        </main>
      </div>
    </>
  );
}
