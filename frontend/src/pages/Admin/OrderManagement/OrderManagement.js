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
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  AllInbox as BoxIcon,
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
const paymentStatusLabels = {
  Pending: "Chờ thanh toán",
  Completed: "Đã thanh toán",
};
const statusColors = {
  Pending: "#FFA500",
  Processing: "#1E90FF",
  Shipped: "#9370DB",
  Delivered: "#32CD32",
  Cancelled: "#DC143C",
  Completed: "#32CD32",
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
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

  // Fetch orders
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

  // Filter & sort
  const filtered = useMemo(
    () =>
      orders
        .filter((o) => filterStatus === "All" || o.orderStatus === filterStatus)
        .sort((a, b) =>
          sortOrder === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        ),
    [orders, filterStatus, sortOrder]
  );

  // Calculate total amount
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
    <Box p={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4" ml={1}>
          Quản lý đơn hàng
        </Typography>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2}>
        <FormControl>
          <InputLabel>
            <FilterIcon /> Trạng thái
          </InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Trạng thái"
          >
            {["All", ...Object.keys(statusLabels)].map((s) => (
              <MenuItem key={s} value={s}>
                {s === "All" ? "Tất cả" : statusLabels[s]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>
            <SortIcon /> Sắp xếp
          </InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            label="Sắp xếp"
          >
            <MenuItem value="newest">Mới nhất</MenuItem>
            <MenuItem value="oldest">Cũ nhất</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <PersonIcon fontSize="small" /> Ngày đặt
              </TableCell>
              <TableCell>
                <DateIcon fontSize="small" /> Ngày đặt
              </TableCell>
              <TableCell>Phương thức thanh toán</TableCell>
              <TableCell>
                <MoneyIcon fontSize="small" /> Tổng tiền
              </TableCell>
              <TableCell>
                <InfoIcon fontSize="small" /> Trạng thái
              </TableCell>
              <TableCell>
                <BoxIcon fontSize="small" /> Vận chuyển
              </TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((order) => {
                const total = calcTotal(order);
                return (
                  <TableRow key={order._id}>
                    <TableCell>{order.user?.name || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{paymentMethods[order.paymentMethod]}</TableCell>
                    <TableCell>{total.toLocaleString()} VNĐ</TableCell>
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
                    <TableCell>
                      <Tooltip title="Xem">
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
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10]}
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Dialogs & Alerts */}
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
        autoHideDuration={6000}
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
