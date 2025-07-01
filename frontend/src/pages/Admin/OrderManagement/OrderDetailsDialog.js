import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

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

const OrderDetailsDialog = ({ open, order, onClose }) => {
  if (!order) return null;

  const calculateSubtotal = () =>
    order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
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

  // Amount from discount code only
  const getDiscountAmount = () => {
    if (!order.discountUsed) return 0;
    const subtotal = calculateSubtotal();
    return order.discountUsed.type === "fixed"
      ? order.discountUsed.value
      : (subtotal * order.discountUsed.value) / 100;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết đơn hàng</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Thông tin khách hàng */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin khách hàng
            </Typography>
            <Typography>
              <strong>Tên:</strong> {order.user?.name || "N/A"}
            </Typography>
            <Typography>
              <strong>Email:</strong> {order.user?.email || "N/A"}
            </Typography>
          </Grid>

          {/* Thông tin vận chuyển */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin vận chuyển
            </Typography>
            {order.trackingNumber && (
              <Typography>
                <strong>Mã vận đơn:</strong> {order.trackingNumber}
              </Typography>
            )}
            <Typography>
              <strong>Địa chỉ:</strong> {order.shippingInfo.address}
            </Typography>
            <Typography>
              <strong>Tỉnh/TP:</strong> {order.shippingInfo.provineName}
            </Typography>
            <Typography>
              <strong>Quận/Huyện:</strong> {order.shippingInfo.districtName}
            </Typography>
            <Typography>
              <strong>Phường/Xã:</strong> {order.shippingInfo.wardName}
            </Typography>
            <Typography>
              <strong>SĐT:</strong> {order.shippingInfo.phoneNumber}
            </Typography>
            {order.shippingInfo.note && (
              <Typography>
                <strong>Ghi chú:</strong> {order.shippingInfo.note}
              </Typography>
            )}
            <Typography>
              <strong>Phí ship:</strong>{" "}
              {(order.shippingInfo.fee || 0).toLocaleString("vi-VN")} VNĐ
            </Typography>
          </Grid>

          {/* Thông tin thanh toán */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin thanh toán
            </Typography>
            <Typography>
              <strong>Phương thức:</strong>{" "}
              {order.paymentMethod === "COD" ? "COD" : "Online"}
            </Typography>
            <Typography>
              <strong>Trạng thái thanh toán:</strong>{" "}
              <Chip
                label={
                  order.paymentStatus === "Pending"
                    ? "Chưa thanh toán"
                    : "Đã thanh toán"
                }
                color={
                  order.paymentStatus === "Pending" ? "warning" : "success"
                }
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography>
              <strong>Trạng thái đơn hàng:</strong>{" "}
              <Chip
                label={order.orderStatus}
                color={
                  order.orderStatus === "Pending"
                    ? "warning"
                    : order.orderStatus === "Processing"
                    ? "info"
                    : "error"
                }
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>

          {/* Thông tin đơn hàng */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin đơn hàng
            </Typography>
            <Typography>
              <strong>Ngày đặt:</strong> {formatDate(order.createdAt)}
            </Typography>
            <Typography>
              <strong>Tổng tiền:</strong>{" "}
              {calculateTotal().toLocaleString("vi-VN")} VNĐ
            </Typography>
            {order.boxInfo && (
              <>
                <Typography>
                  <strong>Kích thước (L×W×H):</strong> {order.boxInfo.length}×
                  {order.boxInfo.width}×{order.boxInfo.height} cm
                </Typography>
                <Typography>
                  <strong>Cân nặng:</strong> {order.boxInfo.weight} gram
                </Typography>
              </>
            )}
          </Grid>

          {/* Danh sách sản phẩm */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Danh sách sản phẩm
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell>Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.book?.title || "N/A"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.price.toLocaleString("vi-VN")} VNĐ
                      </TableCell>
                      <TableCell>
                        {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Tổng tiền sản phẩm */}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Tổng tiền sản phẩm:</strong>
                    </TableCell>
                    <TableCell>
                      {calculateSubtotal().toLocaleString("vi-VN")} VNĐ
                    </TableCell>
                  </TableRow>

                  {/* Phí ship */}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Phí vận chuyển:</strong>
                    </TableCell>
                    <TableCell>
                      {(order.shippingInfo.fee || 0).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </TableCell>
                  </TableRow>

                  {/* Giảm giá mã */}
                  {order.discountUsed && getDiscountAmount() > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>
                          Giảm giá mã{" "}
                          {order.discountUsed.type === "percentage"
                            ? `(${order.discountUsed.value}%)`
                            : ""}
                          :
                        </strong>
                      </TableCell>
                      <TableCell>
                        -{getDiscountAmount().toLocaleString("vi-VN")} VNĐ
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Điểm sử dụng */}
                  {order.pointUsed > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Điểm sử dụng:</strong>
                      </TableCell>
                      <TableCell>
                        -{order.pointUsed.toLocaleString("vi-VN")} VNĐ
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Tổng cộng */}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Tổng cộng:</strong>
                    </TableCell>
                    <TableCell>
                      <strong>
                        {calculateTotal().toLocaleString("vi-VN")} VNĐ
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
