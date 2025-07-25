import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCampaign,
  updateCampaign,
  getAllCampaigns,
  previewBookConflicts,
  checkBookConflicts,
} from "../../../services/AdminService/discountCampaignService";
import { getBooks } from "../../../services/AdminService/bookService";
import {
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Chip,
  Stack,
  Divider,
  InputAdornment,
  Grid,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Book as BookIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const formatDateDisplay = (isoDateStr) => {
  if (!isoDateStr) return "";
  const date = new Date(isoDateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.spacing(2),
  },
}));

const BookListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const BookSelectionButton = styled(Button)(({ theme }) => ({
  justifyContent: "space-between",
  padding: theme.spacing(2),
  border: `1px dashed ${theme.palette.divider}`,
  "&:hover": {
    border: `1px dashed ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.action.hover,
  },
}));

const SelectedBooksDisplay = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
}));

const CampaignFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    percentage: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    books: [],
  });

  const [bookList, setBookList] = useState([]);
  const [disabledBooks, setDisabledBooks] = useState([]);
  const [initialBooks, setInitialBooks] = useState([]);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [tempSelectedBooks, setTempSelectedBooks] = useState([]);

  useEffect(() => {
    if (isEdit) {
      getAllCampaigns().then((res) => {
        const campaign = res.data.find((c) => c._id === id);
        if (campaign) {
          const ids = campaign.books.map((b) =>
            typeof b === "object" ? b._id : b
          );
          setForm({ ...campaign, books: ids });
          setInitialBooks(ids);
          setTempSelectedBooks(ids);
        }
      });
    }

    getBooks().then((res) => setBookList(res || []));
  }, [id]);

  useEffect(() => {
    if (form.startDate && form.endDate && bookList.length > 0) {
      updateDisabledBooks();
    }
  }, [form.startDate, form.endDate, bookList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateDisabledBooks = async () => {
    if (!form.startDate || !form.endDate || bookList.length === 0) {
      setDisabledBooks([]);
      return;
    }

    try {
      const res = await previewBookConflicts({
        books: bookList.map((b) => b._id),
        startDate: form.startDate,
        endDate: form.endDate,
        campaignId: isEdit ? id : null,
      });

      setDisabledBooks(res.conflictedBooks || []);
    } catch (error) {
      console.error("Error fetching book conflicts:", error);
      setDisabledBooks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const conflictRes = await checkBookConflicts({
      books: form.books,
      startDate: form.startDate,
      endDate: form.endDate,
      campaignId: isEdit ? id : null,
    });

    if (conflictRes.conflictedBooks.length > 0) {
      const conflictedTitles = conflictRes.conflictedBooks
        .map(
          (bookId) => bookList.find((b) => b._id === bookId)?.title || bookId
        )
        .join(", ");

      alert(
        `Sách sau đã nằm trong chiến dịch khác trong khoảng thời gian này:\n${conflictedTitles}`
      );
      return;
    }

    if (isEdit) {
      await updateCampaign(id, form);
    } else {
      await createCampaign(form);
    }

    navigate("/admin/discount-campaigns");
  };

  const handleOpenBookDialog = async () => {
    setTempSelectedBooks([...form.books]);

    if (form.startDate && form.endDate) {
      await updateDisabledBooks();
    }

    setBookDialogOpen(true);
  };

  const handleCloseBookDialog = () => {
    setBookDialogOpen(false);
    setBookSearchTerm("");
  };

  const handleConfirmBookSelection = () => {
    setForm((prev) => ({ ...prev, books: tempSelectedBooks }));
    handleCloseBookDialog();
  };

  const handleToggleBookSelection = (bookId) => {
    return () => {
      if (disabledBooks.includes(bookId)) return;
      setTempSelectedBooks((prev) =>
        prev.includes(bookId)
          ? prev.filter((id) => id !== bookId)
          : [...prev, bookId]
      );
    };
  };

  const handleSelectAllBooks = () => {
    if (tempSelectedBooks.length === bookList.length) {
      setTempSelectedBooks([]);
    } else {
      const availableBooks = bookList
        .filter((book) => !disabledBooks.includes(book._id))
        .map((book) => book._id);
      setTempSelectedBooks(availableBooks);
    }
  };

  const handleRemoveBook = (bookId) => {
    setForm((prev) => ({
      ...prev,
      books: prev.books.filter((id) => id !== bookId),
    }));
  };

  const filteredBooks = bookList.filter(
    (book) =>
      book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const selectedCount = tempSelectedBooks.length;
  const totalAvailableBooks = bookList.filter(
    (book) => !disabledBooks.includes(book._id)
  ).length;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" mb={3} fontWeight="bold">
        {isEdit ? "Chỉnh sửa" : "Tạo"} chiến dịch giảm giá
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Tên chiến dịch"
            name="name"
            fullWidth
            value={form.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mô tả"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Phần trăm giảm (%)"
            name="percentage"
            type="number"
            fullWidth
            value={form.percentage}
            onChange={handleChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              fullWidth
              value={form.startDate?.slice(0, 10)}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            {form.startDate && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              ></Typography>
            )}
          </Box>

          <Box>
            <TextField
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              fullWidth
              value={form.endDate?.slice(0, 10)}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            {form.endDate && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              ></Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ my: 3 }}>
        <InputLabel sx={{ mb: 1 }}>Sách áp dụng</InputLabel>

        <BookSelectionButton
          fullWidth
          onClick={handleOpenBookDialog}
          disabled={!form.startDate || !form.endDate}
          startIcon={<AddIcon />}
          endIcon={
            <Box
              sx={{
                px: 1,
                py: 0.3,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "16px",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {`${form.books.length} sách đã chọn`}
            </Box>
          }
        >
          <Typography sx={{ flexGrow: 1, textAlign: "left" }}>
            {!form.startDate || !form.endDate
              ? "Vui lòng chọn ngày bắt đầu và kết thúc trước"
              : "Chọn sách áp dụng chiến dịch"}
          </Typography>
        </BookSelectionButton>

        {/* Display selected books */}
        {form.books.length > 0 && (
          <SelectedBooksDisplay sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Sách đã chọn:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {form.books.map((bookId) => {
                const book = bookList.find((b) => b._id === bookId);
                return (
                  <Chip
                    key={bookId}
                    label={book?.title || bookId}
                    onDelete={() => handleRemoveBook(bookId)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                );
              })}
            </Stack>
          </SelectedBooksDisplay>
        )}
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={form.isActive}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            color="primary"
          />
        }
        label="Kích hoạt chiến dịch"
        sx={{ mb: 3 }}
      />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/admin/discount-campaigns")}
        >
          Hủy
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Box>

      <StyledDialog
        open={bookDialogOpen}
        onClose={handleCloseBookDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Chọn sách áp dụng chiến dịch
            </Typography>
            <IconButton onClick={handleCloseBookDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Đã chọn {selectedCount}/{totalAvailableBooks} sách có sẵn
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm sách theo tên hoặc tác giả..."
              value={bookSearchTerm}
              onChange={(e) => setBookSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button
                startIcon={
                  selectedCount === totalAvailableBooks ? (
                    <DeselectIcon />
                  ) : (
                    <SelectAllIcon />
                  )
                }
                onClick={handleSelectAllBooks}
                disabled={totalAvailableBooks === 0}
              >
                {selectedCount === totalAvailableBooks
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
            </Box>
          </Box>

          <List
            dense
            sx={{
              maxHeight: 400,
              overflow: "auto",
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "divider",
                borderRadius: 4,
              },
            }}
          >
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => {
                const isInAnotherCampaign = disabledBooks.includes(book._id);
                const isSelected = tempSelectedBooks.includes(book._id);

                return (
                  <ListItem
                    key={book._id}
                    disablePadding
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={isSelected}
                        onChange={handleToggleBookSelection(book._id)}
                        disabled={isInAnotherCampaign}
                        color="primary"
                      />
                    }
                  >
                    <BookListItem
                      selected={isSelected}
                      onClick={handleToggleBookSelection(book._id)}
                      disabled={isInAnotherCampaign}
                    >
                      <ListItemIcon>
                        <BookIcon color={isSelected ? "primary" : "inherit"} />
                      </ListItemIcon>
                      <Stack>
                        <Typography
                          fontWeight={isSelected ? "bold" : "normal"}
                          color={
                            isInAnotherCampaign
                              ? "text.disabled"
                              : "text.primary"
                          }
                        >
                          {book.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            isInAnotherCampaign
                              ? "text.disabled"
                              : "text.secondary"
                          }
                        >
                          {book.author} • {book.price?.toLocaleString()}đ
                        </Typography>
                      </Stack>
                      {isInAnotherCampaign && (
                        <Chip
                          label="Đã áp dụng"
                          size="small"
                          color="error"
                          sx={{ ml: 2 }}
                        />
                      )}
                    </BookListItem>
                  </ListItem>
                );
              })
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 4,
                }}
              >
                <BookIcon
                  sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                />
                <Typography color="text.secondary">
                  Không tìm thấy sách phù hợp
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseBookDialog} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmBookSelection}
            variant="contained"
            startIcon={<CheckIcon />}
            disabled={tempSelectedBooks.length === 0}
          >
            Xác nhận ({tempSelectedBooks.length})
          </Button>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default CampaignFormPage;
