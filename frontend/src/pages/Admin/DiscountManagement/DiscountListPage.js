import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  TablePagination,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  EventAvailable as StartDateIcon,
  EventBusy as EndDateIcon,
  Edit,
  DeleteForever,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getDiscounts,
  deleteDiscount,
  changeStatusDiscount,
} from "../../../services/AdminService/discountService";

export default function DiscountListPage() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterCode, setFilterCode] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [discounts, filterCode, filterType, filterStatus]);

  const fetchDiscounts = async () => {
    try {
      const data = await getDiscounts();
      setDiscounts(data);
    } catch {
      openSnackbar("Lỗi khi lấy danh sách", "error");
    }
  };

  const applyFilters = () => {
    let res = [...discounts];
    const today = new Date();

    if (filterCode.trim()) {
      res = res.filter((d) =>
        d.code.toLowerCase().includes(filterCode.toLowerCase())
      );
    }
    if (filterType !== "all") {
      res = res.filter((d) => d.type === filterType);
    }
    if (filterStatus !== "all") {
      res = res.filter((d) => {
        const sd = new Date(d.startDate);
        const ed = new Date(d.endDate);
        switch (filterStatus) {
          case "active":
            return (
              d.isActive &&
              sd <= today &&
              ed >= today &&
              d.usedCount < d.usageLimit
            );
          case "upcoming":
            return sd > today;
          case "expired":
            return ed < today;
          case "depleted":
            return d.usedCount >= d.usageLimit;
          case "inactive":
            return !d.isActive;
          default:
            return true;
        }
      });
    }

    setFiltered(res);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mã này không?")) return;
    try {
      await deleteDiscount(id);
      openSnackbar("Xóa thành công", "success");
      fetchDiscounts();
    } catch {
      openSnackbar("Lỗi khi xóa", "error");
    }
  };

  const handleToggle = async (d) => {
    try {
      await changeStatusDiscount(d._id);
      openSnackbar("Cập nhật trạng thái thành công", "success");
      fetchDiscounts();
    } catch {
      openSnackbar("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  const openSnackbar = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const getStatus = (d) => {
    const today = new Date();
    const sd = new Date(d.startDate);
    const ed = new Date(d.endDate);
    if (!d.isActive) return "Chưa kích hoạt";
    if (d.usedCount >= d.usageLimit) return "Đã hết lượt";
    if (sd > today) return "Sắp có hiệu lực";
    if (ed < today) return "Đã hết hạn";
    return "Đang hoạt động";
  };

  const formatPrice = (num) =>
    new Intl.NumberFormat("vi-VN").format(num) + " VNĐ";

  return (
    <Box maxWidth={1200} mx="auto" p={2}>
      <Typography variant="h4" mb={2}>
        Quản lý mã giảm giá
      </Typography>

      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Mã giảm giá"
                value={filterCode}
                onChange={(e) => {
                  setFilterCode(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại</InputLabel>
                <Select
                  value={filterType}
                  label="Loại"
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="percentage">Phần trăm</MenuItem>
                  <MenuItem value="fixed">Cố định</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="upcoming">Sắp hiệu lực</MenuItem>
                  <MenuItem value="expired">Đã hết hạn</MenuItem>
                  <MenuItem value="depleted">Hết lượt</MenuItem>
                  <MenuItem value="inactive">Chưa kích hoạt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="right">
              <Button
                variant="contained"
                onClick={() => navigate("add")}
                sx={{ ml: 1 }}
              >
                Tạo mã
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                "Mã",
                "Giá trị",
                "Giá tối thiểu",
                "Sử dụng",
                <StartDateIcon key="s" fontSize="small" />,
                <EndDateIcon key="e" fontSize="small" />,
                "Trạng thái",
                "Kích hoạt",
                "Hành động",
              ].map((h, i) => (
                <TableCell
                  key={i}
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align={typeof h === "string" ? "left" : "center"}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Không có mã giảm giá
                </TableCell>
              </TableRow>
            ) : (
              filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((d) => (
                  <TableRow
                    key={d._id}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    <TableCell>{d.code}</TableCell>
                    <TableCell>
                      {d.type === "percentage"
                        ? `${d.value}%`
                        : formatPrice(d.value)}
                    </TableCell>
                    <TableCell>{formatPrice(d.minPurchase)}</TableCell>
                    <TableCell>
                      {d.usedCount}/{d.usageLimit}
                    </TableCell>
                    <TableCell>
                      {new Date(d.startDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {new Date(d.endDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{getStatus(d)}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={d.isActive}
                        onChange={() => handleToggle(d)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => navigate(`${d._id}/edit`)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(d._id)}>
                        <DeleteForever />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
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
    </Box>
  );
}
