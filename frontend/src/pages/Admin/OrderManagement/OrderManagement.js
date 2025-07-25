import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Snackbar,
  Alert,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  getOrders,
  confirmOrder,
  cancelOrder,
  updateBoxInfo,
} from "../../../services/AdminService/orderService";
import OrderDetailsDialog from "./OrderDetailsDialog";
import EditBoxDialog from "./EditBoxDialog";

const statusLabels = {
  Pending: "Chờ xác nhận",
  Processing: "Đã xác nhận",
  Shipped: "Đã gửi",
  Delivered: "Đã giao",
  Cancelled: "Đã hủy",
};
const paymentMethods = {
  COD: "Thanh toán khi nhận hàng",
  Online: "Thanh toán online",
};
const statusColors = {
  Pending: "#FFA500",
  Processing: "#1E90FF",
  Shipped: "#9370DB",
  Delivered: "#32CD32",
  Cancelled: "#DC143C",
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [dialogs, setDialogs] = useState({ view: null, edit: null });

  const showAlert = (msg, sev = "info") =>
    setAlert({ open: true, message: msg, severity: sev });
  const closeAlert = () => setAlert((a) => ({ ...a, open: false }));

  useEffect(() => {
    (async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch {
        showAlert("Lỗi tải đơn hàng", "error");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return orders
      .filter((o) => filterStatus === "All" || o.orderStatus === filterStatus)
      .filter((o) =>
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [orders, filterStatus, searchTerm, sortOrder]);

  const calcTotal = (order) => {
    let total =
      order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0;
    if (order.discountUsed) {
      total -=
        order.discountUsed.type === "fixed"
          ? order.discountUsed.value
          : (total * order.discountUsed.value) / 100;
    }
    total -= order.pointUsed || 0;
    return Math.max(total + (order.shippingInfo?.fee || 0), 0);
  };

  const handleAction = async (type, order, info) => {
    try {
      if (type === "confirm") {
        const total = calcTotal(order);
        if (total > 500000)
          return showAlert("Không hỗ trợ thu hộ >500k", "warning");
        await confirmOrder(order._id);
        showAlert("Xác nhận thành công", "success");
      } else if (type === "cancel") {
        await cancelOrder(order._id);
        showAlert("Hủy thành công", "success");
      } else if (type === "saveBox") {
        await updateBoxInfo(order._id, info);
        showAlert("Cập nhật đóng gói thành công", "success");
      }
      const updated = await getOrders();
      setOrders(updated);
    } catch {
      showAlert("Lỗi thao tác", "error");
    } finally {
      setDialogs({ view: null, edit: null });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Quản lý Đơn hàng</Typography>
      </Box>

      {/* Tìm kiếm + lọc */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          backgroundColor: "#fff",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <TextField
          size="small"
          label="Tìm theo tên khách"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            label="Trạng thái"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="All">Tất cả</MenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sắp xếp</InputLabel>
          <Select
            label="Sắp xếp"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="newest">Mới nhất</MenuItem>
            <MenuItem value="oldest">Cũ nhất</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                "Khách hàng",
                "Ngày đặt",
                "Thanh toán",
                "Tổng tiền",
                "Trạng thái",
                "Đóng gói",
                "Hành động",
              ].map((text, i) => (
                <TableCell
                  key={i}
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align={text === "Hành động" ? "right" : "left"}
                >
                  {text}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((order) => (
                <TableRow
                  key={order._id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell>{order.user?.name || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>{paymentMethods[order.paymentMethod]}</TableCell>
                  <TableCell>{calcTotal(order).toLocaleString()} VNĐ</TableCell>
                  <TableCell>
                    <Box
                      fontWeight="bold"
                      color={statusColors[order.orderStatus]}
                    >
                      {statusLabels[order.orderStatus]}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {order.boxInfo
                      ? `${order.boxInfo.length}x${order.boxInfo.width}x${order.boxInfo.height}cm, ${order.boxInfo.weight}g`
                      : "Chưa có"}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        onClick={() =>
                          setDialogs((d) => ({ ...d, view: order }))
                        }
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {order.orderStatus === "Pending" && (
                      <>
                        <Tooltip title="Xác nhận">
                          <IconButton
                            disabled={!order.boxInfo}
                            onClick={() => handleAction("confirm", order)}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa đóng gói">
                          <IconButton
                            onClick={() =>
                              setDialogs((d) => ({ ...d, edit: order }))
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hủy">
                          <IconButton
                            onClick={() =>
                              window.confirm("Xác nhận hủy?") &&
                              handleAction("cancel", order)
                            }
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          sx={{ borderTop: "1px solid #e0e0e0" }}
        />
      </TableContainer>

      <OrderDetailsDialog
        open={!!dialogs.view}
        order={dialogs.view}
        onClose={() => setDialogs((d) => ({ ...d, view: null }))}
      />
      <EditBoxDialog
        open={!!dialogs.edit}
        order={dialogs.edit}
        onClose={() => setDialogs((d) => ({ ...d, edit: null }))}
        onSave={(info) => handleAction("saveBox", dialogs.edit, info)}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={closeAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
