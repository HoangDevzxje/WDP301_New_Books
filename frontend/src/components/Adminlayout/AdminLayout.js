import React, { useState, useEffect } from "react";
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

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const email =
      localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userRole");

    setUserEmail(null);
    navigate("/account/login");
  };

  return (
    <Box className="admin-layout">
      <Box
        className="admin-sidebar"
        sx={{
          width: isSidebarOpen ? 240 : 64,
          transition: "width 0.3s",
          backgroundColor: theme.palette.background.paper,
          boxShadow: 2,
        }}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} />
      </Box>
      <Box className="admin-main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper className="admin-header" elevation={3}>
          <Box className="admin-header-left" display="flex" alignItems="center">
            <IconButton onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
            <BreadcrumbsNav />
          </Box>

          <Box
            className="admin-header-right"
            display="flex"
            alignItems="center"
          >
            <Typography variant="body1" fontWeight={600} sx={{ mr: 2 }}>
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
}
