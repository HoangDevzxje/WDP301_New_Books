import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Chip,
  TablePagination,
} from "@mui/material";
import {
  Person as PersonIcon,
  Description as DescriptionIcon,
  Report as ReportIcon,
  EventNote as DateIcon,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import {
  getComplaints,
  updateComplaintStatus,
} from "../../../services/AdminService/complaintService";
import "./ComplaintManagement.css";

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState({
    _id: "",
    status: "",
  });

  // Filter states
  const [customerFilter, setCustomerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, customerFilter, typeFilter, statusFilter]);

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      // Sort complaints by creation date (newest first)
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComplaints(sortedData);
      setFilteredComplaints(sortedData);
    } catch (error) {
      console.error("Error fetching complaints", error);
    }
  };

  const applyFilters = () => {
    let result = [...complaints];
    if (customerFilter) {
      result = result.filter((c) =>
        c.user.email.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }
    if (typeFilter) {
      result = result.filter((c) => c.type === typeFilter);
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    // Maintain sorting after filtering
    result = result.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setFilteredComplaints(result);
  };

  const handleOpenEditDialog = (complaint) => {
    setCurrentComplaint({ _id: complaint._id, status: complaint.status });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleStatusChange = (e) => {
    setCurrentComplaint((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleUpdateStatus = async () => {
    try {
      await updateComplaintStatus(
        currentComplaint._id,
        currentComplaint.status
      );
      fetchComplaints();
      handleClose();
    } catch (error) {
      console.error("Error updating complaint status", error);
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

  const resetFilters = () => {
    setCustomerFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{ p: 2, width: "100%", maxWidth: "calc(100% - 250px)", mx: "auto" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <FeedbackIcon sx={{ fontSize: 40, color: "#2c3e50" }} />
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#2c3e50", letterSpacing: 0.5 }}
        >
          Quản lý khiếu nại
        </Typography>
      </Box>
      {/* Filters */}
      <div className="cm-filter-section">
        <button className="cm-button" onClick={resetFilters}>
          Đặt lại bộ lọc
        </button>
        <div className="cm-filters">
          <input
            type="text"
            placeholder="Tìm theo khách hàng"
            className="cm-input"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          />
          <select
            className="cm-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại khiếu nại</option>
            <option value="Web">Web</option>
            <option value="Đơn hàng">Đơn hàng</option>
            <option value="Khác">Khác</option>
          </select>
          <select
            className="cm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang chờ xử lý">Đang chờ xử lý</option>
            <option value="Đã tiếp nhận">Đã tiếp nhận</option>
            <option value="Đã giải quyết">Đã giải quyết</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>
      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#2c3e50" }}>
              {[
                { icon: <PersonIcon />, label: "Khách hàng" },
                { icon: <ReportIcon />, label: "Khiếu nại" },
                { icon: <DescriptionIcon />, label: "Mô tả" },
                { icon: null, label: "Trạng thái" },
                { icon: <DateIcon />, label: "Ngày tạo" },
                { icon: null, label: "Thao tác" },
              ].map((col, idx) => (
                <TableCell
                  key={idx}
                  sx={{ fontWeight: "bold", color: "white" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {col.icon}
                    {col.label}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComplaints
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((complaint) => (
                <TableRow key={complaint._id} hover>
                  <TableCell>{complaint.user.email}</TableCell>
                  <TableCell>{complaint.type}</TableCell>
                  <TableCell>{complaint.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={complaint.status}
                      color={getStatusColor(complaint.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditDialog(complaint)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredComplaints.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
      {/* Dialog cập nhật trạng thái */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cập nhật trạng thái khiếu nại</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={currentComplaint.status}
                onChange={handleStatusChange}
                label="Trạng thái"
              >
                <MenuItem value="Đã tiếp nhận">Đã tiếp nhận</MenuItem>
                <MenuItem value="Đã giải quyết">Đã giải quyết</MenuItem>
                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleUpdateStatus} color="primary">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintManagement;
