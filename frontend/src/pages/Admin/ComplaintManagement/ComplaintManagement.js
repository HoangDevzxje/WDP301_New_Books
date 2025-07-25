import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  Report as ReportIcon,
  Description as DescriptionIcon,
  EventNote as DateIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  getComplaints,
  updateComplaintStatus,
} from "../../../services/AdminService/complaintService";

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    customer: "",
    type: "",
    status: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState({ _id: "", status: "" });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      // sort descending by createdAt
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(data);
    } catch {
      openSnackbar("Lỗi tải khiếu nại", "error");
    }
  };

  const applyFilters = () => {
    let result = [...complaints];
    if (filters.customer) {
      result = result.filter((c) =>
        c.user.email.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }
    if (filters.type) {
      result = result.filter((c) => c.type === filters.type);
    }
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    setFiltered(result);
  };

  const openSnackbar = (msg, sev = "info") =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const handleFilterChange = (field) => (e) => {
    setFilters((f) => ({ ...f, [field]: e.target.value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({ customer: "", type: "", status: "" });
  };

  const handleOpenDialog = (c) => {
    setCurrent({ _id: c._id, status: c.status });
    setDialogOpen(true);
  };
  const handleCloseDialog = () => setDialogOpen(false);

  const handleStatusChange = (e) => {
    setCurrent((cur) => ({ ...cur, status: e.target.value }));
  };

  const handleUpdateStatus = async () => {
    try {
      await updateComplaintStatus(current._id, current.status);
      openSnackbar("Cập nhật trạng thái thành công", "success");
      fetchComplaints();
      handleCloseDialog();
    } catch {
      openSnackbar("Lỗi cập nhật", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang chờ xử lý":
        return "warning";
      case "Đã tiếp nhận":
        return "info";
      case "Đã giải quyết":
        return "success";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <FeedbackIcon sx={{ fontSize: 40, color: "#2c3e50" }} />
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#2c3e50" }}>
          Quản lý khiếu nại
        </Typography>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          label="Khách hàng"
          value={filters.customer}
          onChange={handleFilterChange("customer")}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Loại</InputLabel>
          <Select
            label="Loại"
            value={filters.type}
            onChange={handleFilterChange("type")}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Web">Web</MenuItem>
            <MenuItem value="Đơn hàng">Đơn hàng</MenuItem>
            <MenuItem value="Khác">Khác</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            label="Trạng thái"
            value={filters.status}
            onChange={handleFilterChange("status")}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Đang chờ xử lý">Đang chờ xử lý</MenuItem>
            <MenuItem value="Đã tiếp nhận">Đã tiếp nhận</MenuItem>
            <MenuItem value="Đã giải quyết">Đã giải quyết</MenuItem>
            <MenuItem value="Đã hủy">Đã hủy</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={resetFilters}>
          Đặt lại bộ lọc
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                { icon: <PersonIcon />, label: "Khách hàng" },
                { icon: <ReportIcon />, label: "Loại" },
                { icon: <DescriptionIcon />, label: "Mô tả" },
                { icon: null, label: "Trạng thái" },
                { icon: <DateIcon />, label: "Ngày tạo" },
                { icon: null, label: "Hành động" },
              ].map((col, i) => (
                <TableCell key={i} sx={{ color: "#fff", fontWeight: 700 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {col.icon}
                    {col.label}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>{c.user.email}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.status}
                      color={getStatusColor(c.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(c)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
              {
                fontWeight: 500,
              },
          }}
        />
      </TableContainer>

      {/* Status Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Cập nhật trạng thái</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={current.status}
              onChange={handleStatusChange}
            >
              <MenuItem value="Đã tiếp nhận">Đã tiếp nhận</MenuItem>
              <MenuItem value="Đã giải quyết">Đã giải quyết</MenuItem>
              <MenuItem value="Đã hủy">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
