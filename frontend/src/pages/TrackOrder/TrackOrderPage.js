import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getMyOrders } from "../../services/OrderService";
import "./TrackOrderPage.css";

const TrackOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="track-order-container">
      <div className="track-order-header">
        <h1>Theo dõi đơn hàng</h1>
        <p className="track-order-subtitle">
          Xem trạng thái và chi tiết đơn hàng của bạn
        </p>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <img
            src="/images/empty-order.svg"
            alt="No orders"
            className="empty-order-image"
          />
          <p className="empty-order-text">Bạn chưa có đơn hàng nào.</p>
          <button
            className="primary-button"
            onClick={() => navigate("/products")}
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày tạo</th>
                <th>Phương thức</th>
                <th>Mã vận đơn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o._id}>
                  <td>{idx + 1}</td>
                  <td>{dayjs(o.createdAt).format("DD/MM/YYYY HH:mm")}</td>
                  <td>
                    <span
                      className={`payment-method ${o.paymentMethod.toLowerCase()}`}
                    >
                      {o.paymentMethod}
                    </span>
                  </td>
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
                      <span className="no-tracking">Chưa có mã</span>
                    )}
                  </td>
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
    </div>
  );
};

export default TrackOrderPage;
