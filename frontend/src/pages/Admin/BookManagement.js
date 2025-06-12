import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Switch,
  Grid,
  Snackbar,
  Alert,
  FormHelperText,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  MenuBook as MenuBookIcon,
  Person as AuthorIcon,
  LocalOffer as PriceIcon,
  Inventory as StockIcon,
} from "@mui/icons-material";
import TitleIcon from "@mui/icons-material/Title";
import axios from "axios";
import CategoryManagement from "./CategoryManagement";
import "./BookManagement.css";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    language: "",
    translator: "",
    publisher: "",
    publishDate: "",
    price: "",
    originalPrice: "",
    stock: "",
    isActivated: true,
    images: [],
    categories: [],
  });
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [errors, setErrors] = useState({});
  const [openCategoryManagement, setOpenCategoryManagement] = useState(false);
  const [categoryMode, setCategoryMode] = useState("add");

  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchBooks = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      const response = await axios.get("http://localhost:9999/admin/books", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (searchTerm || searchCategory) {
        const filteredBook = response.data.filter((book) => {
          const matchTitle = book.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchCategory =
            !searchCategory.length ||
            book.categories.some((cat) => searchCategory.includes(cat._id));
          return matchTitle && matchCategory;
        });
        setBooks(filteredBook);
      } else {
        setBooks(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy sách:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      const response = await axios.get(
        "http://localhost:9999/admin/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [searchTerm, searchCategory]);

  const handleOpenBookDialog = (book = null) => {
    setSelectedBook(book);
    if (book) {
      const formattedBook = {
        ...book,
        categories: book.categories.map((cat) => cat._id),
      };
      setFormData(formattedBook);
    } else {
      setFormData({
        title: "",
        author: "",
        genre: "",
        description: "",
        language: "",
        translator: "",
        publisher: "",
        publishDate: "",
        price: "",
        originalPrice: "",
        stock: "",
        isActivated: true,
        images: [],
        categories: [],
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({ ...prev, isActivated: e.target.checked }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.value.split(",") }));
  };

  const handleCategoryChange = (event) => {
    setFormData((prev) => ({ ...prev, categories: event.target.value }));

    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: null }));
    }
  };

  const handleOpenImageDialog = (images) => {
    setSelectedImages(images);
    setOpenImageDialog(true);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "title",
      "author",
      "genre",
      "description",
      "language",
      "publisher",
      "publishDate",
      "price",
      "stock",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        newErrors[field] = "Trường này không được để trống";
      } else if (formData[field] === "") {
        newErrors[field] = "Trường này không được để trống";
      }
    });

    if (formData.publishDate) {
      const publishDate = new Date(formData.publishDate);
      const today = new Date();

      if (publishDate > today) {
        newErrors.publishDate = "Ngày xuất bản không được là ngày ở tương lai";
      }
    }

    const numericFields = ["price", "originalPrice", "stock"];
    numericFields.forEach((field) => {
      if (formData[field] && parseFloat(formData[field]) < 0) {
        newErrors[field] = "Giá trị không được âm";
      }
    });

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "Vui lòng chọn ít nhất một danh mục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      handleAlert("Vui lòng kiểm tra lại thông tin sách", "error");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }

      if (selectedBook) {
        await axios.put(
          `http://localhost:9999/admin/books/${selectedBook._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        handleAlert("Sửa thông tin sách thành công", "success");
      } else {
        await axios.post("http://localhost:9999/admin/books", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        handleAlert("Thêm thông tin sách thành công", "success");
      }
      fetchBooks();
      setOpenDialog(false);
    } catch (error) {
      console.error("Lỗi khi lưu sách:", error);
      handleAlert("Có lỗi xảy ra khi lưu thông tin sách", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("Không tìm thấy token, vui lòng đăng nhập lại.");
        return;
      }
      await axios.delete(`http://localhost:9999/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((book) => book._id !== id));
      handleAlert("Xóa sách thành công", "error");
    } catch (error) {
      console.error("Lỗi khi xóa sách:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  const handleOpenCategoryManagement = (mode) => {
    setCategoryMode(mode);
    setOpenCategoryManagement(true);
  };

  return (
    <Box className="book-management-container">
      <Box className="book-management-header">
        <MenuBookIcon className="header-icon" />
        <Typography variant="h4" className="header-title">
          Quản lý Sách
        </Typography>
      </Box>
      <Box className="search-controls">
        <FormControl fullWidth variant="outlined">
          <InputLabel>Danh mục</InputLabel>
          <Select
            multiple
            value={searchCategory || []}
            onChange={(e) => setSearchCategory(e.target.value)}
            label="Danh mục"
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Tìm kiếm theo tên sách"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />

        <Button
          className="add-book-button"
          variant="contained"
          color="primary"
          onClick={() => handleOpenBookDialog()}
        >
          Thêm Sách
        </Button>
      </Box>
      <TableContainer component={Paper} className="book-table-container">
        <Table>
          <TableHead className="table-head">
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>
                <Box className="header-cell">
                  <ImageIcon fontSize="small" /> Hình ảnh
                </Box>
              </TableCell>
              <TableCell>
                <Box className="header-cell">
                  <TitleIcon fontSize="small" /> Tiêu đề
                </Box>
              </TableCell>
              <TableCell>
                <Box className="header-cell">
                  <AuthorIcon fontSize="small" /> Tác giả
                </Box>
              </TableCell>
              <TableCell>
                <Box className="header-cell">
                  <CategoryIcon fontSize="small" /> Danh mục
                </Box>
              </TableCell>
              <TableCell>
                <Box className="header-cell">
                  <PriceIcon fontSize="small" /> Giá
                </Box>
              </TableCell>
              <TableCell>
                <Box className="header-cell">
                  <StockIcon fontSize="small" /> Số lượng
                </Box>
              </TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((book, index) => (
                <TableRow key={book._id} className="table-row">
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    {book.images.length > 0 ? (
                      <Tooltip title="Xem tất cả ảnh">
                        <img
                          src={book.images[0]}
                          alt={book.title}
                          className="book-image"
                          onClick={() => handleOpenImageDialog(book.images)}
                        />
                      </Tooltip>
                    ) : (
                      <ImageIcon color="disabled" />
                    )}
                  </TableCell>
                  <TableCell className="book-title">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Box className="category-chips">
                      {book.categories.map((c) => (
                        <Chip
                          key={c._id}
                          label={c.name}
                          size="small"
                          className="category-chip"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{formatPrice(book.price)}</TableCell>
                  <TableCell>{book.stock}</TableCell>
                  <TableCell>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        onClick={() => handleOpenBookDialog(book)}
                        color="primary"
                        className="edit-button"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(book._id)}
                        className="delete-button"
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={books.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          className="pagination"
        />
      </TableContainer>

      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
        <DialogTitle>Hình ảnh sách</DialogTitle>
        <DialogContent>
          {selectedImages.map((image, index) => (
            <img key={index} src={image} alt="Book" className="dialog-image" />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        className="book-dialog"
      >
        <DialogTitle>
          {selectedBook ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiêu đề"
                name="title"
                value={formData.title}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
              <TextField
                fullWidth
                label="Tác giả"
                name="author"
                value={formData.author}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.author}
                helperText={errors.author}
                required
              />
              <TextField
                fullWidth
                label="Thể loại"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.genre}
                helperText={errors.genre}
                required
              />
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
              <TextField
                fullWidth
                label="Ngôn ngữ"
                name="language"
                value={formData.language}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.language}
                helperText={errors.language}
                required
              />
              <TextField
                fullWidth
                label="Người dịch"
                name="translator"
                value={formData.translator || "N/A"}
                onChange={handleChange}
                margin="dense"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Người xuất bản"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.publisher}
                helperText={errors.publisher}
                required
              />
              <TextField
                fullWidth
                label="Ngày Xuất Bản"
                name="publishDate"
                type="date"
                value={
                  formData.publishDate
                    ? new Date(formData.publishDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.publishDate}
                helperText={errors.publishDate}
                required
              />
              <TextField
                fullWidth
                label="Giá"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.price}
                helperText={errors.price}
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Giá gốc"
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.originalPrice}
                helperText={errors.originalPrice}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Số lượng"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                margin="dense"
                InputLabelProps={{ shrink: true }}
                error={!!errors.stock}
                helperText={errors.stock}
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="URL Ảnh (cách nhau bằng dấu phẩy)"
                name="images"
                value={formData.images.join(",")}
                onChange={handleImageChange}
                multiline
                rows={3}
                margin="dense"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                error={!!errors.categories}
                required
              >
                <InputLabel>Danh mục</InputLabel>
                <Select
                  multiple
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  label="Danh mục"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categories && (
                  <FormHelperText>{errors.categories}</FormHelperText>
                )}
              </FormControl>
              <Box mt={2} className="category-buttons">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleOpenCategoryManagement("add")}
                  sx={{ mr: 1 }}
                >
                  Thêm danh mục
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleOpenCategoryManagement("edit")}
                  sx={{ mr: 1 }}
                >
                  Sửa danh mục
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleOpenCategoryManagement("delete")}
                >
                  Xóa danh mục
                </Button>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <Typography>Kích hoạt</Typography>
                <Switch
                  checked={formData.isActivated}
                  onChange={handleSwitchChange}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <CategoryManagement
        open={openCategoryManagement}
        onClose={() => setOpenCategoryManagement(false)}
        categories={categories}
        setCategories={setCategories}
        mode={categoryMode}
        handleAlert={handleAlert}
        fetchCategories={fetchCategories}
      />
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        className="snackbar"
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookManagement;
