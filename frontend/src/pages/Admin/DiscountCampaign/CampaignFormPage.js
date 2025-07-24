// src/pages/admin/CampaignFormPage.jsx
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
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  ListItemText,
} from "@mui/material";

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
        }
      });
    }

    getBooks().then((res) => setBookList(res || []));
  }, [id]);

  useEffect(() => {
    updateDisabledBooks();
  }, [form.startDate, form.endDate, bookList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookChange = (event) => {
    const {
      target: { value },
    } = event;
    setForm((prev) => ({
      ...prev,
      books: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const updateDisabledBooks = async () => {
    if (!form.startDate || !form.endDate) return;

    const res = await previewBookConflicts({
      books: bookList.map((b) => b._id),
      startDate: form.startDate,
      endDate: form.endDate,
      campaignId: isEdit ? id : null,
    });

    setDisabledBooks(res.conflictedBooks || []);
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="h5" mb={2}>
        {isEdit ? "Chỉnh sửa" : "Tạo"} chiến dịch giảm giá
      </Typography>

      <TextField
        label="Tên chiến dịch"
        name="name"
        fullWidth
        value={form.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Mô tả"
        name="description"
        fullWidth
        value={form.description}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Phần trăm giảm (%)"
        name="percentage"
        type="number"
        fullWidth
        value={form.percentage}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
      />

      <TextField
        label="Ngày bắt đầu"
        name="startDate"
        type="date"
        fullWidth
        value={form.startDate?.slice(0, 10)}
        onChange={handleChange}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Ngày kết thúc"
        name="endDate"
        type="date"
        fullWidth
        value={form.endDate?.slice(0, 10)}
        onChange={handleChange}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
        required
      />

      <InputLabel id="books-label">Chọn sách áp dụng</InputLabel>
      <Select
        multiple
        fullWidth
        value={form.books}
        onChange={handleBookChange}
        input={<OutlinedInput label="Books" />}
        renderValue={(selected) =>
          selected
            .map((id) => {
              const book = bookList.find((b) => b._id === id);
              return book ? book.title : id;
            })
            .join(", ")
        }
        sx={{ mb: 2 }}
      >
        {bookList.map((book) => {
          const isInAnotherCampaign =
            disabledBooks.includes(book._id) && !form.books.includes(book._id);
          return (
            <MenuItem
              key={book._id}
              value={book._id}
              disabled={isInAnotherCampaign}
            >
              <Checkbox checked={form.books.includes(book._id)} />
              <ListItemText
                primary={
                  isInAnotherCampaign
                    ? `${book.title} (đã áp dụng)`
                    : book.title
                }
              />
            </MenuItem>
          );
        })}
      </Select>

      <FormControlLabel
        control={
          <Checkbox
            checked={form.isActive}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
        }
        label="Kích hoạt chiến dịch"
      />

      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary">
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/admin/discount-campaigns")}
          sx={{ ml: 2 }}
        >
          Hủy
        </Button>
      </Box>
    </Box>
  );
};

export default CampaignFormPage;
