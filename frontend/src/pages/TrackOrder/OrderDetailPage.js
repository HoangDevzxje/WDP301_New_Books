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

const POLL_INTERVAL = 15000;

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

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

  return (
    <div className="order-detail-container">
      <button className="back-button" onClick={() => navigate("/track-order")}>
        ← Quay lại
      </button>

      <div className="order-detail-header">
        <h2>Chi tiết đơn hàng</h2>
        <h3 className="order-date">
          Ngày đặt: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
        </h3>
      </div>
      <div className="order-detail-grid">
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

        {/* Thông tin đơn & vận đơn */}
        <div className="order-info-card">
          <h3 className="card-title">Thông tin đơn hàng</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">PT thanh toán:</span>
              <span className="info-value">{order.paymentMethod}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái TT:</span>
              <span
                className={`info-value payment-status-${order.paymentStatus.toLowerCase()}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái đơn hàng:</span>
              <span
                className={`info-value payment-status-${order.orderStatus.toLowerCase()}`}
              >
                {order.orderStatus}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="info-item">
                <span className="info-label">Mã vận đơn:</span>
                <span className="info-value">
                  <a
                    href={`https://donhang.ghn.vn/?order_code=${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracking-link"
                  >
                    {order.trackingNumber}
                    <span className="external-link-icon">↗</span>
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Trạng thái vận chuyển */}
        <div className={`tracking-status-card ${getStatusClass()}`}>
          <h3 className="card-title">Trạng thái vận chuyển</h3>
          {tracking ? (
            <div className="tracking-details">
              <p className="status-name">{getStatusText(tracking.status)}</p>
              <p className="status-update">
                Cập nhật:{" "}
                {dayjs(tracking.updated_date).format("HH:mm DD/MM/YYYY")}
              </p>
              {tracking.warehouse && (
                <p className="status-location">📍 {tracking.warehouse}</p>
              )}
            </div>
          ) : (
            <div className="tracking-loading">
              <p>Chưa có mã vận đơn.</p>
            </div>
          )}
        </div>

        {/* Thông tin giao hàng */}
        <div className="shipping-info-card">
          <h3 className="card-title">Thông tin giao hàng</h3>
          <p>
            <strong>Người nhận:</strong> {order.shippingInfo.name}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {order.shippingInfo.address},{" "}
            {order.shippingInfo.wardName}, {order.shippingInfo.districtName},{" "}
            {order.shippingInfo.provineName}
          </p>
          <p>
            <strong>Điện thoại:</strong> {order.shippingInfo.phoneNumber}
          </p>
          {order.shippingInfo.note && (
            <p>
              <strong>Ghi chú:</strong> {order.shippingInfo.note}
            </p>
          )}
        </div>

        {/* Danh sách sản phẩm */}
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
                    className="detail-product-image"
                  />
                  <span className="item-title">Sản phẩm đã bị xóa</span>
                </div>
                <div className="item-quantity">x{item.quantity}</div>
                <div className="item-price">
                  {(item.price * item.quantity).toLocaleString()} ₫
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
                  className="detail-product-image"
                />
                <span className="item-title">{book.title}</span>
              </div>
              <div className="item-quantity">x{item.quantity}</div>
              <div className="item-price">
                {(item.price * item.quantity).toLocaleString()} ₫
              </div>
            </div>
          );
        })}
        {/* Action buttons */}
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
                onClick={async () => {
                  if (!window.confirm("Xác nhận hủy đơn hàng này?")) return;
                  try {
                    await cancelOrder(order._id);
                    alert("Đã hủy đơn hàng.");
                    navigate("/track-order"); // hoặc reload lại trang
                  } catch (err) {
                    alert("Không thể hủy đơn. Vui lòng thử lại.");
                  }
                }}
              >
                Hủy đơn hàng
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
