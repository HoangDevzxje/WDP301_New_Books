import React, { useState, useEffect } from "react";
import {
  Container, Typography, Button, Box, Paper, Grid, Divider, Card, CardContent,
  Avatar, Chip, Alert, CircularProgress, Snackbar
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import "./OrderSuccessPage.css";
import * as OrderService from "../../services/OrderService";
function OrderSuccessPage({ updateCartData }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState({
    isProcessing: true,
    success: false,
    message: ""
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadOrderDetails = () => {
      const storedOrder = localStorage.getItem("latestOrder");
      if (storedOrder) {
        try {
          const parsedOrder = JSON.parse(storedOrder);
          setOrderDetails(parsedOrder);
          return parsedOrder;
        } catch (err) {
          console.error("Error parsing stored order:", err);
        }
      }
      return null;
    };

    const processPaymentResponse = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const vnpResponseCode = queryParams.get("vnp_ResponseCode");
        const orderId = queryParams.get("vnp_OrderInfo");

        const orderData = loadOrderDetails();
        if (vnpResponseCode) {
          if (orderId) {
            await confirmPaymentWithBackend(vnpResponseCode, orderId, queryParams);
          } else {
            await handlePaymentResponse(vnpResponseCode);
          }
        } else if (orderData) {
          setPaymentStatus({
            isProcessing: false,
            success: true,
            message: "Đơn hàng của bạn đã được đặt thành công!"
          });
          setSnackbarOpen(true);
        } else {
          setPaymentStatus({
            isProcessing: false,
            success: false,
            message: "Không tìm thấy thông tin đơn hàng."
          });
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error processing payment response:", error);
        setPaymentStatus({
          isProcessing: false,
          success: false,
          message: "Đã xảy ra lỗi khi xử lý thông tin thanh toán."
        });
        setSnackbarOpen(true);
      }
    };

    if (typeof updateCartData === "function") {
      updateCartData();
    }

    processPaymentResponse();
  }, [location.search, updateCartData]);

  const confirmPaymentWithBackend = async (responseCode, orderId, queryParams) => {
    try {
      const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

      if (access_token && orderId) {
        // const response = await axios.get(
        //   `http://localhost:9999/payment/return${location.search}`,
        //   {
        //     headers: { Authorization: `Bearer ${access_token}` }
        //   }
        // );

        const response = OrderService.getPaymentReturn(location.search);


        if (response.data.status === "success") {
          try {
            const orderResponse = await OrderService.getOrderDetails(orderId);

            if (orderResponse.data) {
              setOrderDetails(orderResponse.data);
              localStorage.setItem("latestOrder", JSON.stringify(orderResponse.data));
            }
          } catch (orderError) {
            console.error("Error fetching order details:", orderError);
          }

          setPaymentStatus({
            isProcessing: false,
            success: true,
            message: "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận."
          });
        } else {
          setPaymentStatus({
            isProcessing: false,
            success: false,
            message: response.data.message || "Thanh toán không thành công."
          });
        }
        setSnackbarOpen(true);
        return;
      }

      handlePaymentResponse(responseCode);

    } catch (error) {
      console.error("Error confirming payment with backend:", error);
      handlePaymentResponse(responseCode);
    }
  };

  const handlePaymentResponse = async (responseCode) => {
    try {

      if (responseCode === "00") {
        setPaymentStatus({
          isProcessing: false,
          success: true,
          message: "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận."
        });
        setSnackbarOpen(true);
      } else {
        let errorMessage = "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";

        switch (responseCode) {
          case "24":
            errorMessage = "Giao dịch không thành công do khách hàng hủy giao dịch";
            break;
          case "09":
            errorMessage = "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking";
            break;
          case "10":
            errorMessage = "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            break;
          case "11":
            errorMessage = "Đã hết hạn chờ thanh toán";
            break;
          case "12":
            errorMessage = "Thẻ/Tài khoản của khách hàng bị khóa";
            break;
          default:
            errorMessage = `Thanh toán không thành công (Mã lỗi: ${responseCode})`;
        }

        setPaymentStatus({
          isProcessing: false,
          success: false,
          message: errorMessage
        });
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus({
        isProcessing: false,
        success: false,
        message: "Đã xảy ra lỗi khi xác minh trạng thái thanh toán."
      });
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (paymentStatus.isProcessing) {
    return (
      <Container className="loading-container">
        <CircularProgress size={60} className="loading-spinner" />
        <Typography variant="h6" className="loading-text">
          Đang xử lý thông tin thanh toán...
        </Typography>
      </Container>
    );
  }

  if (!orderDetails) {
    return (
      <Container className="not-found-container">
        <Typography variant="h6" className="not-found-text">
          Không tìm thấy thông tin đơn hàng.
        </Typography>
        <Button component={Link} to="/" variant="contained" className="continue-shopping-button">
          Quay về trang chủ
        </Button>
      </Container>
    );
  }

  // Calculate subtotal
  const subtotal = orderDetails.items.reduce((acc, item) => acc + item.book.price * item.quantity, 0);

  return (
    <Box className="order-success-container">
      {/* Snackbar for Alert Messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={paymentStatus.success ? "success" : "error"}
          className={`snackbar-alert ${paymentStatus.success ? "success" : "error"}`}
        >
          {paymentStatus.message}
        </Alert>
      </Snackbar>

      <Paper elevation={3} className="order-success-paper">
        {/* Success Header */}
        <Box className="order-success-header">
          <Avatar className={`order-success-avatar ${paymentStatus.success ? 'success' : 'error'}`}>
            {paymentStatus.success ? (
              <CheckIcon sx={{ color: "white", fontSize: 40 }} />
            ) : (
              <ErrorIcon sx={{ color: "white", fontSize: 40 }} />
            )}
          </Avatar>
          <Typography variant="h5" className="order-success-title">
            {paymentStatus.success ? 'Đặt hàng thành công!' : 'Xác nhận đơn hàng'}
          </Typography>
          <Typography variant="subtitle1" className="order-success-subtitle">
            {paymentStatus.success
              ? 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận.'
              : 'Đơn hàng của bạn thanh toán chưa hoàn tất. Vui lòng thử lại.'}
          </Typography>
        </Box>

        {/* Main Content - Two Column Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Customer & Shipping Information */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={1} className="order-info-card">
              <Box className="order-info-header">
                <PersonIcon className="icon" />
                <Typography variant="subtitle1">Thông tin đơn hàng</Typography>
              </Box>
              <CardContent className="order-info-content">
                {/* Customer Info */}
                <Box className="order-info-field">
                  <Typography variant="body2" className="order-info-label">
                    Người nhận:
                  </Typography>
                  <Typography variant="body1" className="order-info-value">
                    {orderDetails.shippingInfo.name}
                  </Typography>
                </Box>

                <Box className="order-info-field">
                  <Typography variant="body2" className="order-info-label">
                    Số điện thoại:
                  </Typography>
                  <Typography variant="body1" className="order-info-value">
                    {orderDetails.shippingInfo.phoneNumber}
                  </Typography>
                </Box>

                <Box className="order-info-field">
                  <Typography variant="body2" className="order-info-label">
                    Địa chỉ giao hàng:
                  </Typography>
                  <Typography variant="body1" className="order-info-value">
                    {orderDetails.shippingInfo.address}, {orderDetails.shippingInfo.ward}, {orderDetails.shippingInfo.district}, {orderDetails.shippingInfo.province}
                  </Typography>
                </Box>

                <Divider className="order-info-divider" />

                {/* Payment & Shipping Method */}
                <Grid container spacing={2}>
                  <Grid>
                    <Box className="payment-method-section">
                      <PaymentIcon className="payment-method-icon" />
                      <Typography variant="body2" className="order-info-label">
                        Phương thức thanh toán:
                      </Typography>
                    </Box>
                    <Box className="payment-method-content">
                      <Typography variant="body1" className="order-info-value">
                        {orderDetails.paymentMethod === "Online"
                          ? "Thanh toán trực tuyến"
                          : "COD (Thanh toán khi nhận hàng)"}
                      </Typography>
                      {orderDetails.paymentMethod === "Online" && (
                        <Chip
                          label={paymentStatus.success ? "Đã thanh toán" : "Chưa thanh toán"}
                          className={`payment-status-chip ${paymentStatus.success ? "success" : "error"}`}
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid >
                    <Box className="shipping-method-section">
                      <LocalShippingIcon className="shipping-method-icon" />
                      <Typography variant="body2" className="order-info-label">
                        Phí vận chuyển:
                      </Typography>
                    </Box>
                    <Box className="shipping-method-content">
                      <Typography variant="body1" className="order-info-value">
                        {orderDetails.shippingInfo.fee > 0
                          ? `${orderDetails.shippingInfo.fee.toLocaleString()}₫`
                          : "Miễn phí"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Order Summary with Products */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={1} className="order-summary-card">
              <Box className="order-summary-header">
                <ReceiptIcon className="icon" />
                <Typography variant="subtitle1">Tổng kết đơn hàng</Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                {/* Products List */}
                <Box className="products-section">
                  <Typography variant="body2" className="products-label">
                    Sản phẩm đã đặt:
                  </Typography>
                  {orderDetails.items && orderDetails.items.map((item, index) => (
                    <Box key={index} className="product-item">
                      <Box className="product-image2">
                        <img
                          src={item.book.images}
                          alt={item.book.title}
                        />
                      </Box>
                      <Box className="product-content">
                        <Box className="product-details">
                          <Typography
                            variant="body2"
                            className="product-title"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.book.title}
                          </Typography>

                          <Box className="product-quantity-chip">
                            Số lượng: {item.quantity}
                          </Box>
                        </Box>
                        <Typography variant="body2" className="product-price">
                          {item.book.price.toLocaleString()}₫
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Price Summary */}
                <Box className="price-summary">
                  <div className="price-row">
                    <Typography variant="body2" className="price-label">Tạm tính:</Typography>
                    <Typography variant="body1" className="price-value">
                      {subtotal.toLocaleString()}₫
                    </Typography>
                  </div>

                  <div className="price-row">
                    <Typography variant="body2" className="price-label">Phí vận chuyển:</Typography>
                    <Typography variant="body1" className="price-value">
                      {orderDetails.shippingInfo.fee > 0
                        ? `${orderDetails.shippingInfo.fee.toLocaleString()}₫`
                        : "Miễn phí"}
                    </Typography>
                  </div>

                  {orderDetails.totalDiscount > 0 && (
                    <div className="price-row">
                      <Typography variant="body2" className="price-label">Giảm giá:</Typography>
                      <Typography variant="body1" className="price-value discount">
                        -{orderDetails.totalDiscount.toLocaleString()}₫
                      </Typography>
                    </div>
                  )}

                  {orderDetails.pointUsed > 0 && (
                    <div className="price-row">
                      <Typography variant="body2" className="price-label">Điểm thưởng:</Typography>
                      <Typography variant="body1" className="price-value discount">
                        -{orderDetails.pointUsed.toLocaleString()}₫
                      </Typography>
                    </div>
                  )}

                  <div className="total-row">
                    <Typography variant="subtitle1" className="total-label">Tổng cộng:</Typography>
                    <Typography variant="h5" className="total-amount">
                      {orderDetails.totalAmount.toLocaleString()}₫
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Button - Centered */}
        <Box className="action-button-container">
          <Button
            component={Link}
            to="/"
            variant="outlined"
            className="continue-btn"
          >
            Tiếp tục mua hàng
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default OrderSuccessPage;