import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  TablePagination,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Tooltip,
  Rating,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Book as BookIcon,
  Person as PersonIcon,
  RateReview as ReviewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
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

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await fetchAllFeedbacks();
      setOriginalFeedbacks(data);
      setFeedbacks(data);
    } catch (err) {
      console.error("Lỗi khi tải feedback:", err);
    }
  };

  const handleSearch = () => {
    let filtered = originalFeedbacks;
    if (filterType === "book" && filterQuery.trim()) {
      filtered = originalFeedbacks.filter((f) =>
        f.book?.title?.toLowerCase().includes(filterQuery.trim().toLowerCase())
      );
    } else if (filterType === "user" && filterQuery.trim()) {
      filtered = originalFeedbacks.filter((f) =>
        f.user?.name?.toLowerCase().includes(filterQuery.trim().toLowerCase())
      );
    }
    setFeedbacks(filtered);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
    try {
      await deleteFeedback(id);
      setOriginalFeedbacks((prev) => prev.filter((f) => f._id !== id));
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa feedback:", err);
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Quản lý đánh giá
      </Typography>

      {/* Filter/Search Bar */}
      <Box
        mb={3}
        p={2}
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          background: "#fff",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
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
            variant="outlined"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        )}

        {filterType === "all" && (
          <Tooltip title="Tải lại">
            <IconButton
              onClick={() => {
                setFilterQuery("");
                loadFeedbacks();
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
        <Table>
          <TableHead sx={{ background: "#2c3e50" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>STT</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                <BookIcon fontSize="small" /> Sách
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                <PersonIcon fontSize="small" /> Người dùng
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                <ReviewIcon fontSize="small" /> Đánh giá
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Bình luận
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Thời gian
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {feedbacks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((fb, idx) => (
                <TableRow
                  key={fb._id}
                  sx={{
                    "&:nth-of-type(odd)": { background: "#fafafa" },
                    "&:hover": { background: "#f0f0f0" },
                  }}
                >
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>{fb.book?.title || "Sách đã bị xóa"}</TableCell>
                  <TableCell>
                    {fb.user?.name || "Người dùng đã bị xóa"}
                  </TableCell>

                  {/* Hiển thị sao */}
                  <TableCell>
                    <Rating
                      name="read-only"
                      value={fb.rating || 0}
                      readOnly
                      size="small"
                      precision={1}
                    />
                  </TableCell>

                  <TableCell>{fb.comment || "Không có bình luận"}</TableCell>
                  <TableCell>
                    {fb.createdAt
                      ? new Date(fb.createdAt).toLocaleString("vi-VN")
                      : "Không xác định"}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Xóa phản hồi">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(fb._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={feedbacks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: "1px solid #e0e0e0" }}
        />
      </TableContainer>
    </Box>
  );
}
