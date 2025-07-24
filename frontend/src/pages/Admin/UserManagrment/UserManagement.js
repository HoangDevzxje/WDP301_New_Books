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
  Switch,
  FormControlLabel,
  InputAdornment,
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterActive, setFilterActive] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, [searchEmail, filterActive]);

  const fetchUsers = async () => {
    try {
      const allUsers = await fetchAllUsers();

      let filtered = allUsers;
      if (searchEmail) {
        filtered = filtered.filter((u) =>
          u.email.toLowerCase().includes(searchEmail.toLowerCase())
        );
      }
      if (filterActive !== "all") {
        const isActive = filterActive === "active";
        filtered = filtered.filter((u) => u.isActivated === isActive);
      }

      // Sort users by name alphabetically (A-Z)
      filtered = filtered.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setUsers(filtered);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleActiveStatusChange = async (user) => {
    try {
      await changeUserStatus(user._id);
      setUsers((prev) => {
        const updatedUsers = prev.map((u) =>
          u._id === user._id ? { ...u, isActivated: !u.isActivated } : u
        );
        // Maintain alphabetical sorting after status change
        return updatedUsers.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      });
    } catch (err) {
      console.error("Error changing user status:", err.response?.data || err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) => {
        const updatedUsers = prev.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        );
        // Maintain alphabetical sorting after role change
        return updatedUsers.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      });
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4">Quản lý Người Dùng</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          marginBottom: 3,
          alignItems: "center",
          backgroundColor: "#fff",
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <TextField
          label="Tìm kiếm email"
          variant="outlined"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          variant="outlined"
          sx={{ width: 250 }}
          IconComponent={FilterIcon}
        >
          <MenuItem value="all">Tất cả người dùng</MenuItem>
          <MenuItem value="active">Người dùng đang hoạt động</MenuItem>
          <MenuItem value="inactive">Người dùng bị vô hiệu hóa</MenuItem>
        </Select>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2c3e50" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>STT</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon fontSize="small" /> Tên
                </Box>
              </TableCell>

              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" /> Email
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" /> SĐT
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Vai trò
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user, index) => (
                <TableRow
                  key={user._id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
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
                          title={user.isActivated ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          <Switch
                            checked={user.isActivated}
                            onChange={() => handleActiveStatusChange(user)}
                            color="primary"
                          />
                        </Tooltip>
                      }
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {user.isActivated ? (
                            <>
                              <span>Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <span>Vô hiệu</span>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
};

export default UserManagement;
