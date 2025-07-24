import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Tooltip,
  TablePagination,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import {
  deleteBook,
  getBooks,
} from "../../../services/AdminService/bookService";
import { getCategories } from "../../../services/AdminService/categoryService";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() =>
        setAlert({
          open: true,
          message: "Lấy danh mục thất bại",
          severity: "error",
        })
      );
    getBooks()
      .then(setBooks)
      .catch(() =>
        setAlert({
          open: true,
          message: "Lấy sách thất bại",
          severity: "error",
        })
      );
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa sách này?")) return;
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setAlert({ open: true, message: "Xóa thành công", severity: "success" });
    } catch {
      setAlert({ open: true, message: "Xóa thất bại", severity: "error" });
    }
  };

  const filtered = books.filter((b) => {
    const matchTitle = b.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat =
      !searchCategory ||
      b.categories.some(
        (c) => (typeof c === "object" ? c._id : c) === searchCategory
      );
    return matchTitle && matchCat;
  });

  const visible = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h4">Quản lý Sách</Typography>
        <Button variant="contained" onClick={() => navigate("add")}>
          Thêm sách
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          backgroundColor: "#fff",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <TextField
          size="small"
          label="Tìm theo tên sách"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            label="Danh mục"
            value={searchCategory}
            onChange={(e) => {
              setSearchCategory(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                "STT",
                "Ảnh",
                "Tiêu đề",
                "Tác giả",
                "Danh mục",
                "Giá",
                "Số lượng",
                "Hành động",
              ].map((h, i) => (
                <TableCell
                  key={i}
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align={h === "Hành động" ? "right" : "left"}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {visible.map((book, idx) => (
              <TableRow
                key={book._id}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>
                  {book.images?.[0] ? (
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <ImageIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  {book.categories.map((c) => {
                    const id = typeof c === "object" ? c._id : c;
                    const cat = categories.find((x) => x._id === id);
                    return (
                      <Chip
                        key={id}
                        label={cat?.name || id}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    );
                  })}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN").format(book.price)} VNĐ
                </TableCell>
                <TableCell>{book.stock}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Chỉnh sửa">
                    <IconButton onClick={() => navigate(`${book._id}/edit`)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(book._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
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
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontWeight: 500,
              },
          }}
        />
      </TableContainer>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert((a) => ({ ...a, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}
