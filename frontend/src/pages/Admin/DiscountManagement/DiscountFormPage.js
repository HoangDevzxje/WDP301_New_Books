import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parseISO, format } from "date-fns";
import viLocale from "date-fns/locale/vi";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BookIcon from "@mui/icons-material/Book";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

import {
  createDiscount,
  getBooks,
  getDiscountById,
  removeBookFromDiscount,
  updateDiscount,
  updateDiscountProducts,
} from "../../../services/AdminService/discountService";

import "./DiscountFormPage.css";

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

  const [selectedBooks, setSelectedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [tempSelectedBooks, setTempSelectedBooks] = useState([]);
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadBooks();
  }, []);

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
          if (d.productIds?.length) {
            const chosen = allBooks.filter((b) => d.productIds.includes(b._id));
            setSelectedBooks(chosen);
          }
        })
        .catch(() => openSnackbar("Lỗi khi tải thông tin", "error"));
    }
  }, [id, allBooks]);

  const loadBooks = async () => {
    try {
      const books = await getBooks();
      setAllBooks(books);
    } catch {
      openSnackbar("Lỗi khi tải danh sách sách", "error");
    }
  };

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

    if (!form.minPurchase || form.minPurchase <= 0)
      errs.minPurchase = "Phải > 0";
    if (!form.usageLimit || form.usageLimit < 1) errs.usageLimit = "Phải ≥ 1";

    if (!form.startDate) errs.startDate = "Chọn ngày bắt đầu";
    else if (sd < today) errs.startDate = "Không được trong quá khứ";

    if (!form.endDate) errs.endDate = "Chọn ngày kết thúc";
    else if (ed <= sd) errs.endDate = "Phải sau ngày bắt đầu";

    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      ...form,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase),
      usageLimit: Number(form.usageLimit),
      productIds: selectedBooks.map((b) => b._id),
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
      openSnackbar(e.response?.data?.message || "Lỗi server", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const handleDateChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const handleOpenBookDialog = () => {
    setTempSelectedBooks([...selectedBooks]);
    setBookDialogOpen(true);
  };

  const handleCloseBookDialog = () => {
    setBookDialogOpen(false);
    setBookSearchTerm("");
  };

  const handleConfirmBookSelection = async () => {
    if (isEditing) {
      try {
        const ids = tempSelectedBooks.map((b) => b._id);
        await updateDiscountProducts(id, ids);
        setSelectedBooks([...tempSelectedBooks]);
        openSnackbar("Cập nhật danh sách sách thành công");
      } catch {
        openSnackbar("Lỗi khi cập nhật danh sách sách", "error");
      }
    } else {
      setSelectedBooks([...tempSelectedBooks]);
    }
    handleCloseBookDialog();
  };

  const handleToggleBookSelection = (book) => {
    setTempSelectedBooks((prev) =>
      prev.some((b) => b._id === book._id)
        ? prev.filter((b) => b._id !== book._id)
        : [...prev, book]
    );
  };

  const handleRemoveBook = async (book) => {
    if (isEditing) {
      try {
        await removeBookFromDiscount(id, book._id);
        setSelectedBooks((prev) => prev.filter((b) => b._id !== book._id));
        openSnackbar("Xóa sách thành công");
      } catch {
        openSnackbar("Lỗi khi xóa sách", "error");
      }
    } else {
      setSelectedBooks((prev) => prev.filter((b) => b._id !== book._id));
    }
  };

  const openSnackbar = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const filteredBooks = allBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const getSnackbarIcon = (severity) => {
    switch (severity) {
      case "success":
        return <CheckIcon />;
      case "error":
        return <ErrorIcon />;
      case "warning":
        return <WarningIcon />;
      case "info":
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <div className="discount-container">
      <h2 className="discount-title">
        {isEditing ? "Chỉnh sửa mã giảm giá" : "Tạo mới mã giảm giá"}
      </h2>

      <div className="discount-grid">
        <div className="discount-form-group">
          <label className="discount-label">Mã</label>
          <input
            className={`discount-input ${errors.code ? "error" : ""}`}
            name="code"
            value={form.code}
            onChange={handleChange}
            disabled={isEditing}
          />
          {errors.code && <span className="discount-error">{errors.code}</span>}
        </div>

        <div className="discount-form-group">
          <label className="discount-label">Loại</label>
          <select
            className={`discount-select ${errors.type ? "error" : ""}`}
            name="type"
            value={form.type}
            onChange={handleChange}
            disabled={isEditing}
          >
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Cố định</option>
          </select>
          {errors.type && <span className="discount-error">{errors.type}</span>}
        </div>

        <div className="discount-form-group">
          <label className="discount-label">Giá trị</label>
          <input
            className={`discount-input ${errors.value ? "error" : ""}`}
            name="value"
            type="number"
            value={form.value}
            onChange={handleChange}
          />
          {errors.value && (
            <span className="discount-error">{errors.value}</span>
          )}
        </div>

        <div className="discount-form-group">
          <label className="discount-label">Giá trị đơn hàng tối thiểu</label>
          <input
            className={`discount-input ${errors.minPurchase ? "error" : ""}`}
            name="minPurchase"
            type="number"
            value={form.minPurchase}
            onChange={handleChange}
          />
          {errors.minPurchase && (
            <span className="discount-error">{errors.minPurchase}</span>
          )}
        </div>

        <div className="discount-form-group">
          <label className="discount-label">Giới hạn sử dụng</label>
          <input
            className={`discount-input ${errors.usageLimit ? "error" : ""}`}
            name="usageLimit"
            type="number"
            value={form.usageLimit}
            onChange={handleChange}
          />
          {errors.usageLimit && (
            <span className="discount-error">{errors.usageLimit}</span>
          )}
        </div>

        <div className="discount-form-group">
          <label className="discount-label">Ngày bắt đầu</label>
          <input
            className={`discount-input ${errors.startDate ? "error" : ""}`}
            type="date"
            value={form.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
          />
          {errors.startDate && (
            <span className="discount-error">{errors.startDate}</span>
          )}
        </div>

        <div className="discount-form-group">
          <label className="discount-label">Ngày kết thúc</label>
          <input
            className={`discount-input ${errors.endDate ? "error" : ""}`}
            type="date"
            value={form.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
          />
          {errors.endDate && (
            <span className="discount-error">{errors.endDate}</span>
          )}
        </div>
      </div>

      <div className="discount-book-section">
        <h3 className="discount-book-title">
          Sách áp dụng giảm giá ({selectedBooks.length} sách)
        </h3>
        <button className="discount-btn-outline" onClick={handleOpenBookDialog}>
          <AddIcon className="discount-btn-icon" />
          Chọn sách
        </button>
      </div>

      {selectedBooks.length === 0 ? (
        <p className="discount-empty-text">
          Chưa chọn sách nào. Mã giảm giá sẽ áp dụng cho toàn bộ sản phẩm.
        </p>
      ) : (
        <div className="discount-chip-wrapper">
          {selectedBooks.map((b) => (
            <div key={b._id} className="discount-chip">
              <div className="discount-chip-avatar">
                <BookIcon />
              </div>
              <span className="discount-chip-label">
                {b.title} - {b.author}
              </span>
              <button
                className="discount-chip-delete"
                onClick={() => handleRemoveBook(b)}
              >
                <DeleteIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="discount-actions">
        <button className="discount-btn-secondary" onClick={() => navigate(-1)}>
          Hủy
        </button>
        <button className="discount-btn-primary" onClick={handleSubmit}>
          {isEditing ? "Cập nhật" : "Tạo"}
        </button>
      </div>

      {/* Dialog */}
      {bookDialogOpen && (
        <div className="discount-dialog-overlay">
          <div className="discount-dialog">
            <div className="discount-dialog-header">
              <h3>Chọn sách áp dụng giảm giá</h3>
              <button
                className="discount-dialog-close"
                onClick={handleCloseBookDialog}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="discount-dialog-content">
              <input
                className="discount-search-input"
                placeholder="Tìm sách theo tên hoặc tác giả…"
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
              />

              <div className="discount-dialog-list">
                {filteredBooks.map((book) => {
                  const isSelected = tempSelectedBooks.some(
                    (b) => b._id === book._id
                  );
                  return (
                    <div
                      key={book._id}
                      className="discount-dialog-item"
                      onClick={() => handleToggleBookSelection(book)}
                    >
                      <div className="discount-dialog-item-content">
                        <div className="discount-dialog-item-title">
                          {book.title}
                        </div>
                        <div className="discount-dialog-item-subtitle">
                          Tác giả: {book.author} — Giá:{" "}
                          {book.price?.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="discount-checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleBookSelection(book)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  );
                })}
                {filteredBooks.length === 0 && (
                  <p className="discount-dialog-empty">
                    Không tìm thấy sách nào
                  </p>
                )}
              </div>
            </div>

            <div className="discount-dialog-actions">
              <button
                className="discount-btn-secondary"
                onClick={handleCloseBookDialog}
              >
                Hủy
              </button>
              <button
                className="discount-btn-primary"
                onClick={handleConfirmBookSelection}
              >
                Xác nhận ({tempSelectedBooks.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`discount-snackbar ${snackbar.severity}`}>
          <div className="discount-snackbar-content">
            <span className="discount-snackbar-icon">
              {getSnackbarIcon(snackbar.severity)}
            </span>
            <span className="discount-snackbar-message">
              {snackbar.message}
            </span>
            <button className="discount-snackbar-close" onClick={closeSnackbar}>
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
