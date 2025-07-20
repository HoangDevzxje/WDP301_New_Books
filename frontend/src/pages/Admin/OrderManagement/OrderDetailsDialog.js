import React, { Component } from "react";
import "./OrderDetailsDialog.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

class OrderDetailsDialog extends Component {
  calculateSubtotal = () => {
    const { order } = this.props;
    return order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  calculateTotal = () => {
    const { order } = this.props;
    const subtotal = this.calculateSubtotal();
    let discount = 0;

    // Discount code
    if (order.discountUsed) {
      if (order.discountUsed.type === "fixed") {
        discount += order.discountUsed.value;
      } else if (order.discountUsed.type === "percentage") {
        discount += (subtotal * order.discountUsed.value) / 100;
      }
    }

    // Points used
    if (order.pointUsed) {
      discount += order.pointUsed;
    }

    const shippingFee = order.shippingInfo.fee || 0;
    return subtotal - discount + shippingFee;
  };

  getDiscountAmount = () => {
    const { order } = this.props;
    if (!order.discountUsed) return 0;
    const subtotal = this.calculateSubtotal();
    return order.discountUsed.type === "fixed"
      ? order.discountUsed.value
      : (subtotal * order.discountUsed.value) / 100;
  };

  getPaymentStatusClass = (status) => {
    return status === "Pending" ? "chip chip-warning" : "chip chip-success";
  };

  getOrderStatusClass = (status) => {
    if (status === "Pending") return "chip chip-warning";
    if (status === "Processing") return "chip chip-info";
    return "chip chip-error";
  };

  render() {
    const { open, order, onClose } = this.props;

    if (!open || !order) return null;

    return (
      <div className="dialog-overlay">
        <div className="dialog">
          <div className="dialog-header">
            <h2 className="dialog-title">Chi tiết đơn hàng</h2>
          </div>

          <div className="dialog-content">
            <div className="grid">
              {/* Thông tin khách hàng */}
              <div className="grid-item">
                <h3 className="section-title">Thông tin khách hàng</h3>
                <div className="info-item">
                  <strong>Tên:</strong> {order.user?.name || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {order.user?.email || "N/A"}
                </div>
              </div>

              {/* Thông tin vận chuyển */}
              <div className="grid-item">
                <h3 className="section-title">Thông tin vận chuyển</h3>
                {order.trackingNumber && (
                  <div className="info-item">
                    <strong>Mã vận đơn:</strong> {order.trackingNumber}
                  </div>
                )}
                <div className="info-item">
                  <strong>Địa chỉ:</strong> {order.shippingInfo.address}
                </div>
                <div className="info-item">
                  <strong>Tỉnh/TP:</strong> {order.shippingInfo.provineName}
                </div>
                <div className="info-item">
                  <strong>Quận/Huyện:</strong> {order.shippingInfo.districtName}
                </div>
                <div className="info-item">
                  <strong>Phường/Xã:</strong> {order.shippingInfo.wardName}
                </div>
                <div className="info-item">
                  <strong>SĐT:</strong> {order.shippingInfo.phoneNumber}
                </div>
                {order.shippingInfo.note && (
                  <div className="info-item">
                    <strong>Ghi chú:</strong> {order.shippingInfo.note}
                  </div>
                )}
                <div className="info-item">
                  <strong>Phí ship:</strong>{" "}
                  {(order.shippingInfo.fee || 0).toLocaleString("vi-VN")} VNĐ
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="grid-item">
                <h3 className="section-title">Thông tin thanh toán</h3>
                <div className="info-item">
                  <strong>Phương thức:</strong>{" "}
                  {order.paymentMethod === "COD" ? "COD" : "Online"}
                </div>
                <div className="info-item">
                  <strong>Trạng thái thanh toán:</strong>{" "}
                  <span
                    className={this.getPaymentStatusClass(order.paymentStatus)}
                  >
                    {order.paymentStatus === "Pending"
                      ? "Chưa thanh toán"
                      : "Đã thanh toán"}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Trạng thái đơn hàng:</strong>{" "}
                  <span className={this.getOrderStatusClass(order.orderStatus)}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Thông tin đơn hàng */}
              <div className="grid-item">
                <h3 className="section-title">Thông tin đơn hàng</h3>
                <div className="info-item">
                  <strong>Ngày đặt:</strong> {formatDate(order.createdAt)}
                </div>
                <div className="info-item">
                  <strong>Tổng tiền:</strong>{" "}
                  {this.calculateTotal().toLocaleString("vi-VN")} VNĐ
                </div>
                {order.boxInfo && (
                  <>
                    <div className="info-item">
                      <strong>Kích thước (L×W×H):</strong>{" "}
                      {order.boxInfo.length}×{order.boxInfo.width}×
                      {order.boxInfo.height} cm
                    </div>
                    <div className="info-item">
                      <strong>Cân nặng:</strong> {order.boxInfo.weight} gram
                    </div>
                  </>
                )}
              </div>

              {/* Danh sách sản phẩm */}
              <div className="grid-item full-width">
                <h3 className="section-title">Danh sách sản phẩm</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.book?.title || "N/A"}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price.toLocaleString("vi-VN")} VNĐ</td>
                          <td>
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </td>
                        </tr>
                      ))}

                      {/* Tổng tiền sản phẩm */}
                      <tr className="summary-row">
                        <td colSpan="3" className="text-right">
                          <strong>Tổng tiền sản phẩm:</strong>
                        </td>
                        <td>
                          <strong>
                            {this.calculateSubtotal().toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </strong>
                        </td>
                      </tr>

                      {/* Phí ship */}
                      <tr className="summary-row">
                        <td colSpan="3" className="text-right">
                          <strong>Phí vận chuyển:</strong>
                        </td>
                        <td>
                          <strong>
                            {(order.shippingInfo.fee || 0).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VNĐ
                          </strong>
                        </td>
                      </tr>

                      {/* Giảm giá mã */}
                      {order.discountUsed && this.getDiscountAmount() > 0 && (
                        <tr className="summary-row">
                          <td colSpan="3" className="text-right">
                            <strong>
                              Giảm giá mã{" "}
                              {order.discountUsed.type === "percentage"
                                ? `(${order.discountUsed.value}%)`
                                : ""}
                              :
                            </strong>
                          </td>
                          <td className="discount-amount">
                            <strong>
                              -
                              {this.getDiscountAmount().toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </strong>
                          </td>
                        </tr>
                      )}

                      {/* Điểm sử dụng */}
                      {order.pointUsed > 0 && (
                        <tr className="summary-row">
                          <td colSpan="3" className="text-right">
                            <strong>Điểm sử dụng:</strong>
                          </td>
                          <td className="discount-amount">
                            <strong>
                              -{order.pointUsed.toLocaleString("vi-VN")} VNĐ
                            </strong>
                          </td>
                        </tr>
                      )}

                      {/* Tổng cộng */}
                      <tr className="total-row">
                        <td colSpan="3" className="text-right">
                          <strong>Tổng cộng:</strong>
                        </td>
                        <td>
                          <strong className="total-amount">
                            {this.calculateTotal().toLocaleString("vi-VN")} VNĐ
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="dialog-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderDetailsDialog;
