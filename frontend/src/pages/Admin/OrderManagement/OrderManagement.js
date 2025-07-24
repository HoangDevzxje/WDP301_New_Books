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
  Visibility as ViewIcon,
  Check as ConfirmIcon,
  Edit as EditIcon,
  Close as CancelIcon,
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
const methods = { COD: "Thanh toán khi nhận", ONLINE: "Thanh toán online" };
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
      .sort((a, b) =>
        sortOrder === "newest"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [orders, filterStatus, sortOrder]);

  const calcTotal = (o) => {
    let sum = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
    if (o.discountUsed) {
      sum -=
        o.discountUsed.type === "fixed"
          ? o.discountUsed.value
          : (sum * o.discountUsed.value) / 100;
    }
    sum -= o.pointUsed || 0;
    const fee = o.shippingInfo?.fee || 0;
    return Math.max(sum + fee, 0);
  };

  const doAction = async (type, order, info) => {
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
    <Box maxWidth={1200} mx="auto" p={2}>
      <Typography variant="h4" mb={2}>
        Quản lý đơn hàng
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <FormControl size="small">
          <InputLabel>
            <FilterIcon /> Trạng thái
          </InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            label="Trạng thái"
          >
            <MenuItem value="All">Tất cả</MenuItem>
            {Object.keys(statusLabels).map((s) => (
              <MenuItem key={s} value={s}>
                {statusLabels[s]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
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

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                <>
                  <PersonIcon fontSize="small" /> Khách
                </>,
                <>
                  <DateIcon fontSize="small" /> Ngày
                </>,
                "Thanh toán",
                <>
                  <MoneyIcon fontSize="small" /> Tổng tiền
                </>,
                <>
                  <InfoIcon fontSize="small" /> Trạng thái
                </>,
                <>
                  <BoxIcon fontSize="small" /> Đóng gói
                </>,
                "Thao tác",
              ].map((h, i) => (
                <TableCell key={i} sx={{ color: "#fff", fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((o) => {
                const total = calcTotal(o);
                return (
                  <TableRow
                    key={o._id}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    <TableCell>{o.user?.name || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{methods[o.paymentMethod]}</TableCell>
                    <TableCell>{total.toLocaleString()} VNĐ</TableCell>
                    <TableCell>
                      <Box
                        fontWeight="bold"
                        color={statusColors[o.orderStatus]}
                      >
                        {statusLabels[o.orderStatus]}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {o.boxInfo
                        ? `${o.boxInfo.length}×${o.boxInfo.width}×${o.boxInfo.height}cm, ${o.boxInfo.weight}g`
                        : "Chưa có"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Xem">
                        <IconButton
                          onClick={() => setDialogs((d) => ({ ...d, view: o }))}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {o.orderStatus === "Pending" && (
                        <>
                          <Tooltip title="Xác nhận">
                            <IconButton
                              disabled={!o.boxInfo}
                              onClick={() => doAction("confirm", o)}
                            >
                              <ConfirmIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa đóng gói">
                            <IconButton
                              onClick={() =>
                                setDialogs((d) => ({ ...d, edit: o }))
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hủy">
                            <IconButton
                              onClick={() =>
                                window.confirm("Xác nhận hủy?") &&
                                doAction("cancel", o)
                              }
                            >
                              <CancelIcon />
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
              { fontWeight: 500 },
          }}
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
        onSave={(info) => doAction("saveBox", dialogs.edit, info)}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity} onClose={closeAlert}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
