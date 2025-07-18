import React, { useState, useEffect, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./reviews.css";
import {
  createReview,
  deleteReview,
  getAllReviews,
  updateReview,
} from "../../../services/AdminService/reviewService";
import { getBooks } from "../../../services/AdminService/bookService";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    bookId: "",
    content: "",
    images: [],
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  const quillModules = {
    toolbar: [
      [{ font: [] }, { header: [1, 2, 3, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ align: [] }],
      ["clean"],
    ],
  };
  const quillFormats = [
    "font",
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "align",
    "clean",
  ];

  useEffect(() => {
    fetchBooks();
    fetchReviews();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch {
      alert("Không thể tải sách.");
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch {
      alert("Không thể tải reviews.");
    }
  };

  const bookMap = useMemo(() => {
    const m = {};
    books.forEach((b) => (m[b._id] = b.title));
    return m;
  }, [books]);

  // handle change cho cả form và editForm
  const handleFormChange = (field) => (eOrHtml) => {
    if (field === "content") {
      setForm((p) => ({ ...p, content: eOrHtml }));
    } else {
      const { name, value, files } = eOrHtml.target;
      if (name === "images") {
        setForm((p) => ({ ...p, images: files }));
      } else {
        setForm((p) => ({ ...p, [name]: value }));
      }
    }
  };
  const handleEditChange = (field) => (eOrHtml) => {
    if (field === "content") {
      setEditForm((p) => ({ ...p, content: eOrHtml }));
    } else {
      const { name, value } = eOrHtml.target;
      setEditForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "images") {
          Array.from(v).forEach((f) => fd.append("images", f));
        } else {
          fd.append(k, v);
        }
      });
      await createReview(fd);
      setForm({ title: "", bookId: "", content: "", images: [] });
      setShowCreateForm(false);
      fetchReviews();
    } catch {
      alert("Tạo thất bại.");
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({ title: r.title, content: r.content });
  };
  const cancelEdit = () => setEditingId(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateReview(editingId, {
        title: editForm.title,
        content: editForm.content,
      });
      setEditingId(null);
      fetchReviews();
    } catch {
      alert("Cập nhật thất bại.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xoá?")) return;
    await deleteReview(id);
    setReviews((p) => p.filter((r) => r._id !== id));
  };

  return (
    <div className="admin-reviews">
      <h1>Quản lý Reviews</h1>

      <button
        className="btn-add-review"
        onClick={() => setShowCreateForm((v) => !v)}
      >
        {showCreateForm ? "Huỷ tạo" : "Thêm Review"}
      </button>

      {showCreateForm && (
        <form className="review-card edit" onSubmit={handleCreate}>
          <h2>Tạo Review mới</h2>
          <input
            type="text"
            name="title"
            placeholder="Tiêu đề"
            value={form.title}
            onChange={handleFormChange("title")}
            required
          />
          <select
            name="bookId"
            value={form.bookId}
            onChange={handleFormChange("bookId")}
            required
          >
            <option value="">-- Chọn sách --</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>
                {b.title}
              </option>
            ))}
          </select>

          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={handleFormChange("content")}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Nội dung (HTML)…"
            />
          </div>

          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFormChange("images")}
          />

          <div className="actions">
            <button type="submit">Lưu</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>
              Huỷ
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {reviews.map((r) => {
          const bookIdVal =
            r.bookId &&
            (typeof r.bookId === "object" ? r.bookId._id : r.bookId);
          const bookTitle =
            (r.bookId && r.bookId.title) || bookMap[bookIdVal] || "Unknown";

          if (editingId === r._id) {
            return (
              <form
                key={r._id}
                className="review-card edit"
                onSubmit={handleEditSubmit}
              >
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange("title")}
                  required
                />

                <div className="quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={editForm.content}
                    onChange={handleEditChange("content")}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>

                <div className="actions">
                  <button type="submit">Lưu</button>
                  <button type="button" onClick={cancelEdit}>
                    Huỷ
                  </button>
                </div>
              </form>
            );
          }

          return (
            <div className="review-card" key={r._id}>
              <div className="review-header">
                <h2>{r.title}</h2>
                <span className="review-meta">Book: {bookTitle}</span>
              </div>
              <div
                className="review-content"
                dangerouslySetInnerHTML={{ __html: r.content }}
              />
              {Array.isArray(r.images) && r.images.length > 0 && (
                <div className="review-images">
                  {r.images.map((url, i) => (
                    <img key={i} src={url} alt={`img-${i}`} />
                  ))}
                </div>
              )}
              <div className="review-footer">
                <span>Created: {new Date(r.createdAt).toLocaleString()}</span>
                <div className="actions">
                  <button onClick={() => startEdit(r)}>Sửa</button>
                  <button onClick={() => handleDelete(r._id)}>Xoá</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
