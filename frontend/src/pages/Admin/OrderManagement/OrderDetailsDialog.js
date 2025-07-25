import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0";
  return amount.toLocaleString("vi-VN");
};

const InfoRow = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" py={1}>
    <Typography variant="body2" color="text.secondary">
      {label}:
    </Typography>
    <Typography variant="body2" fontWeight="500">
      {value || "Hà Nội"}
    </Typography>
  </Box>
);

export default function OrderDetailsDialog({ open, order, onClose }) {
  if (!open || !order) return null;

  // Safe calculation with fallbacks
  const subtotal = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        return sum + price * quantity;
      }, 0)
    : 0;

  const discountAmount = order.discountUsed
    ? order.discountUsed.type === "fixed"
      ? order.discountUsed.value || 0
      : (subtotal * (order.discountUsed.value || 0)) / 100
    : 0;

  const shippingFee = order.shippingInfo?.fee || 0;
  const pointsUsed = order.pointUsed || 0;

  const total = subtotal - discountAmount - pointsUsed + shippingFee;

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Processing":
        return "info";
      case "Shipped":
        return "secondary";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "COD":
        return "Thanh toán khi nhận hàng";
      case "ONLINE":
        return "Thanh toán trực tuyến";
      case "BANK_TRANSFER":
        return "Chuyển khoản ngân hàng";
      default:
        return method || "N/A";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Chưa thanh toán";
      case "Paid":
      case "Completed":
        return "Đã thanh toán";
      case "Failed":
        return "Thanh toán thất bại";
      default:
        return status || "N/A";
    }
  };

  // Safe access to shipping info
  const shippingInfo = order.shippingInfo || {};

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Chi tiết đơn hàng{" "}
            <Typography
              component="span"
              variant="h6"
              color="primary"
              fontWeight="600"
            >
              #{order.id || order._id || ""}
            </Typography>
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={order.orderStatus || "N/A"}
              color={getStatusColor(order.orderStatus)}
              size="small"
            />
            <Chip
              label={getPaymentStatusText(order.paymentStatus)}
              color={order.paymentStatus === "Pending" ? "warning" : "success"}
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Thông tin khách hàng */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Thông tin khách hàng
              </Typography>
              <InfoRow
                label="Tên khách hàng"
                value={order.user?.name || order.customerName}
              />
              <InfoRow
                label="Email"
                value={order.user?.email || order.customerEmail}
              />
              <InfoRow
                label="Ngày đặt hàng"
                value={formatDate(order.createdAt || order.orderDate)}
              />
              {order.trackingNumber && (
                <InfoRow label="Mã vận đơn" value={order.trackingNumber} />
              )}
              <InfoRow
                label="Phương thức thanh toán"
                value={getPaymentMethodText(order.paymentMethod)}
              />
            </Paper>
          </Grid>

          {/* Thông tin giao hàng */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Thông tin giao hàng
              </Typography>
              <InfoRow
                label="Địa chỉ "
                value={shippingInfo.address || shippingInfo.fullAddress}
              />
              <InfoRow
                label="Phường/Xã"
                value={shippingInfo.wardName || shippingInfo.ward}
              />
              <InfoRow
                label="Quận/Huyện"
                value={shippingInfo.districtName || shippingInfo.district}
              />
              <InfoRow
                label="Tỉnh/TP"
                value={
                  shippingInfo.provinceName ||
                  shippingInfo.province ||
                  shippingInfo.city
                }
              />
              <InfoRow
                label="Số điện thoại"
                value={shippingInfo.phoneNumber || shippingInfo.phone}
              />
              {shippingInfo.note && (
                <InfoRow label="Ghi chú" value={shippingInfo.note} />
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Danh sách sản phẩm */}
        <Box mt={3}>
          <Paper>
            <Box p={2} bgcolor="grey.50">
              <Typography variant="subtitle1" fontWeight="600">
                Sản phẩm ({Array.isArray(order.items) ? order.items.length : 0}{" "}
                sản phẩm)
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell align="center" width="100px">
                      Số lượng
                    </TableCell>
                    <TableCell align="right" width="120px">
                      Đơn giá
                    </TableCell>
                    <TableCell align="right" width="120px">
                      Thành tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {item.book?.title ||
                            item.productName ||
                            item.name ||
                            "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          {item.quantity || 0}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price || 0)} VNĐ
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            (item.price || 0) * (item.quantity || 0)
                          )}{" "}
                          VNĐ
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">
                          Không có sản phẩm nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Tổng kết đơn hàng */}
            <Box p={2} bgcolor="grey.50">
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Tổng kết đơn hàng
              </Typography>

              <InfoRow
                label="Tạm tính"
                value={`${formatCurrency(subtotal)} VNĐ`}
              />
              <InfoRow
                label="Phí vận chuyển"
                value={`${formatCurrency(shippingFee)} VNĐ`}
              />

              {discountAmount > 0 && (
                <InfoRow
                  label="Giảm giá"
                  value={`-${formatCurrency(discountAmount)} VNĐ`}
                />
              )}

              {pointsUsed > 0 && (
                <InfoRow
                  label="Điểm tích lũy"
                  value={`-${formatCurrency(pointsUsed)} VNĐ`}
                />
              )}

              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" pt={1}>
                <Typography variant="h6" fontWeight="600">
                  Tổng cộng:
                </Typography>
                <Typography variant="h6" fontWeight="600" color="primary">
                  {formatCurrency(total)} VNĐ
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
