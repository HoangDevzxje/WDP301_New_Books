import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getOrderDetails } from "../../services/OrderService";
import { getTrackingDetails } from "../../services/GHNService";
import "./OrderDetailPage.css";

const POLL_INTERVAL = 15000; // 15 giây

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingLoading, setIsTrackingLoading] = useState(true);

  // Lấy chi tiết đơn 1 lần
  useEffect(() => {
    (async () => {
      try {
        const res = await getOrderDetails(orderId);
        setOrder(res.data);
        console.log("Order details:", res.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId]);

  // Poll GHN
  useEffect(() => {
    if (!orderId) return;
    let timer;

    const fetchTracking = async () => {
      try {
        setIsTrackingLoading(true);
        const res = await getTrackingDetails(orderId);
        setTracking(res.data.data);
        // nếu đã giao/hủy thì dừng polling
        if (
          ["delivered", "returned", "cancel"].includes(res.data.data.status)
        ) {
          clearInterval(timer);
        }
      } catch (err) {
        console.error("Error fetching tracking details:", err);
      } finally {
        setIsTrackingLoading(false);
      }
    };

    fetchTracking();
    timer = setInterval(fetchTracking, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <img src="/images/error.svg" alt="Error" className="error-image" />
        <h3>Không tìm thấy đơn hàng</h3>
        <p>Đơn hàng bạn yêu cầu không tồn tại hoặc đã bị hủy</p>
      </div>
    );
  }

  const code = order.trackingNumber;

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h1>Chi tiết đơn hàng</h1>
        <p className="order-id">Mã đơn hàng: #{order._id}</p>
      </div>

      <div className="order-info-card">
        <h2 className="card-title">Thông tin đơn hàng</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Ngày đặt:</span>
            <span className="info-value">
              {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Phương thức thanh toán:</span>
            <span
              className={`info-value payment-method ${order.paymentMethod.toLowerCase()}`}
            >
              {order.paymentMethod}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Trạng thái thanh toán:</span>
            <span
              className={`info-value payment-status ${order.paymentStatus.toLowerCase()}`}
            >
              {order.paymentStatus}
            </span>
          </div>
          {code && (
            <div className="info-item">
              <span className="info-label">Mã vận đơn:</span>
              <span className="info-value">
                <a
                  href={`https://donhang.ghn.vn/?order_code=${code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tracking-link"
                >
                  {code}
                  <span className="external-icon">↗</span>
                </a>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`tracking-status-card ${tracking?.status || "default"}`}>
        <h2 className="card-title">Trạng thái vận chuyển</h2>
        {isTrackingLoading ? (
          <div className="tracking-loading">
            <div className="small-spinner"></div>
            <span>Đang cập nhật trạng thái...</span>
          </div>
        ) : tracking ? (
          <div className="tracking-details">
            <div className="status-main">
              <div className="status-icon">
                {getStatusIcon(tracking.status)}
              </div>
              <div>
                <h3 className="status-title">{tracking.status_name}</h3>
                <p className="status-time">
                  Cập nhật:{" "}
                  {dayjs(tracking.updated_date).format("HH:mm DD/MM/YYYY")}
                </p>
              </div>
            </div>
            {tracking.warehouse && (
              <div className="warehouse-info">
                <span className="info-label">Vị trí hiện tại:</span>
                <span className="info-value">{tracking.warehouse}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="no-tracking">Không có thông tin vận chuyển</p>
        )}
      </div>

      <div className="products-card">
        <h2 className="card-title">Sản phẩm</h2>
        <div className="products-list">
          {order.items.map((it) => (
            <div key={it._id} className="product-item">
              <div className="product-info">
                <img
                  src={it.book.images || ""}
                  alt={it.book.title}
                  className="product-image"
                />
                <div className="product-details">
                  <h3 className="product-title">{it.book.title}</h3>
                  <p className="product-author">{it.book.author}</p>
                </div>
              </div>
              <div className="product-quantity">x{it.quantity}</div>
              <div className="product-price">{it.price.toLocaleString()} ₫</div>
            </div>
          ))}
        </div>
        <div className="order-total">
          <span>Tổng cộng:</span>
          <span className="total-amount">
            {order.items
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toLocaleString()}{" "}
            ₫
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case "delivered":
      return "✓";
    case "returned":
    case "cancel":
      return "✕";
    default:
      return "↝";
  }
};

export default OrderDetailPage;
