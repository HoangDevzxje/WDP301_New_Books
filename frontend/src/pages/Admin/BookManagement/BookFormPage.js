import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBook,
  getBookById,
  updateBook,
} from "../../../services/AdminService/bookService";
import { getCategories } from "../../../services/AdminService/categoryService";
import "./BookFormPage.css";

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
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setForm((f) => ({ ...f, categories: selectedOptions }));
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
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "images") {
          if (value instanceof FileList || Array.isArray(value)) {
            Array.from(value).forEach((file) => {
              formData.append("images", file);
            });
          }
        } else if (key === "categories") {
          formData.append("categories", JSON.stringify(value));
        } else {
          formData.append(key, value ?? "");
        }
      });

      // Gọi API
      if (isEdit) {
        await updateBook(id, formData);
      } else {
        await createBook(formData);
      }

      setAlert({ open: true, message: "Lưu thành công", severity: "success" });
      setTimeout(() => navigate("/admin/books"), 1000);
    } catch (err) {
      console.error(err);
      setAlert({ open: true, message: "Lỗi khi lưu", severity: "error" });
    }
  };

  return (
    <div className="book-form-container">
      <div className="book-form-paper">
        <h2 className="book-form-title">
          {isEdit ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </h2>

        <div className="book-form-grid">
          {/* Thông tin cơ bản */}
          <div className="form-group">
            <label htmlFor="title">Tiêu đề</label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="author">Tác giả</label>
            <input
              type="text"
              id="author"
              name="author"
              value={form.author}
              onChange={handleChange}
              className={errors.author ? "error" : ""}
            />
            {errors.author && (
              <span className="error-text">{errors.author}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="genre">Thể loại</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              className={errors.genre ? "error" : ""}
            />
            {errors.genre && <span className="error-text">{errors.genre}</span>}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={1}
              className={errors.description ? "error" : ""}
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          {/* Thông tin xuất bản */}
          <div className="form-group">
            <label htmlFor="publisher">Nhà xuất bản</label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={form.publisher}
              onChange={handleChange}
              className={errors.publisher ? "error" : ""}
            />
            {errors.publisher && (
              <span className="error-text">{errors.publisher}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="publishDate">Ngày xuất bản</label>
            <input
              type="date"
              id="publishDate"
              name="publishDate"
              value={form.publishDate}
              onChange={handleChange}
              className={errors.publishDate ? "error" : ""}
            />
            {errors.publishDate && (
              <span className="error-text">{errors.publishDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="language">Ngôn ngữ</label>
            <input
              type="text"
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="translator">Người dịch</label>
            <input
              type="text"
              id="translator"
              name="translator"
              value={form.translator}
              onChange={handleChange}
            />
          </div>

          {/* Thông tin giá và kho */}
          <div className="form-group">
            <label htmlFor="price">Giá bán</label>
            <input
              type="number"
              id="price"
              name="price"
              value={form.price}
              onChange={handleChange}
              className={errors.price ? "error" : ""}
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="originalPrice">Giá gốc</label>
            <input
              type="number"
              id="originalPrice"
              name="originalPrice"
              value={form.originalPrice}
              onChange={handleChange}
              className={errors.originalPrice ? "error" : ""}
            />
            {errors.originalPrice && (
              <span className="error-text">{errors.originalPrice}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="stock">Số lượng tồn kho</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className={errors.stock ? "error" : ""}
            />
            {errors.stock && <span className="error-text">{errors.stock}</span>}
          </div>

          {/* Thông tin vật lý */}
          <div className="form-group">
            <label htmlFor="totalPage">Số trang</label>
            <input
              type="number"
              id="totalPage"
              name="totalPage"
              value={form.totalPage}
              onChange={handleChange}
              className={errors.totalPage ? "error" : ""}
            />
            {errors.totalPage && (
              <span className="error-text">{errors.totalPage}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cover">Loại bìa</label>
            <select
              id="cover"
              name="cover"
              value={form.cover}
              onChange={handleChange}
            >
              <option value="hard">Bìa cứng</option>
              <option value="soft">Bìa mềm</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="weight">Khối lượng (g)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className={errors.weight ? "error" : ""}
            />
            {errors.weight && (
              <span className="error-text">{errors.weight}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dimensions">Kích thước (DxRxC)</label>
            <input
              type="text"
              id="dimensions"
              name="dimensions"
              value={form.dimensions}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="minAge">Độ tuổi phù hợp</label>
            <input
              type="number"
              id="minAge"
              name="minAge"
              value={form.minAge}
              onChange={handleChange}
              className={errors.minAge ? "error" : ""}
            />
            {errors.minAge && (
              <span className="error-text">{errors.minAge}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="categories">Danh mục</label>
            <select
              id="categories"
              name="categories"
              multiple
              value={form.categories}
              onChange={handleCategoriesChange}
              className={errors.categories ? "error" : ""}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categories && (
              <span className="error-text">{errors.categories}</span>
            )}
          </div>

          <div className="form-group form-group-full">
            <label>Ảnh bìa sách</label>

            {Array.isArray(form.images) &&
              typeof form.images[0] === "string" &&
              form.images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Ảnh ${idx}`}
                  className="preview-image"
                />
              ))}

            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={(e) =>
                setForm((f) => ({ ...f, images: e.target.files }))
              }
              className="file-input"
            />
            <span className="helper-text">
              Bạn có thể chọn nhiều ảnh. Nếu chọn ảnh mới, ảnh cũ sẽ bị thay
              thế.
            </span>
          </div>

          <div className="switches-container">
            <label className="switch-label">
              <input
                type="checkbox"
                name="isActivated"
                checked={form.isActivated}
                onChange={handleChange}
                className="switch-input"
              />
              <span className="switch-slider"></span>
              Kích hoạt
            </label>

            <label className="switch-label">
              <input
                type="checkbox"
                name="isNewRelease"
                checked={form.isNewRelease}
                onChange={handleChange}
                className="switch-input"
              />
              <span className="switch-slider"></span>
              Mới phát hành
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Lưu
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/books")}
          >
            Hủy
          </button>
        </div>

        {alert.open && (
          <div className={`alert alert-${alert.severity}`}>
            <span>{alert.message}</span>
            <button
              className="alert-close"
              onClick={() => setAlert((a) => ({ ...a, open: false }))}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
