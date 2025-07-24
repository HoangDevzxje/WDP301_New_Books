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
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [expanded, setExpanded] = useState({});
  const [fullScreenContent, setFullScreenContent] = useState(null);

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

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const showFullScreen = (review) => {
    setFullScreenContent(review);
  };

  const closeFullScreen = () => {
    setFullScreenContent(null);
  };

  const filteredReviews = reviews.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-reviews">
      <h1>Quản lý Blog</h1>

      <div className="controls">
        <button
          className="btn-add-review"
          onClick={() => setShowCreateForm((v) => !v)}
        >
          {showCreateForm ? "Hủy tạo" : "Tạo bài viết"}
        </button>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showCreateForm && (
        <form className="review-card edit" onSubmit={handleCreate}>
          <h2>Tạo bài viết mới</h2>
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

          <div className="form-actions">
            <button type="submit" className="btn-save">
              Lưu
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowCreateForm(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {editingId && (
        <div className="edit-overlay">
          <form className="edit-form-modal" onSubmit={handleEditSubmit}>
            <h2>Chỉnh sửa bài viết</h2>
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

            <div className="form-actions">
              <button type="submit" className="btn-save">
                Lưu
              </button>
              <button type="button" className="btn-cancel" onClick={cancelEdit}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full Screen Content Modal */}
      {fullScreenContent && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-content">
            <div className="fullscreen-header">
              <h2>{fullScreenContent.title}</h2>
              <button className="btn-close" onClick={closeFullScreen}>
                ×
              </button>
            </div>
            <div className="fullscreen-body">
              <div
                className="fullscreen-html-content"
                dangerouslySetInnerHTML={{
                  __html: fullScreenContent.content || "",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="reviews-table-container">
        <table className="reviews-table">
          <thead className="reviews-table-header">
            <tr>
              <th>STT</th>
              <th>Sách</th>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((r, idx) => {
              const isExpanded = !!expanded[r._id];
              const plainText = r.content
                ? r.content.replace(/<[^>]*>/g, "")
                : "";
              const preview =
                plainText.length > 100
                  ? plainText.substring(0, 100) + "..."
                  : plainText;

              const bookIdVal =
                r.bookId && typeof r.bookId === "object"
                  ? r.bookId._id
                  : r.bookId;
              const bookTitle =
                (r.bookId && r.bookId.title) ||
                bookMap[bookIdVal] ||
                "Không rõ";

              return (
                <tr key={r._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="book-title">{bookTitle}</div>
                  </td>
                  <td>
                    {Array.isArray(r.images) && r.images.length > 0 ? (
                      <div className="review-images-preview">
                        <img src={r.images[0]} alt="Main" />
                        {r.images.length > 1 && (
                          <span className="images-count">
                            +{r.images.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-image">Không có ảnh</span>
                    )}
                  </td>
                  <td>
                    <div className="review-title-large">{r.title}</div>
                  </td>
                  <td>
                    {isExpanded ? (
                      <div
                        className="review-content-full"
                        dangerouslySetInnerHTML={{ __html: r.content || "" }}
                      />
                    ) : (
                      <div className="review-content-preview">{preview}</div>
                    )}
                    {plainText.length > 100 && (
                      <div className="content-actions">
                        <button
                          className="btn-fullscreen"
                          onClick={() => showFullScreen(r)}
                        >
                          Xem thêm
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn btn-edit"
                        onClick={() => startEdit(r)}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(r._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredReviews.length === 0 && (
          <div className="no-reviews">
            Chưa có bài viết nào. Nhấn "Tạo bài viết" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  );
}
