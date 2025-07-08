import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { getProfile, updateProfile } from "../../services/UserService";
import "./EditProfile.css";

export default function EditProfile() {
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        const u = res.data.user;
        setUser({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        });
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(user);
      setSuccess(true);
      setTimeout(() => navigate("/user/profile"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại sau."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="centered">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="form-header">
        <Link to="/user/profile" className="back-link">
          <ArrowBackIcon />
        </Link>
        <h1>CHỈNH SỬA THÔNG TIN</h1>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="avatar-container">
          <div className="avatar-circle">
            {user.name.charAt(0).toUpperCase() || <PersonIcon />}
          </div>
        </div>

        <div className="form-row">
          <label className="field-label">
            <PersonIcon className="icon" />
            Họ và tên
          </label>
          <input
            className="field-input"
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="form-row">
          <label className="field-label">
            <EmailIcon className="icon" />
            Email
          </label>
          <input
            className="field-input"
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Nhập email"
            required
          />
        </div>

        <div className="form-row">
          <label className="field-label">
            <PhoneIcon className="icon" />
            Số điện thoại
          </label>
          <input
            className="field-input"
            name="phone"
            value={user.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? (
              <div className="spinner-small" />
            ) : (
              <>
                <SaveIcon fontSize="small" />
                LƯU THAY ĐỔI
              </>
            )}
          </button>
        </div>

        {success && (
          <div className="snackbar success">Cập nhật thông tin thành công!</div>
        )}
      </form>
    </div>
  );
}
