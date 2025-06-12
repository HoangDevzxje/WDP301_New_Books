import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import BreadcrumbsNav from "./Breadscumb";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import "./AdminLayout.css";

const AdminLayout = ({ userEmail, updateUserEmail }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userRole");

    updateUserEmail(null);
    navigate("/account/login");
  };

  return (
    <Box className="admin-layout">
      {/* Sidebar */}
      <Box
        className="admin-sidebar"
        sx={{
          width: isSidebarOpen ? "240px" : "64px",
          transition: "width 0.3s",
          backgroundColor: theme.palette.background.paper,
          boxShadow: 2,
        }}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} />
      </Box>

      {/* Main Content */}
      <Box className="admin-main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper className="admin-header" elevation={3}>
          <Box className="admin-header-left">
            <IconButton onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
            <BreadcrumbsNav />
          </Box>

          <Box className="admin-header-right">
            <Typography variant="body1" fontWeight={600}>
              {userEmail || "Guest"}
            </Typography>
            {userEmail && (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ borderRadius: 2 }}
              >
                Đăng xuất
              </Button>
            )}
          </Box>
        </Paper>

        <Box className="admin-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
