import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../services/AdminService/categoryService";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editedName, setEditedName] = useState("");
  const [nameError, setNameError] = useState("");

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      handleAlert("Lỗi tải danh mục", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };
  const closeAlert = () => setAlert((a) => ({ ...a, open: false }));

  const openMode = (m, id = "") => {
    setMode(m);
    setSelectedCategory(id);
    setOpenDialog(true);
    setCategoryName("");
    setEditedName("");
    setNameError("");
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setNameError("");
  };

  const checkDuplicate = (name) =>
    categories.some(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() &&
        (mode !== "edit" || c._id !== selectedCategory)
    );

  const validate = (name) => {
    if (!name.trim()) return "Tên không được để trống";
    if (name.trim().length < 2) return "Phải ít nhất 2 ký tự";
    if (name.trim().length > 50) return "Không quá 50 ký tự";
    if (checkDuplicate(name)) return "Tên đã tồn tại";
    return "";
  };

  const handleAdd = async () => {
    const err = validate(categoryName);
    if (err) return setNameError(err);
    try {
      await createCategory(categoryName.trim());
      handleAlert("Thêm thành công", "success");
      fetchCategories();
      closeDialog();
    } catch {
      handleAlert("Lỗi thêm danh mục", "error");
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return handleAlert("Chọn danh mục trước", "warning");
    const err = validate(editedName);
    if (err) return setNameError(err);
    try {
      await updateCategory(selectedCategory, editedName.trim());
      handleAlert("Cập nhật thành công", "success");
      fetchCategories();
      closeDialog();
    } catch {
      handleAlert("Lỗi cập nhật", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return handleAlert("Chọn danh mục trước", "warning");
    try {
      await deleteCategory(selectedCategory);
      handleAlert("Xóa thành công", "success");
      fetchCategories();
      closeDialog();
    } catch {
      handleAlert("Lỗi xóa", "error");
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Quản lý danh mục</Typography>
        <Button variant="contained" onClick={() => openMode("add")}>
          Thêm danh mục
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: "#313E4E",
              }}
            >
              <TableCell sx={{ color: "white" }}>Tên</TableCell>
              <TableCell align="right" sx={{ color: "white" }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => openMode("edit", c._id)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openMode("delete", c._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {mode === "add"
            ? "Thêm danh mục"
            : mode === "edit"
            ? "Sửa danh mục"
            : "Xóa danh mục"}
        </DialogTitle>
        <DialogContent>
          {mode === "add" && (
            <TextField
              fullWidth
              label="Tên danh mục"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setNameError(validate(e.target.value));
              }}
              margin="dense"
              error={!!nameError}
              helperText={nameError}
            />
          )}

          {mode === "edit" && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Chọn danh mục</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Chọn danh mục"
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tên mới"
                value={editedName}
                onChange={(e) => {
                  setEditedName(e.target.value);
                  setNameError(validate(e.target.value));
                }}
                margin="dense"
                error={!!nameError}
                helperText={nameError}
                disabled={!selectedCategory}
              />
            </>
          )}

          {mode === "delete" && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Chọn để xóa</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Chọn để xóa"
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          {mode === "add" && (
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!categoryName.trim() || !!nameError}
            >
              Thêm
            </Button>
          )}
          {mode === "edit" && (
            <Button
              variant="contained"
              onClick={handleEdit}
              disabled={!selectedCategory || !editedName.trim() || !!nameError}
            >
              Cập nhật
            </Button>
          )}
          {mode === "delete" && (
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={!selectedCategory}
            >
              Xóa
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity} onClose={closeAlert}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
