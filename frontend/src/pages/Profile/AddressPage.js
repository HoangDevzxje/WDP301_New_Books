// src/pages/Profile/AddressPage.js
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  getDistricts,
  getProvinces,
  getWards,
  setDefaultAddress,
  updateAddress,
} from "../../services/AddressService";

export default function AddressPage() {
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    street: "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    isDefault: false,
  });

  // 1) Decode JWT lấy userId
  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (!token) {
      console.warn("Chưa có access_token");
      setLoadingUser(false);
      return;
    }
    try {
      const { id } = jwtDecode(token);
      setUserId(id);
    } catch (err) {
      console.error("Invalid token:", err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // 2) Fetch provinces + addresses sau khi có userId
  useEffect(() => {
    if (!userId) return;
    getProvinces()
      .then((res) => setProvinces(res.data.provinces || []))
      .catch((err) => {
        console.error("Failed to load provinces", err);
        setProvinces([]);
      });

    fetchAddresses();
  }, [userId]);

  // fetchAddresses với try/catch
  async function fetchAddresses() {
    if (!userId) return;
    try {
      const res = await getAddresses(userId);
      // nếu API trả { addresses: [...] } thì res.data.addresses
      setAddresses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      setAddresses([]);
    }
  }

  // 3) khi chọn province → load districts
  useEffect(() => {
    if (!form.provinceId) {
      setDistricts([]);
      setForm((f) => ({ ...f, districtId: "", wardCode: "" }));
      setWards([]);
      return;
    }
    getDistricts(form.provinceId)
      .then((res) => setDistricts(res.data.districts || []))
      .catch(() => setDistricts([]));
    setWards([]);
  }, [form.provinceId]);

  // 4) khi chọn district → load wards
  useEffect(() => {
    if (!form.districtId) {
      setWards([]);
      setForm((f) => ({ ...f, wardCode: "" }));
      return;
    }
    getWards(form.districtId)
      .then((res) => setWards(res.data.wards || []))
      .catch(() => setWards([]));
  }, [form.districtId]);

  function handleOpenNew() {
    setEditing(null);
    setForm({
      street: "",
      provinceId: "",
      districtId: "",
      wardCode: "",
      isDefault: false,
    });
    setOpen(true);
  }

  function handleOpenEdit(addr) {
    setEditing(addr);
    setForm({
      street: addr.street,
      provinceId: addr.province.ProvinceID || "",
      districtId: addr.district.DistrictID || "",
      wardCode: addr.ward.WardCode || "",
      isDefault: addr.isDefault,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    const payload = { ...form };
    try {
      if (editing) {
        await updateAddress(userId, editing.id, payload);
      } else {
        await addAddress(userId, payload);
      }
      fetchAddresses();
      setOpen(false);
    } catch (err) {
      console.error("Failed to save address:", err);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      try {
        await deleteAddress(userId, id);
        fetchAddresses();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  }

  async function handleDefault(id) {
    try {
      await setDefaultAddress(userId, id);
      fetchAddresses();
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  }

  // Loading + error
  if (loadingUser) {
    return <Typography>Đang xác thực người dùng…</Typography>;
  }
  if (!userId) {
    return (
      <Typography color="error">Không tìm thấy thông tin người dùng</Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        <HomeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Quản lý địa chỉ
      </Typography>
      <Button variant="contained" onClick={handleOpenNew} sx={{ mb: 2 }}>
        + Thêm địa chỉ mới
      </Button>

      <List>
        {addresses.map((addr) => (
          <ListItem
            key={addr.id}
            secondaryAction={
              <>
                {!addr.isDefault && (
                  <Button size="small" onClick={() => handleDefault(addr.id)}>
                    Đặt mặc định
                  </Button>
                )}
                <IconButton edge="end" onClick={() => handleOpenEdit(addr)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(addr.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={addr.street}
              secondary={`${addr.ward.WardName}, ${addr.district.DistrictName}, ${addr.province.ProvinceName}`}
            />
            {addr.isDefault && (
              <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                (Mặc định)
              </Typography>
            )}
          </ListItem>
        ))}
      </List>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editing ? "Sửa địa chỉ" : "Thêm địa chỉ"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Địa chỉ (Số nhà, tên đường)"
            value={form.street}
            onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
            sx={{ mt: 2 }}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Tỉnh/Thành</InputLabel>
            <Select
              value={form.provinceId}
              label="Tỉnh/Thành"
              onChange={(e) =>
                setForm((f) => ({ ...f, provinceId: e.target.value }))
              }
            >
              {provinces.map((p) => (
                <MenuItem key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Quận/Huyện</InputLabel>
            <Select
              value={form.districtId}
              label="Quận/Huyện"
              onChange={(e) =>
                setForm((f) => ({ ...f, districtId: e.target.value }))
              }
              disabled={!districts.length}
            >
              {districts.map((d) => (
                <MenuItem key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Phường/Xã</InputLabel>
            <Select
              value={form.wardCode}
              label="Phường/Xã"
              onChange={(e) =>
                setForm((f) => ({ ...f, wardCode: e.target.value }))
              }
              disabled={!wards.length}
            >
              {wards.map((w) => (
                <MenuItem key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Checkbox
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
              />
            }
            label="Đặt làm địa chỉ mặc định"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? "Lưu" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
