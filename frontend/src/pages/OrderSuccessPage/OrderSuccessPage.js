import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
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
    message: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadOrderDetails = async () => {
      const queryParams = new URLSearchParams(location.search);
      const orderId = queryParams.get("vnp_OrderInfo");

      if (orderId) {
        try {
          const res = await OrderService.getOrderDetails(orderId);
          setOrderDetails(res.data?.data);
          return res.data?.data;
        } catch (err) {
          console.error("Không tìm thấy đơn từ vnp_OrderInfo:", err);
        }
      }

      const storedOrder = localStorage.getItem("latestOrder");
      if (storedOrder) {
        try {
          const parsedOrder = JSON.parse(storedOrder);
          setOrderDetails(parsedOrder);
          return parsedOrder;
        } catch (err) {
          console.error("Lỗi khi đọc localStorage.latestOrder:", err);
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
            await confirmPaymentWithBackend(
              vnpResponseCode,
              orderId,
              queryParams
            );
          } else {
            await handlePaymentResponse(vnpResponseCode);
          }
        } else if (orderData) {
          setPaymentStatus({
            isProcessing: false,
            success: true,
            message: "Đơn hàng của bạn đã được đặt thành công!",
          });
          setSnackbarOpen(true);
        } else {
          setPaymentStatus({
            isProcessing: false,
            success: false,
            message: "Không tìm thấy thông tin đơn hàng.",
          });
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error processing payment response:", error);
        setPaymentStatus({
          isProcessing: false,
          success: false,
          message: "Đã xảy ra lỗi khi xử lý thông tin thanh toán.",
        });
        setSnackbarOpen(true);
      }
    };

    if (typeof updateCartData === "function") {
      updateCartData();
    }

    processPaymentResponse();
  }, [location.search, updateCartData]);

  const confirmPaymentWithBackend = async (
    responseCode,
    orderId,
    queryParams
  ) => {
    try {
      const access_token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (access_token && orderId) {
        // const response = await axios.get(
        //   `http://localhost:9999/payment/return${location.search}`,
        //   {
        //     headers: { Authorization: `Bearer ${access_token}` }
        //   }
        // );

        const response = await OrderService.getPaymentReturn(location.search);

        if (response.data.status === "success") {
          try {
            const orderResponse = await OrderService.getOrderDetails(orderId);

            if (orderResponse.data) {
              setOrderDetails(orderResponse.data);
              localStorage.setItem(
                "latestOrder",
                JSON.stringify(orderResponse.data)
              );
            }
          } catch (orderError) {
            console.error("Error fetching order details:", orderError);
          }

          setPaymentStatus({
            isProcessing: false,
            success: true,
            message:
              "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.",
          });
        } else {
          setPaymentStatus({
            isProcessing: false,
            success: false,
            message: response.data.message || "Thanh toán không thành công.",
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
          message: "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.",
        });
        setSnackbarOpen(true);
      } else {
        let errorMessage =
          "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";

        switch (responseCode) {
          case "24":
            errorMessage =
              "Giao dịch không thành công do khách hàng hủy giao dịch";
            break;
          case "09":
            errorMessage =
              "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking";
            break;
          case "10":
            errorMessage =
              "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
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
          message: errorMessage,
        });
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus({
        isProcessing: false,
        success: false,
        message: "Đã xảy ra lỗi khi xác minh trạng thái thanh toán.",
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
        <Button
          component={Link}
          to="/"
          variant="contained"
          className="continue-shopping-button"
        >
          Quay về trang chủ
        </Button>
      </Container>
    );
  }

  // Calculate subtotal
  const subtotal = Array.isArray(orderDetails?.items)
    ? orderDetails.items.reduce(
        (acc, item) => acc + (item.book?.price || 0) * item.quantity,
        0
      )
    : 0;

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
          className={`snackbar-alert ${
            paymentStatus.success ? "success" : "error"
          }`}
        >
          {paymentStatus.message}
        </Alert>
      </Snackbar>

      <Paper elevation={3} className="order-success-paper">
        {/* Success Header */}
        <Box className="order-success-header">
          <Avatar
            className={`order-success-avatar ${
              paymentStatus.success ? "success" : "error"
            }`}
          >
            {paymentStatus.success ? (
              <CheckIcon sx={{ color: "white", fontSize: 40 }} />
            ) : (
              <ErrorIcon sx={{ color: "white", fontSize: 40 }} />
            )}
          </Avatar>
          <Typography variant="h5" className="order-success-title">
            {paymentStatus.success
              ? "Đặt hàng thành công!"
              : "Xác nhận đơn hàng"}
          </Typography>
          <Typography variant="subtitle1" className="order-success-subtitle">
            {paymentStatus.success
              ? "Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm để xác nhận."
              : "Đơn hàng của bạn vẫn đang chờ thanh toán. Hãy hoàn tất thanh toán trong vòng 3 ngày kể từ ngày đặt hàng để tránh hủy đơn."}
          </Typography>
        </Box>

        {/* Main Content - Two Column Layout */}

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
