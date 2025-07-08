import React, { useState, useEffect } from "react";
import {
  ReportProblem,
  History,
  Send,
  Cancel,
  Login,
  Feedback,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./ComplaintPage.css";
import {
  cancelComplaint,
  getComplaints,
  getProfile,
  submitComplaint,
} from "../../services/UserService";

const ComplaintPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState({ type: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ name: decoded.name || "Tài khoản" });
      } catch (err) {
        console.error("Token không hợp lệ:", err);
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getProfile();
        if (res.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          fetchComplaints();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        navigate("/account/login");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const res = await getComplaints();
      const sorted = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComplaints(sorted);
    } catch {
      setError("Không thể tải phản ánh");
      setShowSnackbar(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.description.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      setShowSnackbar(true);
      return;
    }

    try {
      await submitComplaint(formData);
      setFormData({ type: "", description: "" });
      setSuccess("Phản ánh đã được gửi thành công!");
      fetchComplaints();
    } catch (err) {
      console.error("Lỗi khi gửi phản ánh:", err);
      setError("Không thể gửi phản ánh. Vui lòng thử lại sau.");
    } finally {
      setShowSnackbar(true);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelComplaint(id);
      setSuccess("Đã hủy phản ánh thành công!");
      fetchComplaints();
    } catch (err) {
      console.error("Lỗi khi hủy phản ánh:", err);
      setError("Không thể hủy phản ánh. Vui lòng thử lại sau.");
    } finally {
      setShowSnackbar(true);
    }
  };

  const formatDate = (str) =>
    new Date(str).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang chờ xử lý":
        return "#f57c00";
      case "Đã tiếp nhận":
        return "#2196f3";
      case "Đã giải quyết":
        return "#4caf50";
      case "Đã hủy":
        return "#f44336";
      default:
        return "#757575";
    }
  };

  if (isLoading) return <div className="container">Loading...</div>;

  if (!isAuthenticated)
    return (
      <div className="container">
        <div className="card">
          <h2 className="title">
            <Login style={{ color: "#1976d2" }} /> Vui lòng đăng nhập
          </h2>
          <p>Bạn cần đăng nhập để gửi phản ánh</p>
          <Link to="/account/login" className="button">
            Đăng nhập
          </Link>
        </div>
      </div>
    );

  return (
    <div className="container">
      <h1 className="title">
        <Feedback style={{ color: "#1976d2" }} /> Phản ánh khiếu nại
      </h1>

      <div className="grid">
        <div className="left">
          <div className="card">
            <h3 className="title">
              <ReportProblem style={{ color: "#f57c00" }} /> Gửi phản ánh
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Loại phản ánh</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn --</option>
                  <option value="Web">Website</option>
                  <option value="Đơn hàng">Đơn hàng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nội dung phản ánh</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <p>
                Sau khi gửi, chúng tôi sẽ liên hệ bạn qua email. Cảm ơn bạn đã
                góp ý!
              </p>

              <button type="submit" className="button">
                <Send fontSize="small" /> Gửi phản ánh
              </button>
            </form>
          </div>
        </div>

        <div className="right">
          <div className="card">
            <h3 className="title">
              <History style={{ color: "#2196f3" }} /> Lịch sử phản ánh
            </h3>
            {complaints.length > 0 ? (
              complaints.map((item) => (
                <div key={item._id} className="card">
                  <div className="status-row">
                    <strong>{item.type}</strong>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(item.status)}20`,
                        color: getStatusColor(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p>{formatDate(item.createdAt)}</p>
                  <p>{item.description}</p>
                  {item.status === "Đang chờ xử lý" && (
                    <button
                      className="button"
                      style={{ backgroundColor: "#f44336" }}
                      onClick={() => handleCancel(item._id)}
                    >
                      <Cancel fontSize="small" /> Hủy phản ánh
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>Bạn chưa có phản ánh nào.</p>
            )}
          </div>
        </div>
      </div>

      {showSnackbar && (
        <div
          className={`snackbar ${error ? "error" : "success"}`}
          onClick={() => setShowSnackbar(false)}
        >
          {error || success}
        </div>
      )}
    </div>
  );
};

export default ComplaintPage;
