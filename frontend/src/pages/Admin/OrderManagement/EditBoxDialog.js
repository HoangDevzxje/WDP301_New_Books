import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";

const EditBoxDialog = ({ open, order, onClose, onSave }) => {
  const [boxInfo, setBoxInfo] = useState({
    weight: "",
    length: "",
    width: "",
    height: "",
  });
  const [errors, setErrors] = useState({
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  useEffect(() => {
    if (open && order) {
      setBoxInfo({
        weight: order.boxInfo?.weight?.toString() || "",
        length: order.boxInfo?.length?.toString() || "",
        width: order.boxInfo?.width?.toString() || "",
        height: order.boxInfo?.height?.toString() || "",
      });
      setErrors({ weight: "", length: "", width: "", height: "" });
    }
  }, [open, order]);

  const validateField = (name, value) => {
    if (value === "") return "Không được để trống";
    const num = Number(value);
    if (isNaN(num)) return "Phải là số";
    if (num < 0) return "Không được nhỏ hơn 0";
    if (!Number.isInteger(num)) return "Phải là số nguyên";
    return "";
  };

  const handleChange = ({ target: { name, value } }) => {
    setBoxInfo((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = () => {
    const newErr = Object.fromEntries(
      Object.entries(boxInfo).map(([k, v]) => [k, validateField(k, v)])
    );
    setErrors(newErr);
    if (Object.values(newErr).some((msg) => msg)) return;

    // convert to integers
    const payload = {
      weight: parseInt(boxInfo.weight, 10),
      length: parseInt(boxInfo.length, 10),
      width: parseInt(boxInfo.width, 10),
      height: parseInt(boxInfo.height, 10),
    };
    onSave(payload);
    onClose();
  };

  const isValid = () =>
    Object.values(boxInfo).every((v) => v !== "") &&
    Object.values(errors).every((e) => !e);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa thông tin đóng gói</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {["weight", "length", "width", "height"].map((field, idx) => (
            <Grid key={field} item xs={6}>
              <TextField
                name={field}
                label={
                  {
                    weight: "Cân nặng (g)",
                    length: "Chiều dài (cm)",
                    width: "Chiều rộng (cm)",
                    height: "Chiều cao (cm)",
                  }[field]
                }
                type="number"
                fullWidth
                value={boxInfo[field]}
                onChange={handleChange}
                error={!!errors[field]}
                helperText={errors[field]}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={!isValid()}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default EditBoxDialog;
