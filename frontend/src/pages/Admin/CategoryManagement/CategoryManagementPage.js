import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../services/AdminService/categoryService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [dialog, setDialog] = useState({ open: false, mode: "add", id: "" });
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchAll = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      showAlert("Lỗi tải danh mục", "error");
    }
  };

  // Sửa ở đây: bọc fetchAll vào callback, không để useEffect trả về Promise
  useEffect(() => {
    fetchAll();
  }, []);

  const showAlert = (msg, sev = "info") =>
    setAlert({ open: true, message: msg, severity: sev });
  const closeAlert = () => setAlert((a) => ({ ...a, open: false }));

  const open = (mode, id = "") => {
    setDialog({ open: true, mode, id });
    setName(
      mode === "edit" ? categories.find((c) => c._id === id)?.name || "" : ""
    );
    setError("");
  };
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const validate = (v) => {
    if (!v.trim()) return "Trống không hợp lệ";
    if (v.trim().length < 2) return "Phải ≥2 ký tự";
    if (v.trim().length > 50) return "≤50 ký tự";
    if (
      categories.some(
        (c) =>
          c.name.toLowerCase() === v.trim().toLowerCase() &&
          !(dialog.mode === "edit" && c._id === dialog.id)
      )
    )
      return "Đã tồn tại";
    return "";
  };

  const handleSave = async () => {
    const err = validate(name);
    if (err) return setError(err);
    try {
      if (dialog.mode === "add") await createCategory(name.trim());
      else if (dialog.mode === "edit")
        await updateCategory(dialog.id, name.trim());
      else if (dialog.mode === "delete") await deleteCategory(dialog.id);

      showAlert(
        dialog.mode === "add"
          ? "Thêm thành công"
          : dialog.mode === "edit"
          ? "Cập nhật thành công"
          : "Xóa thành công",
        "success"
      );
      fetchAll();
      closeDialog();
    } catch {
      showAlert("Lỗi thao tác", "error");
    }
  };

  return (
    <Box maxWidth={1200} mx="auto" p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Quản lý danh mục</Typography>
        <Button variant="contained" onClick={() => open("add")}>
          Thêm danh mục
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Tên</TableCell>
              <TableCell align="right" sx={{ color: "#fff", fontWeight: 700 }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((c) => (
                <TableRow
                  key={c._id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell>{c.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => open("edit", c._id)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => open("delete", c._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={categories.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              { fontWeight: 500 },
          }}
        />
      </TableContainer>

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialog.mode === "add"
            ? "Thêm danh mục"
            : dialog.mode === "edit"
            ? "Sửa danh mục"
            : "Xóa danh mục"}
        </DialogTitle>
        <DialogContent>
          {(dialog.mode === "add" || dialog.mode === "edit") && (
            <TextField
              fullWidth
              label="Tên"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(validate(e.target.value));
              }}
              margin="dense"
              error={!!error}
              helperText={error}
            />
          )}
          {dialog.mode === "delete" && (
            <Typography>Bạn có chắc muốn xóa mục này không?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button
            variant="contained"
            color={dialog.mode === "delete" ? "error" : "primary"}
            onClick={handleSave}
            disabled={dialog.mode !== "delete" && (!name.trim() || !!error)}
          >
            {dialog.mode === "add"
              ? "Thêm"
              : dialog.mode === "edit"
              ? "Cập nhật"
              : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
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
