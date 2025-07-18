import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Feedback,
  Home as HomeIcon,
} from "@mui/icons-material";
import "./AccountLayout.css";

export default function AccountLayout({ user, children }) {
  const location = useLocation();

  return (
    <div className="account-container">
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() || <PersonIcon />}
          </div>
          <div className="user-name">{user?.name || "Tài khoản"}</div>
        </div>
        <ul className="nav-list">
          <li className={location.pathname === "/user/profile" ? "active" : ""}>
            <Link to="/user/profile">
              <PersonIcon /> Thông tin
            </Link>
          </li>
          <li
            className={
              location.pathname === "/user/change-password" ? "active" : ""
            }
          >
            <Link to="/user/change-password">
              <SecurityIcon /> Đổi mật khẩu
            </Link>
          </li>
          <li
            className={location.pathname === "/user/addresses" ? "active" : ""}
          >
            <Link to="/user/addresses">
              <HomeIcon /> Địa chỉ
            </Link>
          </li>
          <li
            className={location.pathname === "/user/complaint" ? "active" : ""}
          >
            <Link to="/user/complaint">
              <Feedback />
              Phản Ánh Khiếu Nại
            </Link>
          </li>
        </ul>
      </aside>
      <main className="main-panel">{children}</main>
    </div>
  );
}
