import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar,
  Alert,
} from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  AttachMoney,
  People,
  MenuBook,
  HourglassEmpty,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import "./AdminDashboard.css";
import { getDashboardStats } from "../../../services/AdminService/dashboardService";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueTab, setRevenueTab] = useState(0);
  const pieColors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#00C49F",
    "#FFBB28",
    "#FF4444",
    "#AA66CC",
    "#33B5E5",
    "#0099CC",
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleRevenueTabChange = (event, newValue) => {
    setRevenueTab(newValue);
  };

  const groupRevenueData = (data, period) => {
    if (!data || !Array.isArray(data)) return [];

    const groupedData = {};

    data.forEach((item) => {
      let key;
      switch (period) {
        case 0:
          key = `${item._id.day}/${item._id.month}/${item._id.year}`;
          break;
        case 1:
          key = `Tuần ${item._id.week}/${item._id.year}`;
          break;
        case 2:
          key = `${item._id.month}/${item._id.year}`;
          break;
        case 3:
          key = `${item._id.year}`;
          break;
        default:
          key = "";
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          name: key,
          revenue: 0,
          originalRevenue: 0,
          shippingRevenue: 0,
          discountTotal: 0,
          orderCount: 0,
          itemCount: 0,
        };
      }

      groupedData[key].revenue += item.netRevenue || 0;
      groupedData[key].originalRevenue += item.originalRevenue || 0;
      groupedData[key].shippingRevenue += item.shippingRevenue || 0;
      groupedData[key].discountTotal += item.discountTotal || 0;
      groupedData[key].orderCount += item.orderCount || 0;
      groupedData[key].itemCount += item.itemCount || 0;
    });

    return Object.values(groupedData).reverse();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (loading)
    return (
      <Box className="loadingContainer">
        <CircularProgress color="primary" />
      </Box>
    );

  if (error) {
    return (
      <Box className="dashboardContainer">
        <Alert severity="error" sx={{ mb: 2 }}>
          Lỗi: {error}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box className="dashboardContainer">
        <Alert severity="warning">Lỗi khi tải dữ liệu</Alert>
      </Box>
    );
  }

  const revenueData = [
    groupRevenueData(stats.revenueAnalysis, 0),
    groupRevenueData(stats.revenueAnalysis, 1),
    groupRevenueData(stats.revenueAnalysis, 2),
    groupRevenueData(stats.revenueAnalysis, 3),
  ];

  const statusIcons = {
    "Chờ xác nhận": <HourglassEmpty className="statusIcon pending" />,
    "Đã xác nhận": <CheckCircle className="statusIcon confirmed" />,
    "Đã hủy": <Cancel className="statusIcon cancelled" />,
  };

  return (
    <Box className="dashboardContainer">
      <Typography variant="h4" className="dashboardTitle">
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper className="statCard">
            <AttachMoney className="statIcon revenue" />
            <Typography variant="h6" className="statTitle">
              Tổng Doanh Thu
            </Typography>
            <Typography variant="h7" className="statTitle">
              (Chưa tính thuế)
            </Typography>
            <Typography variant="h5" className="statValue revenue">
              {formatCurrency(stats.totalRevenue)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper className="statCard">
            <People className="statIcon users" />
            <Typography variant="h6" className="statTitle">
              Tổng số người dùng
            </Typography>
            <Typography variant="h5" className="statValue users">
              {stats.totalUsers?.toLocaleString("vi-VN") ||
                "Dữ liệu không có sẵn"}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper className="statCard">
            <MenuBook className="statIcon books" />
            <Typography variant="h6" className="statTitle">
              Tổng số sách
            </Typography>
            <Typography variant="h5" className="statValue books">
              {stats.totalBooks?.toLocaleString("vi-VN") ||
                "Dữ liệu không có sẵn"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box className="sectionContainer">
        <Typography variant="h6" className="sectionTitle">
          Tổng số đơn hàng theo trạng thái
        </Typography>
        {stats.orderStatusCount && stats.orderStatusCount.length > 0 ? (
          <Grid container spacing={2}>
            {stats.orderStatusCount.map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.status}>
                <Paper className="statusCard">
                  {statusIcons[item.status] || null}
                  <Typography variant="subtitle1" className="statusTitle">
                    {item.status}
                  </Typography>
                  <Typography
                    variant="h4"
                    className="statusValue"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {item.count?.toLocaleString("vi-VN") || 0}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">Không có dữ liệu đơn hàng</Alert>
        )}
      </Box>

      <Box className="productsRevenueContainer">
        <Box className="productsContainer">
          <Typography variant="h6" className="sectionTitle">
            Sản Phẩm Bán Chạy & Ít Lượt Mua
          </Typography>

          <Box className="tablesSection">
            <Box className="tableContainer">
              <Typography variant="h6" className="tableTitle">
                Top 10 Bán Chạy
              </Typography>
              {stats.topSellingProducts &&
              stats.topSellingProducts.length > 0 ? (
                <TableContainer component={Paper} className="productsTable">
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Stt</TableCell>
                        <TableCell>Ảnh</TableCell>
                        <TableCell>Tên Sách</TableCell>
                        <TableCell align="right">SL Bán</TableCell>
                        <TableCell align="right">Doanh Thu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.topSellingProducts.map((product, index) => (
                        <TableRow key={product.bookId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Avatar
                              variant="square"
                              src={product.bookImages?.[0]}
                              alt={product.bookName}
                            />
                          </TableCell>
                          <TableCell>{product.bookName || "N/A"}</TableCell>
                          <TableCell align="right">
                            {product.totalQuantity?.toLocaleString("vi-VN") ||
                              0}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(product.totalRevenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Không có dữ liệu sản phẩm bán chạy
                </Alert>
              )}
            </Box>

            <Box className="tableContainer">
              <Typography variant="h6" className="tableTitle">
                Top 10 Ít Lượt Mua
              </Typography>
              {stats.leastSellingProducts &&
              stats.leastSellingProducts.length > 0 ? (
                <TableContainer component={Paper} className="productsTable">
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Stt</TableCell>
                        <TableCell>Ảnh</TableCell>
                        <TableCell>Tên Sách</TableCell>
                        <TableCell align="right">SL Bán</TableCell>
                        <TableCell align="right">Doanh Thu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.leastSellingProducts.map((product, index) => (
                        <TableRow key={product.bookId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Avatar
                              variant="square"
                              src={product.bookImages?.[0]}
                              alt={product.bookName}
                            />
                          </TableCell>
                          <TableCell>{product.bookName || "N/A"}</TableCell>
                          <TableCell align="right">
                            {product.totalQuantity?.toLocaleString("vi-VN") ||
                              0}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(product.totalRevenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Không có dữ liệu sản phẩm ít bán</Alert>
              )}
            </Box>
          </Box>
        </Box>

        <Box className="revenueContainer">
          <Typography variant="h6" className="sectionTitle">
            Phân Tích Doanh Thu & Biểu Đồ
          </Typography>

          <Tabs
            value={revenueTab}
            onChange={handleRevenueTabChange}
            aria-label="revenue analysis tabs"
            className="revenueTabs"
          >
            <Tab label="Ngày" icon={<TodayIcon />} iconPosition="start" />
            <Tab label="Tuần" icon={<DateRangeIcon />} iconPosition="start" />
            <Tab
              label="Tháng"
              icon={<CalendarMonthIcon />}
              iconPosition="start"
            />
            <Tab label="Năm" icon={<EventNoteIcon />} iconPosition="start" />
          </Tabs>

          <Box className="chartsSection">
            <Paper className="chartContainer">
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Biểu Đồ Doanh Thu Theo Thời Gian
              </Typography>
              {revenueData[revenueTab] && revenueData[revenueTab].length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart
                    data={revenueData[revenueTab]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Doanh Thu",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh Thu"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    height: "85%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Alert severity="info">
                    Không có dữ liệu doanh thu cho khoảng thời gian này
                  </Alert>
                </Box>
              )}
            </Paper>

            <Paper className="pieChartContainer">
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Tỉ Lệ Doanh Thu – Top 10 Bán Chạy
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={stats.topSellingProducts}
                    dataKey="totalRevenue"
                    nameKey="bookName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.topSellingProducts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const getStatusColor = (status) => {
  const statusColors = {
    "Chờ xác nhận": "#f39c12",
    "Đã xác nhận": "#2ecc71",
    "Đã hủy": "#e74c3c",
  };
  return statusColors[status] || "#3498db";
};

export default AdminDashboard;
