import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormHelperText,
  Snackbar,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBook,
  getBookById,
  getCategories,
  updateBook,
} from "../../../services/AdminService/BookManagerService";

export default function BookFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
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
    isNewRelease: false,
    images: [],
    categories: [],
    cover: "hard",
    weight: "",
    dimensions: "",
    totalPage: "",
    minAge: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);

    if (isEdit) {
      getBookById(id)
        .then((b) => {
          setForm({
            title: b.title || "",
            author: b.author || "",
            genre: b.genre || "",
            description: b.description || "",
            language: b.language || "",
            translator: b.translator || "",
            publisher: b.publisher || "",
            publishDate: b.publishDate ? b.publishDate.split("T")[0] : "",
            price: b.price ?? "",
            originalPrice: b.originalPrice ?? "",
            stock: b.stock ?? "",
            isActivated: b.isActivated,
            isNewRelease: b.isNewRelease,
            images: b.images || [],
            categories: b.categories.map((c) => c._id),
            cover: b.cover || "hard",
            weight: b.weight ?? "",
            dimensions: b.dimensions || "",
            totalPage: b.totalPage ?? "",
            minAge: b.minAge ?? "",
          });
        })
        .catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : name === "images"
          ? value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : value,
    }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: null }));
  };

  const handleCategoriesChange = (e) => {
    setForm((f) => ({ ...f, categories: e.target.value }));
    if (errors.categories) setErrors((err) => ({ ...err, categories: null }));
  };

  const validate = () => {
    const err = {};
    ["title", "author", "genre", "description", "publisher"].forEach((f) => {
      if (!form[f]?.toString().trim()) err[f] = "Bắt buộc";
    });
    if (!form.publishDate) err.publishDate = "Bắt buộc";
    if (form.price === "" || form.price < 0) err.price = "Sai giá";
    if (form.stock === "" || form.stock < 0) err.stock = "Sai số lượng";
    if (!form.categories.length) err.categories = "Chọn ít nhất 1 danh mục";
    ["weight", "totalPage", "minAge"].forEach((f) => {
      if (form[f] !== "" && form[f] < 0) err[f] = "Không được âm";
    });
    setErrors(err);
    return !Object.keys(err).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { ...form };
      if (isEdit) {
        await updateBook(id, payload);
      } else {
        await createBook(payload);
      }
      setAlert({ open: true, message: "Lưu thành công", severity: "success" });
      setTimeout(() => navigate("/admin/books"), 1000);
    } catch (err) {
      console.error(err);
      setAlert({ open: true, message: "Lỗi khi lưu", severity: "error" });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, m: "auto" }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? "Chỉnh sửa sách" : "Thêm sách mới"}
      </Typography>
      <Grid container spacing={3.5}>
        <Grid>
          <TextField
            fullWidth
            label="Tiêu đề"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Tác giả"
            name="author"
            value={form.author}
            onChange={handleChange}
            error={!!errors.author}
            helperText={errors.author}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Thể loại"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            error={!!errors.genre}
            helperText={errors.genre}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Nhà xuất bản"
            name="publisher"
            value={form.publisher}
            onChange={handleChange}
            error={!!errors.publisher}
            helperText={errors.publisher}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Ngôn ngữ"
            name="language"
            value={form.language}
            onChange={handleChange}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Người dịch"
            name="translator"
            value={form.translator}
            onChange={handleChange}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            type="date"
            label="Ngày xuất bản"
            name="publishDate"
            InputLabelProps={{ shrink: true }}
            value={form.publishDate}
            onChange={handleChange}
            error={!!errors.publishDate}
            helperText={errors.publishDate}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            type="number"
            label="Giá"
            name="price"
            value={form.price}
            onChange={handleChange}
            error={!!errors.price}
            helperText={errors.price}
          />
        </Grid>

        <Grid>
          <TextField
            fullWidth
            type="number"
            label="Số lượng"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            error={!!errors.stock}
            helperText={errors.stock}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="number"
            label="Số trang"
            name="totalPage"
            value={form.totalPage}
            onChange={handleChange}
            error={!!errors.totalPage}
            helperText={errors.totalPage}
          />
        </Grid>
        <Grid>
          <FormControl fullWidth>
            <InputLabel>Loại bìa</InputLabel>
            <Select
              name="cover"
              value={form.cover}
              onChange={handleChange}
              label="Loại bìa"
            >
              <MenuItem value="hard">Cứng</MenuItem>
              <MenuItem value="soft">Mềm</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Kích thước (DxRxC)"
            name="dimensions"
            value={form.dimensions}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="Khối lượng (g)"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            error={!!errors.weight}
            helperText={errors.weight}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="Tuổi tối thiểu"
            name="minAge"
            value={form.minAge}
            onChange={handleChange}
            error={!!errors.minAge}
            helperText={errors.minAge}
          />
        </Grid>
        <Grid>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              multiple
              name="categories"
              value={form.categories}
              onChange={handleCategoriesChange}
              label="Danh mục"
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categories && (
              <FormHelperText>{errors.categories}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="URLs ảnh"
            name="images"
            value={form.images.join(",")}
            onChange={handleChange}
          />
        </Grid>
        <Grid>
          <Box display="flex" alignItems="center">
            <Switch
              checked={form.isActivated}
              onChange={handleChange}
              name="isActivated"
            />
            <Typography ml={1}>Kích hoạt</Typography>
          </Box>
        </Grid>
        <Grid>
          <Box display="flex" alignItems="center">
            <Switch
              checked={form.isNewRelease}
              onChange={handleChange}
              name="isNewRelease"
            />
            <Typography ml={1}>Mới phát hành</Typography>
          </Box>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
        <Button sx={{ ml: 2 }} onClick={() => navigate("/admin/books")}>
          Hủy
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert((a) => ({ ...a, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
