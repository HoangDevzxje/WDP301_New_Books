import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Switch,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  deleteCampaign,
  getAllCampaigns,
} from "../../../services/AdminService/discountCampaignService";

const CampaignListPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    campaignId: null,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [campaigns, searchTerm]);

  const fetchCampaigns = async () => {
    try {
      const { data } = await getAllCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      showSnackbar("Lỗi khi tải danh sách chiến dịch", "error");
      console.error("Error fetching campaigns:", err);
    }
  };

  const applyFilters = () => {
    let result = [...campaigns];
    if (searchTerm.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFiltered(result);
  };

  const openDeleteDialog = (campaignId) => {
    setDeleteDialog({ open: true, campaignId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, campaignId: null });
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign(deleteDialog.campaignId);
      showSnackbar("Xóa chiến dịch thành công", "success");
      fetchCampaigns();
    } catch (err) {
      showSnackbar("Lỗi khi xóa chiến dịch", "error");
      console.error("Error deleting campaign:", err);
    } finally {
      closeDeleteDialog();
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatus = (campaign) => {
    const today = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    if (!campaign.isActive) return { label: "Tạm dừng", color: "default" };
    if (today < startDate) return { label: "Sắp diễn ra", color: "warning" };
    if (today > endDate) return { label: "Đã kết thúc", color: "error" };
    return { label: "Đang hoạt động", color: "success" };
  };

  return (
    <Box maxWidth={1200} mx="auto" p={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Quản lý Chiến dịch giảm giá</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("add")}
        >
          Tạo chiến dịch
        </Button>
      </Box>

      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Tìm kiếm theo tên"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                "Tên chiến dịch",
                "Giảm giá",
                "Thời gian",
                "Trạng thái",
                "Số sách",

                "Hành động",
              ].map((header, index) => (
                <TableCell
                  key={index}
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align={header === "Hành động" ? "right" : "left"}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có chiến dịch nào
                </TableCell>
              </TableRow>
            ) : (
              filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((campaign) => {
                  const status = getStatus(campaign);
                  return (
                    <TableRow
                      key={campaign._id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                        "&:hover": { backgroundColor: "#f0f0f0" },
                      }}
                    >
                      <TableCell>{campaign.name}</TableCell>
                      <TableCell>{campaign.percentage}%</TableCell>
                      <TableCell>
                        {new Date(campaign.startDate).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        -{" "}
                        {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            backgroundColor: (theme) =>
                              status.color === "default"
                                ? theme.palette.grey[300]
                                : status.color === "primary"
                                ? theme.palette.primary.main
                                : status.color === "secondary"
                                ? theme.palette.secondary.main
                                : status.color === "error"
                                ? theme.palette.error.main
                                : status.color === "warning"
                                ? theme.palette.warning.main
                                : status.color === "info"
                                ? theme.palette.info.main
                                : status.color === "success"
                                ? theme.palette.success.main
                                : status.color,
                            color: (theme) =>
                              ["default", "warning"].includes(status.color)
                                ? theme.palette.getContrastText(
                                    theme.palette.grey[300]
                                  )
                                : theme.palette.getContrastText(
                                    theme.palette[status.color]?.main ||
                                      status.color
                                  ),
                            fontSize: "0.8125rem",
                            fontWeight: 500,
                            height: "24px",
                            minWidth: "24px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status.label}
                        </Box>
                      </TableCell>
                      <TableCell>{campaign.books?.length || 0}</TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={() => navigate(`${campaign._id}/edit`)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(campaign._id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
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

      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Xác nhận xóa chiến dịch</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa chiến dịch này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignListPage;
