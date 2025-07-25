import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

import {
  fetchAllUsers,
  changeUserStatus,
  updateUserRole,
} from "../../../services/AdminService/userService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        const all = await fetchAllUsers();
        let filtered = all;

        if (searchEmail) {
          filtered = filtered.filter((u) =>
            u.email.toLowerCase().includes(searchEmail.toLowerCase())
          );
        }
        if (filterActive !== "all") {
          const isActive = filterActive === "active";
          filtered = filtered.filter((u) => u.isActivated === isActive);
        }
        filtered.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        setUsers(filtered);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [searchEmail, filterActive]);

  const handleActiveStatusChange = async (user) => {
    try {
      await changeUserStatus(user._id);
      setUsers((prev) =>
        prev
          .map((u) =>
            u._id === user._id ? { ...u, isActivated: !u.isActivated } : u
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
          )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers((prev) =>
        prev
          .map((u) => (u._id === id ? { ...u, role } : u))
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
          )
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Quản lý Người Dùng
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
          backgroundColor: "#fff",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <TextField
          size="small"
          label="Tìm kiếm email"
          variant="outlined"
          value={searchEmail}
          onChange={(e) => {
            setSearchEmail(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />

        <Select
          size="small"
          value={filterActive}
          onChange={(e) => {
            setFilterActive(e.target.value);
            setPage(0);
          }}
          IconComponent={FilterIcon}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="active">Đang hoạt động</MenuItem>
          <MenuItem value="inactive">Bị vô hiệu</MenuItem>
        </Select>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              {[
                "STT",
                <>
                  <PersonIcon fontSize="small" /> Tên
                </>,
                <>
                  <EmailIcon fontSize="small" /> Email
                </>,
                <>
                  <PhoneIcon fontSize="small" /> SĐT
                </>,
                "Vai trò",
                "Trạng thái",
              ].map((head, i) => (
                <TableCell key={i} sx={{ color: "#fff", fontWeight: 700 }}>
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((u, idx) => (
                <TableRow
                  key={u._id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      sx={{
                        minWidth: 120,
                        "& .MuiSelect-icon": { color: "#5D4037" },
                      }}
                    >
                      <MenuItem value="user">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PersonIcon fontSize="small" /> User
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AdminIcon fontSize="small" /> Admin
                        </Box>
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Tooltip
                          title={u.isActivated ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          <Switch
                            size="small"
                            checked={u.isActivated}
                            onChange={() => handleActiveStatusChange(u)}
                          />
                        </Tooltip>
                      }
                      label={u.isActivated ? "Hoạt động" : "Vô hiệu"}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={users.length}
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
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontWeight: 500,
              },
          }}
        />
      </TableContainer>
    </Box>
  );
}
