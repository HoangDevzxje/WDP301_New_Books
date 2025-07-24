import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Login as LoginIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { getProfile, updateProfile } from "../../services/UserService";
import "./Profile.css";
import AccountLayout from "../../components/BreadCrumb/AccountLayout";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        if (res.data?.user) {
          setUser(res.data.user);
          setEditData({
            name: res.data.user.name || "",
            email: res.data.user.email || "",
            phone: res.data.user.phone || "",
          });
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

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = () => {
    setIsEditing(true);
    setEditError("");
    setSuccess(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setEditError("");
  };

  const saveEdit = async () => {
    setSaving(true);
    setEditError("");
    try {
      await updateProfile(editData);
      setUser({ ...user, ...editData });
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setEditError(
        err.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setSaving(false);
    }
  };

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
          {!isEditing ? (
            <button className="btn-edit" onClick={startEdit}>
              <EditIcon /> Chỉnh sửa
            </button>
          ) : (
            <div className="edit-actions">
              <button
                className="btn btn-cancel"
                onClick={cancelEdit}
                disabled={saving}
              >
                <CancelIcon /> Hủy
              </button>
              <button
                className="btn btn-save primary"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <div className="spinner-small" />
                ) : (
                  <>
                    <SaveIcon /> Lưu
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {editError && <div className="error-message">{editError}</div>}
        {success && (
          <div className="success-message">Cập nhật thông tin thành công!</div>
        )}

        <div className="info-row">
          <div className="info-label">
            <PersonIcon /> Họ tên:
          </div>
          <div className="info-value">
            {isEditing ? (
              <input
                className="field-input"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                placeholder="Nhập họ và tên"
              />
            ) : (
              user.name || "Chưa cập nhật"
            )}
          </div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <EmailIcon /> Email:
          </div>
          <div className="info-value">
            {isEditing ? (
              <input
                className="field-input"
                name="email"
                type="email"
                value={editData.email}
                onChange={handleEditChange}
                placeholder="Nhập email"
                required
              />
            ) : (
              user.email || "Chưa cập nhật"
            )}
          </div>
        </div>

        <div className="info-row">
          <div className="info-label">
            <PhoneIcon /> Số điện thoại:
          </div>
          <div className="info-value">
            {isEditing ? (
              <input
                className="field-input"
                name="phone"
                value={editData.phone}
                onChange={handleEditChange}
                placeholder="Nhập số điện thoại"
              />
            ) : (
              user.phone || "Chưa cập nhật"
            )}
          </div>
        </div>
      </AccountLayout>
    </>
  );
}
