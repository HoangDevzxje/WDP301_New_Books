import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  getOrderDetails,
  createPayment,
  cancelOrder,
} from "../../services/OrderService";
import { getTrackingDetails } from "../../services/GHNService";
import "./OrderDetailPage.css";
import { Alert, Snackbar } from "@mui/material";

const POLL_INTERVAL = 15000;

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getOrderDetails(orderId);
        const o = res.data?.data ?? res.data;
        setOrder(o);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    let timer;
    const fetchTracking = async () => {
      try {
        const res = await getTrackingDetails(orderId);
        const t = res.data?.data;
        setTracking(t);
        if (["delivered", "returned", "cancel"].includes(t.status)) {
          clearInterval(timer);
        }
      } catch (err) {
        console.error("Failed fetching tracking:", err);
      }
    };
    fetchTracking();
    timer = setInterval(fetchTracking, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="order-detail-error">
        <p>Không tìm thấy thông tin đơn hàng</p>
      </div>
    );
  }

  const calcTotal = () =>
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getStatusClass = () => {
    if (!tracking) return "tracking-status-default";
    switch (tracking.status) {
      case "delivered":
        return "tracking-status-success";
      case "cancel":
      case "returned":
        return "tracking-status-error";
      default:
        return "tracking-status-info";
    }
  };

  const getStatusText = (status) => {
    const map = {
      ready_to_pick: "Đã tạo đơn, chờ lấy hàng",
      picking: "Shipper đang đến lấy hàng",
      picked: "Đã lấy hàng",
      transporting: "Đang luân chuyển",
      delivering: "Đang giao hàng",
      delivered: "Giao hàng thành công",
      cancel: "Đơn đã hủy",
    };
    return map[status] || "Đang xử lý";
  };

  const shippingFee = order.shippingInfo?.fee || 0;
  const subtotal = calcTotal();
  const finalTotal = subtotal + shippingFee;

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h2>Chi tiết đơn hàng</h2>
        <h3 className="order-date">
          Ngày đặt: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
        </h3>
      </div>

      {order.paymentMethod === "Online" &&
        order.paymentStatus === "Pending" &&
        order.orderStatus === "Pending" &&
        new Date(order.expireAt) > new Date() && (
          <div className="order-warning-banner">
            <p className="order-warning-text">
              Đơn hàng của bạn vẫn đang chờ thanh toán. Vui lòng hoàn tất
              thanh toán trước{" "}
              <strong>
                {dayjs(order.expireAt).format("HH:mm DD/MM/YYYY")}
              </strong>{" "}
              để tránh bị hủy tự động.
            </p>
          </div>
        )}

      <div className="top-row">
        <div className="order-info-card2">
          <h3 className="card-title">Thông tin đơn hàng</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Phương thức thanh toán:</span>
              <span className="info-value">{order.paymentMethod}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái thanh toán:</span>
              <span
                className={`info-value payment-status-${order.paymentStatus.toLowerCase()}`}
              >
                {order.paymentStatus === "Completed" ? "Đã thanh toán" : 
                 order.paymentStatus === "Pending" ? "Chờ thanh toán" : 
                 order.paymentStatus}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái đơn hàng:</span>
              <span
                className={`info-value order-status-${order.orderStatus.toLowerCase()}`}
              >
                {order.orderStatus === "Pending" ? "Chờ xử lý" :
                 order.orderStatus === "Confirmed" ? "Đã xác nhận" :
                 order.orderStatus === "Shipped" ? "Đã giao vận" :
                 order.orderStatus === "Delivered" ? "Đã giao hàng" :
                 order.orderStatus}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Mã vận đơn:</span>
              <span className="info-value">
                {order.trackingNumber ? (
                  <a
                    href={`https://donhang.ghn.vn/?order_code=${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracking-link"
                  >
                    {order.trackingNumber}
                    <span className="external-link-icon">↗</span>
                  </a>
                ) : (
                  <span className="no-tracking">Chưa có mã vận đơn</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="shipping-info-card">
          <h3 className="card-title">Thông tin giao hàng</h3>
          <div className="shipping-details">
            <div className="recipient-info">
              <div className="info-row">
                <span className="info-label">Người nhận:</span>
                <span className="info-value">{order.shippingInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Điện thoại:</span>
                <span className="info-value">{order.shippingInfo.phoneNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa chỉ giao hàng:</span>
                <span className="info-value">  {order.shippingInfo.address}, {order.shippingInfo.wardName}, {order.shippingInfo.districtName}, {order.shippingInfo.provineName}</span>
              </div>
            </div>
            {order.shippingInfo.note && (
              <div className="info-row">
                <span className="info-label">Ghi chú:</span>
                <span className="info-value">{order.shippingInfo.note}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`tracking-status-card ${getStatusClass()}`}>
          <h3 className="card-title">Trạng thái vận chuyển</h3>
          {tracking ? (
            <div className="tracking-details">
              <div className="status-icon">
                {tracking.status === "delivered" ? "✅" :
                 tracking.status === "cancel" ? "❌" :
                 tracking.status === "transporting" ? "🚚" :
                 tracking.status === "delivering" ? "📦" : "⏳"}
              </div>
              <p className="status-name">{getStatusText(tracking.status)}</p>
              <p className="status-update">
                Cập nhật lúc: {dayjs(tracking.updated_date).format("HH:mm DD/MM/YYYY")}
              </p>
              {tracking.warehouse && (
                <p className="status-location"> {tracking.warehouse}</p>
              )}
            </div>
          ) : (
            <div className="tracking-pending">
              <div className="status-icon">⏳</div>
              <p className="status-name">Chờ đơn hàng được xác nhận</p>
              <p className="status-description">
                Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ cập nhật trạng thái vận chuyển sớm nhất.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-row">
        <div className="order-items-card">
          <h3 className="card-title">Sách trong đơn hàng</h3>
          <div className="items-list">
            {order.items.map((item, i) => {
              const book = item.book;
              const img = book?.images?.[0] || "/placeholder-book.png";

              if (!book) {
                return (
                  <div key={`missing-${i}`} className="order-item">
                    <div className="item-info">
                      <img
                        src={img}
                        alt="Sản phẩm đã bị xóa"
                        className="product-image"
                      />
                      <div className="item-details">
                        <span className="item-title">Sản phẩm đã bị xóa</span>
                      </div>
                    </div>
                    <div className="item-quantity">x{item.quantity}</div>
                    <div className="item-price">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                );
              }

              return (
                <div key={book._id} className="order-item">
                  <div className="item-info">
                    <img
                      src={img}
                      alt={book.title}
                      className="product-image"
                    />
                    <div className="item-details">
                      <span className="item-title">{book.title}</span>
                      <span className="item-price-single">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                  <div className="item-quantity">x{item.quantity}</div>
                  <div className="item-price">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span className="summary-label">Tạm tính:</span>
              <span className="summary-value">{subtotal.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phí vận chuyển:</span>
              <span className="summary-value">{shippingFee.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="summary-row total-row">
              <span className="summary-label2">Tổng cộng:</span>
              <span className="summary-value total-amount">{finalTotal.toLocaleString("vi-VN")} ₫</span>
            </div>
          </div>
        </div>

        
      </div>

      {order.paymentMethod === "Online" &&
        order.paymentStatus === "Pending" &&
        order.orderStatus === "Pending" &&
        new Date(order.expireAt) > new Date() && (
          <div className="order-action-buttons">
            <button
              className="pay-now-button"
              onClick={async () => {
                try {
                  localStorage.setItem("latestOrderId", order._id);
                  const res = await createPayment(order._id);
                  if (res.data.paymentUrl) {
                    window.location.href = res.data.paymentUrl;
                  } else {
                    alert("Không thể tạo liên kết thanh toán.");
                  }
                } catch (err) {
                  alert("Lỗi khi tạo thanh toán.");
                }
              }}
            >
              Thanh toán ngay
            </button>
          </div>
        )}

      {order.orderStatus === "Pending" &&
        order.paymentStatus === "Pending" && (
          <div className="order-action-buttons">
            <button
              className="cancel-order-button"
              onClick={() => {
              setSelectedOrderId(order._id);
              setShowCancelModal(true);
              }}
            >
              Hủy
            </button>
          </div>
        )}

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
                                  }
                                ]);
                                window.location.reload();
                              } catch (err) {
                                setNotifications((prev) => [
                                  ...prev,
                                  {
                                    id: Date.now(),
                                    message: "Không thể hủy đơn hàng.",
                                    severity: "error",
                                  }
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

        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            onClose={() => setNotifications(prev =>
              prev.filter(n => n.id !== notification.id)
            )}
          >
            <Alert
              severity={notification.severity || 'info'}
              onClose={() => setNotifications(prev =>
              prev.filter(n => n.id !== notification.id)
              )}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
    </div>
  );
}