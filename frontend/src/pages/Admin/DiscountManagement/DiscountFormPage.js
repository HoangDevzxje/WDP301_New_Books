import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDiscountById,
  createDiscount,
  updateDiscount,
} from "../../../services/AdminService/discountService";

export default function DiscountFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (isEditing) {
      getDiscountById(id)
        .then((d) => {
          setForm({
            code: d.code,
            type: d.type,
            value: d.value,
            minPurchase: d.minPurchase,
            usageLimit: d.usageLimit,
            startDate: d.startDate.slice(0, 10),
            endDate: d.endDate.slice(0, 10),
          });
        })
        .catch(() => openSnackbar("Lỗi khi tải thông tin", "error"));
    }
  }, [id]);

  const validate = () => {
    const errs = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sd = new Date(form.startDate);
    const ed = new Date(form.endDate);
    const codeRe = /^[A-Z0-9]{6}$/;

    if (!form.code.trim()) errs.code = "Mã không được để trống";
    else if (!codeRe.test(form.code)) errs.code = "Mã phải 6 ký tự A–Z/0–9";
    if (form.value === "") errs.value = "Giá trị bắt buộc";
    else if (form.value < 0) errs.value = "Không được âm";
    else if (form.type === "percentage" && form.value > 100)
      errs.value = "Không vượt quá 100%";
    if (form.minPurchase === "" || form.minPurchase <= 0)
      errs.minPurchase = "Phải > 0";
    if (form.usageLimit === "" || form.usageLimit < 1)
      errs.usageLimit = "Phải ≥ 1";
    if (!form.startDate) errs.startDate = "Chọn ngày bắt đầu";
    else if (sd < today) errs.startDate = "Không được trong quá khứ";
    if (!form.endDate) errs.endDate = "Chọn ngày kết thúc";
    else if (ed <= sd) errs.endDate = "Phải sau ngày bắt đầu";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      usageLimit: Number(form.usageLimit),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    };
    try {
      if (isEditing) {
        await updateDiscount(id, payload);
        openSnackbar("Cập nhật thành công");
      } else {
        await createDiscount(payload);
        openSnackbar("Tạo mới thành công");
      }
      setTimeout(() => navigate("/admin/discounts"), 500);
    } catch (e) {
      const msg = e.response?.data?.message || "Lỗi server";
      openSnackbar(msg, "error");
    }
  };

  const openSnackbar = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: null }));
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, m: "auto" }}>
      <Typography variant="h5" mb={2}>
        {isEditing ? "Chỉnh sửa mã giảm giá" : "Tạo mới mã giảm giá"}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Mã"
            name="code"
            fullWidth
            value={form.code}
            onChange={handleChange}
            error={!!errors.code}
            helperText={errors.code}
            disabled={isEditing}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Loại</InputLabel>
            <Select
              label="Loại"
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={isEditing}
            >
              <MenuItem value="percentage">Phần trăm</MenuItem>
              <MenuItem value="fixed">Cố định</MenuItem>
            </Select>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Giá trị"
            name="value"
            type="number"
            fullWidth
            value={form.value}
            onChange={handleChange}
            error={!!errors.value}
            helperText={errors.value}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Min Purchase"
            name="minPurchase"
            type="number"
            fullWidth
            value={form.minPurchase}
            onChange={handleChange}
            error={!!errors.minPurchase}
            helperText={errors.minPurchase}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Usage Limit"
            name="usageLimit"
            type="number"
            fullWidth
            value={form.usageLimit}
            onChange={handleChange}
            error={!!errors.usageLimit}
            helperText={errors.usageLimit}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Ngày bắt đầu"
            name="startDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.startDate}
            onChange={handleChange}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Ngày kết thúc"
            name="endDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.endDate}
            onChange={handleChange}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />
        </Grid>
      </Grid>

      <Box mt={3} textAlign="right">
        <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEditing ? "Cập nhật" : "Tạo"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
