import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../services/AddressService";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/GHNService";
import { getProfile } from "../../services/UserService";
import { Home as HomeIcon, Login as LoginIcon } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import AccountLayout from "../../components/BreadCrumb/AccountLayout";
import "./AddressPage.css";

export default function AddressesPage() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    address: "",
    provinceId: "",
    provinceName: "",
    districtId: "",
    districtName: "",
    wardCode: "",
    wardName: "",
    isDefault: false,
  });

  // Lấy user từ token
  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.id || decoded._id || decoded.userId;
        setUserId(id);
        setUser({ name: decoded.name || "Tài khoản" });
      } catch (err) {
        console.error("Token không hợp lệ:", err);
      }
    }
  }, []);

  // Xác thực từ server
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

  useEffect(() => {
    (async () => {
      try {
        const res = await getProvinces();
        setProvinces(res.data);
      } catch (err) {
        console.error("Lỗi tải tỉnh:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (userId) loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      const res = await getAddresses(userId);
      setAddresses(res.data);
    } catch (err) {
      console.error("Lỗi tải địa chỉ:", err);
    }
  };

  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      return;
    }
    (async () => {
      try {
        const res = await getDistricts(form.provinceId);
        setDistricts(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [form.provinceId]);

  useEffect(() => {
    if (!form.districtId) {
      setWards([]);
      return;
    }
    (async () => {
      try {
        const res = await getWards(form.districtId);
        setWards(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [form.districtId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProvinceChange = (e) => {
    const id = +e.target.value;
    const prov = provinces.find((p) => p.ProvinceID === id);
    setForm((prev) => ({
      ...prev,
      provinceId: prov?.ProvinceID || "",
      provinceName: prov?.ProvinceName || "",
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const id = +e.target.value;
    const dist = districts.find((d) => d.DistrictID === id);
    setForm((prev) => ({
      ...prev,
      districtId: dist?.DistrictID || "",
      districtName: dist?.DistrictName || "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleWardChange = (e) => {
    const code = e.target.value;
    const w = wards.find((w) => w.WardCode === code);
    setForm((prev) => ({
      ...prev,
      wardCode: w?.WardCode || "",
      wardName: w?.WardName || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(userId, editingId, form);
      } else {
        await addAddress(userId, form);
      }
      resetForm();
      await loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({
      address: "",
      provinceId: "",
      provinceName: "",
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (addr) => {
    setForm({
      address: addr.address,
      provinceId: addr.provinceId,
      provinceName: addr.provinceName,
      districtId: addr.districtId,
      districtName: addr.districtName,
      wardCode: addr.wardCode,
      wardName: addr.wardName,
      isDefault: addr.isDefault,
    });
    setEditingId(addr._id || addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) return;
    try {
      await deleteAddress(userId, id);
      await loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const markDefault = async (id) => {
    try {
      await setDefaultAddress(userId, id);
      await loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Đang kiểm tra xác thực...</p>;

  if (!isAuth) {
    return (
      <div className="login-prompt">
        <div className="login-box">
          <div className="avatar-large">
            <LoginIcon fontSize="large" />
          </div>
          <h2>Vui lòng đăng nhập để tiếp tục</h2>
          <p>Bạn cần đăng nhập để quản lý địa chỉ.</p>
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
    <AccountLayout user={user}>
      {!showForm && (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Thêm địa chỉ
        </button>
      )}
      <h2>
        <HomeIcon /> Địa chỉ của tôi
      </h2>

      <ul className="address-list">
        {addresses.map((addr) => (
          <li
            key={addr._id || addr.id}
            className={`address-item ${addr.isDefault ? "default" : ""}`}
          >
            <div>
              <p>
                {addr.address}, {addr.wardName}, {addr.districtName},{" "}
                {addr.provinceName}
              </p>
              {addr.isDefault && <span className="badge">Mặc định</span>}
            </div>
            <div className="actions">
              {!addr.isDefault && (
                <button
                  onClick={() => markDefault(addr._id || addr.id)}
                  className="btn"
                >
                  Đặt mặc định
                </button>
              )}
              <button onClick={() => startEdit(addr)} className="btn">
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDelete(addr._id || addr.id)}
                className="btn btn-danger"
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
          <input
            type="text"
            name="address"
            placeholder="Số nhà, tên đường"
            value={form.address}
            onChange={handleChange}
            className="input"
            required
          />
          <select
            name="provinceId"
            value={form.provinceId}
            onChange={handleProvinceChange}
            className="input"
            required
          >
            <option value="">Chọn tỉnh/thành</option>
            {provinces.map((p) => (
              <option key={p.ProvinceID} value={p.ProvinceID}>
                {p.ProvinceName}
              </option>
            ))}
          </select>
          <select
            name="districtId"
            value={form.districtId}
            onChange={handleDistrictChange}
            className="input"
            required
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>
          <select
            name="wardCode"
            value={form.wardCode}
            onChange={handleWardChange}
            className="input"
            required
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
            />{" "}
            Đặt làm mặc định
          </label>

          <button type="submit" className="btn btn-primary">
            {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-secondary"
          >
            Hủy
          </button>
        </form>
      )}
    </AccountLayout>
  );
}
