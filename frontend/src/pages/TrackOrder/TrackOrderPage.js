import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getGhnTracking,
  getMyOrders,
  createPayment,
  cancelOrder,
} from "../../services/OrderService";
import "./TrackOrderPage.css";
import { returnOrder } from "../../services/GHNService";
import { Alert, Snackbar } from "@mui/material";

const TrackOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ghnTrackingMap, setGhnTrackingMap] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  const canReturnOrder = (tracking) => {
    if (!tracking) return false;

    const status = tracking.status?.toLowerCase() || "";
    const now = dayjs();

    if (status === "delivered") {
      const deliveredAt = tracking.delivered_time
        ? dayjs(tracking.delivered_time)
        : null;

      // Nếu có ngày giao hàng: chỉ không cho hoàn nếu đã quá 30 ngày
      if (deliveredAt) {
        return now.diff(deliveredAt, "day") <= 30;
      }

      // Nếu chưa có delivered_time (vừa giao xong, API chưa cập nhật), vẫn cho hoàn
      return true;
    }

    if (status === "waiting_to_return") {
      const waitingAt = tracking.waiting_to_return_at
        ? dayjs(tracking.waiting_to_return_at)
        : dayjs(tracking.updated_at); // fallback
      return now.diff(waitingAt, "hour") <= 72;
    }

    return false;
  };

  const handleReturnGHN = async (orderId) => {
    if (!window.confirm("Xác nhận hoàn đơn hàng này?")) return;

    try {
      const res = await returnOrder(orderId);
      alert("Đã gửi yêu cầu hoàn hàng thành công.");
      // Có thể gọi lại tracking để cập nhật UI
    } catch (err) {
      alert(err.response?.data?.message || "Không thể hoàn đơn.");
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const res = await getMyOrders();
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(list);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    const fetchTrackingStatuses = async () => {
      const map = {};
      for (const order of orders) {
        if (!order.trackingNumber) continue;
        try {
          const res = await getGhnTracking(order._id);
          map[order._id] = res;
        } catch (err) {
          console.error("GHN tracking error:", err);
        }
      }
      setGhnTrackingMap(map);
    };

    if (!isLoading && orders.length > 0) {
      fetchTrackingStatuses();
    }
  }, [isLoading, orders]);

  const calcTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="track-order-container">
      <div className="track-order-header">
        <h1>Đơn hàng của tôi</h1>
        <p className="track-order-subtitle">
          Xem trạng thái và chi tiết đơn hàng của bạn
        </p>
      </div>

      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <p className="empty-order-text">Bạn chưa có đơn hàng nào.</p>
          <button className="primary-button" onClick={() => navigate("/")}>
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày đặt</th>
                <th>Sản phẩm</th>
                <th>Tổng giá (₫)</th>
                <th>Mã vận đơn</th>
                <th>Hoàn đơn</th>
                <th>Thanh toán</th>
                <th>Hủy đơn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o._id}>
                  <td>{idx + 1}</td>
                  <td>{dayjs(o.createdAt).format("DD/MM/YYYY HH:mm")}</td>

                  <td className="product-cell">
                    {o.items.map((item, i) => {
                      const book = item.book;
                      if (!book) {
                        return (
                          <div
                            key={`${o._id}-missing-${i}`}
                            className="product-item"
                          >
                            <div className="product-left">
                              <img
                                src="/placeholder-book.png"
                                alt="Sản phẩm không tồn tại"
                                className="product-image"
                              />
                              <div className="product-info">
                                <p className="product-title">
                                  Sản phẩm đã bị xóa
                                </p>
                              </div>
                            </div>
                            <div className="product-right">
                              <p className="product-qty">x{item.quantity}</p>
                              <p className="product-price">
                                {item.price.toLocaleString()}₫
                              </p>
                            </div>
                          </div>
                        );
                      }

                      const imgUrl =
                        book.images?.[0] ||
                        "../../../public/placeholder-book.png";
                      return (
                        <div
                          key={`${o._id}-${book._id}`}
                          className="product-item"
                        >
                          <div className="product-left">
                            <img
                              src={imgUrl}
                              alt={book.title}
                              className="product-image"
                            />
                            <div className="product-info">
                              <p className="product-title">{book.title}</p>
                            </div>
                          </div>
                          <div className="product-right">
                            <p className="product-qty">x{item.quantity}</p>
                            <p className="product-price">
                              {item.price.toLocaleString()}₫
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </td>
                  <td>{calcTotal(o.items).toLocaleString()}₫</td>
                  <td>
                    {o.trackingNumber ? (
                      <a
                        href={`https://donhang.ghn.vn/?order_code=${o.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tracking-link"
                      >
                        {o.trackingNumber}
                        <span className="external-icon">↗</span>
                      </a>
                    ) : (
                      <span className="no-tracking2">Chưa có mã</span>
                    )}
                  </td>
                  <td>
                    {canReturnOrder(ghnTrackingMap[o._id]) ? (
                      <button
                        className="return-button"
                        onClick={() => handleReturnGHN(o._id)}
                      >
                        Hoàn đơn
                      </button>
                    ) : (
                      <span className="disabled-return">Không thể hoàn</span>
                    )}
                  </td>
                  <td>
                    {o.paymentMethod === "Online" &&
                    o.paymentStatus === "Pending" &&
                    o.orderStatus === "Pending" &&
                    new Date(o.expireAt) > new Date() ? (
                      <button
                        className="pay-now-button2"
                        onClick={async () => {
                          try {
                            localStorage.setItem("latestOrderId", o._id);
                            const res = await createPayment(o._id);
                            if (res.data.paymentUrl) {
                              window.location.href = res.data.paymentUrl;
                            }
                          } catch (err) {
                            alert("Không thể tạo thanh toán.");
                          }
                        }}
                      >
                        Thanh toán
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    {o.paymentStatus === "Pending" &&
                    o.orderStatus === "Pending" ? (
                      <button
                        className="cancel-order-button2"
                        onClick={() => {
                          setSelectedOrderId(o._id);
                          setShowCancelModal(true);
                        }}
                      >
                        Hủy
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>

                  {showCancelModal && (
                    <div className="custom-modal-overlay">
                      <div className="custom-modal">
                        <h3>Xác nhận hủy đơn hàng</h3>
                        <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
                        <div className="modal-actions">
                          <button
                            className="cancel-btn"
                            onClick={() => setShowCancelModal(false)}
                          >
                            Quay lại
                          </button>
                          <button
                            className="confirm-btn"
                            onClick={async () => {
                              setShowCancelModal(false);
                              try {
                                await cancelOrder(selectedOrderId);
                                setNotifications((prev) => [
                                  ...prev,
                                  {
                                    id: Date.now(),
                                    message: "Đơn hàng đã được hủy thành công.",
                                    severity: "success",
                                  },
                                ]);
                                window.location.reload();
                              } catch (err) {
                                setNotifications((prev) => [
                                  ...prev,
                                  {
                                    id: Date.now(),
                                    message: "Không thể hủy đơn hàng.",
                                    severity: "error",
                                  },
                                ]);
                              }
                            }}
                          >
                            Xác nhận hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <td>
                    <button
                      className="detail-button"
                      onClick={() => navigate(`/track-order/${o._id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() =>
            setNotifications((prev) =>
              prev.filter((n) => n.id !== notification.id)
            )
          }
        >
          <Alert
            severity={notification.severity || "info"}
            onClose={() =>
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              )
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

export default TrackOrderPage;
