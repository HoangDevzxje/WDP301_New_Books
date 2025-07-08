import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Link,
  Box,
} from "@mui/material";
import PolicyIcon from "@mui/icons-material/Policy";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const Refund = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const REFUND_DAYS_LIMIT = 3;

  const handleComplaintNavigation = (e) => {
    e.preventDefault();
    navigate("/user/complaint");
  };

  const renderRefundConditions = () => (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderLeft: "6px solid #1976d2" }}>
      <Box display="flex" alignItems="center" mb={2}>
        <PolicyIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          Điều Kiện Hoàn Trả Sách
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box component="ul" sx={{ pl: 3 }}>
        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
          Chỉ được hoàn trả sách cho đơn hàng ở trạng thái{" "}
          <strong>“Đã giao”</strong>
        </Typography>
        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
          Sách phải được trả trong vòng{" "}
          <strong>{REFUND_DAYS_LIMIT} ngày</strong> kể từ ngày nhận hàng
        </Typography>
        <Typography component="li" variant="body1" sx={{ mb: 1 }}>
          Sách không được hư hỏng và không thuộc danh mục không được hoàn trả
          (ví dụ: sách giảm giá)
        </Typography>
      </Box>
    </Paper>
  );

  const renderComplaintSection = () => (
    <Paper
      elevation={3}
      sx={{ p: 3, backgroundColor: "#f9f9f9", borderLeft: "6px solid #ffa726" }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <ReportProblemIcon sx={{ color: "#ffa726", mr: 1 }} />
        <Typography variant="h6" fontWeight="bold" color="warning.main">
          Thông Tin Trả Sách & Khiếu Nại
        </Typography>
      </Box>
      <Typography variant="body1">
        Vui lòng gửi thông tin chi tiết của khách hàng và thông tin về sách
        đến&nbsp;
        <Link
          component="button"
          onClick={handleComplaintNavigation}
          color="primary"
          underline="hover"
          sx={{ fontWeight: "bold" }}
        >
          trang khiếu nại
        </Link>
        . Chúng tôi sẽ liên hệ với bạn qua số điện thoại hoặc email trong thời
        gian sớm nhất.
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          Chính Sách Hoàn Trả Sách
        </Typography>
      </Box>

      {renderRefundConditions()}
      {renderComplaintSection()}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? "error" : "success"}
          variant="filled"
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Refund;
