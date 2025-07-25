import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Snackbar,
  Alert,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Book as BookIcon,
  Person as PersonIcon,
  RateReview as ReviewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  fetchAllFeedbacks,
  deleteFeedback,
} from "../../../services/AdminService/feedbackService";

export default function FeedbackManagement() {
  const [originalFeedbacks, setOriginalFeedbacks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterQuery, setFilterQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    feedbackId: null,
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await fetchAllFeedbacks();
      setOriginalFeedbacks(data);
      setFeedbacks(data);
    } catch {
      openSnackbar("Lỗi khi tải feedback", "error");
    }
  };

  const openSnackbar = (msg, sev = "success") =>
    setSnackbar({ open: true, message: msg, severity: sev });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const openDeleteDialog = (feedbackId) => {
    setDeleteDialog({ open: true, feedbackId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, feedbackId: null });
  };

  const handleSearch = () => {
    let filtered = originalFeedbacks;
    if (filterType === "book" && filterQuery.trim()) {
      filtered = filtered.filter((f) =>
        f.book?.title?.toLowerCase().includes(filterQuery.trim().toLowerCase())
      );
    }
    if (filterType === "user" && filterQuery.trim()) {
      filtered = filtered.filter((f) =>
        f.user?.name?.toLowerCase().includes(filterQuery.trim().toLowerCase())
      );
    }
    setFeedbacks(filtered);
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await deleteFeedback(deleteDialog.feedbackId);
      openSnackbar("Xóa thành công", "success");
      loadFeedbacks();
    } catch {
      openSnackbar("Lỗi khi xóa feedback", "error");
    } finally {
      closeDeleteDialog();
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  return (
    <Box maxWidth={1200} mx="auto" p={2}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Quản lý đánh giá
      </Typography>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}>
        <Box
          p={2}
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter theo</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterQuery("");
              }}
              label="Filter theo"
              IconComponent={FilterIcon}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="book">Theo sách</MenuItem>
              <MenuItem value="user">Theo người dùng</MenuItem>
            </Select>
          </FormControl>

          {(filterType === "book" || filterType === "user") && (
            <TextField
              label={filterType === "book" ? "Tên sách" : "Tên người dùng"}
              size="small"
              sx={{ flexGrow: 1 }}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          {filterType === "all" && (
            <Tooltip title="Tải lại">
              <IconButton onClick={loadFeedbacks}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Card>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                "STT",
                <BookIcon key="b" fontSize="small" />,
                <PersonIcon key="u" fontSize="small" />,
                <ReviewIcon key="r" fontSize="small" />,
                "Bình luận",
                "Thời gian",
                "Hành động",
              ].map((h, i) => (
                <TableCell
                  key={i}
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align={i === 0 ? "center" : "left"}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {feedbacks.length > 0 ? (
              feedbacks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((fb, idx) => (
                  <TableRow
                    key={fb._id}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    <TableCell align="center">
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>{fb.book?.title || "—"}</TableCell>
                    <TableCell>{fb.user?.name || "—"}</TableCell>
                    <TableCell>
                      <Rating
                        value={fb.rating || 0}
                        readOnly
                        size="small"
                        precision={1}
                      />
                    </TableCell>
                    <TableCell>{fb.comment || "—"}</TableCell>
                    <TableCell>
                      {fb.createdAt
                        ? new Date(fb.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Xóa đánh giá">
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(fb._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có đánh giá nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={feedbacks.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa đánh giá này không?
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
          severity={snackbar.severity}
          onClose={closeSnackbar}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
