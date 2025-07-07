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
  const [loading, setLoading] = useState(true);

  // Lấy chi tiết đơn 1 lần
  useEffect(() => {
    (async () => {
      try {
        const res = await getOrderDetails(orderId);
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // Poll GHN
  useEffect(() => {
    if (!orderId) return;
    let timer;

    const fetchTracking = async () => {
      try {
        const res = await getTrackingDetails(orderId);
        setTracking(res.data.data);
        // nếu đã giao/hủy thì dừng polling
        if (["delivered", "returned", "cancel"].includes(res.data.data.status))
          clearInterval(timer);
      } catch (err) {
        console.error("Failed to fetch tracking details:", err);
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

  const code = order.trackingNumber;

  // Xác định class cho trạng thái đơn hàng
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
    const statusMap = {
      ready_to_pick: "Đã tạo đơn, chờ lấy hàng",
      picking: "Shipper đang đến lấy hàng",
      money_collect_picking: "Đang xử lý với người gửi",
      picked: "Đã lấy hàng",
      storing: "Hàng đang được chuyển đến kho GHN",
      transporting: "Hàng đang được luân chuyển",
      sorting: "Hàng đang được phân loại tại kho",
      delivering: "Đang giao hàng",
      money_collect_delivering: "Đang xử lý với người nhận",
      delivered: "Giao hàng thành công",
      delivery_fail: "Giao hàng không thành công",
      waiting_to_return: "Đang chờ giao lại (24/48h)",
      return: "Giao thất bại, đang chờ hoàn về",
      return_transporting: "Hàng hoàn đang trên đường về",
      cancel: "Đơn hàng đã bị hủy",
    };
    return statusMap[status] || "Đang xử lý";
  };

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h2>Chi tiết đơn hàng #{order._id}</h2>
        <p className="order-date">
          Ngày đặt: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
        </p>
      </div>

      <div className="order-detail-grid">
        {/* Thông tin đơn hàng */}
        <div className="order-info-card">
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
                    {code} <span className="external-link-icon">↗</span>
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
              <div className="status-main">
                <p className="status-name">{getStatusText(tracking.status)}</p>
                <p className="status-update">
                  Cập nhật:{" "}
                  {dayjs(tracking.updated_date).format("HH:mm DD/MM/YYYY")}
                </p>
              </div>
              {tracking.warehouse && (
                <div className="status-location">
                  <span className="location-icon">📍</span>
                  <span>{tracking.warehouse}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="tracking-loading">
              <p>Đang tải trạng thái vận chuyển...</p>
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm */}
        <div className="order-items-card">
          <h3 className="card-title">Sản phẩm đã đặt</h3>
          <div className="items-header">
            <span>Sản phẩm</span>
            <span>Số lượng</span>
            <span>Giá</span>
          </div>
          <div className="items-list">
            {order.items.map((item) => (
              <div key={item._id} className="order-item">
                <div className="item-info">
                  <span className="item-title">{item.book.title}</span>
                </div>
                <div className="item-quantity">x{item.quantity}</div>
                <div className="item-price">
                  {item.price.toLocaleString()} ₫
                </div>
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
    </div>
  );
};

export default OrderDetailPage;
