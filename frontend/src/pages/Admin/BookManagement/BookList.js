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

import "./BookList.css";
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
      .catch((err) => {
        console.error(err);
        setAlert({
          open: true,
          message: "Lấy danh mục thất bại",
          severity: "error",
        });
      });

    getBooks()
      .then(setBooks)
      .catch((err) => {
        console.error(err);
        setAlert({
          open: true,
          message: "Lấy sách thất bại",
          severity: "error",
        });
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa sách này?")) return;
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setAlert({ open: true, message: "Xóa thành công", severity: "success" });
    } catch (err) {
      console.error(err);
      setAlert({ open: true, message: "Xóa thất bại", severity: "error" });
    }
  };

  const filtered = books.filter((book) => {
    const matchTitle = book.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCat =
      !searchCategory ||
      book.categories.some((c) => {
        const id = typeof c === "object" ? c._id : c;
        return id === searchCategory;
      });
    return matchTitle && matchCat;
  });
  const visible = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box className="book-management-container">
      <Box
        className="book-management-header"
        sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
      >
        <Typography variant="h4">Quản lý Sách</Typography>
      </Box>

      <Box className="search-controls" sx={{ mb: 2, display: "flex", gap: 2 }}>
        <TextField
          label="Tìm theo tên sách"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
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
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("add")}
        >
          Thêm sách
        </Button>
      </Box>

      <TableContainer component={Paper} className="book-table-container">
        <Table>
          <TableHead className="table-head">
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visible.map((book, idx) => (
              <TableRow key={book._id}>
                <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                <TableCell>
                  {book.images?.length > 0 ? (
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="book-thumb"
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
                      <Chip key={id} label={cat?.name ?? id} size="small" />
                    );
                  })}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN").format(book.price)} VNĐ
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
