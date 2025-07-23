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
          <button
            className="primary-button"
            onClick={() => navigate("/")}
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
                <th>Ngày đặt</th>

                <th>Sản phẩm</th>
                <th>Tổng giá (₫)</th>
                <th>Mã vận đơn</th>
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
