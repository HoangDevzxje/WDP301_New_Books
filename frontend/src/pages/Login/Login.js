import { Button, TextField, Divider, Typography, Checkbox, FormControlLabel, Snackbar, Alert, Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  const handleAlert = (message, severity = "info") => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  useEffect(() => {
    if (location.state?.credentials) {
      const { email, password } = location.state.credentials;
      setFormData(prev => ({
        ...prev,
        email,
        password
      }));
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:9999/auth/login", {
        email: formData.email,
        password: formData.password,
      });
  
      const token = response.data.token;
      const userRole = response.data.role;
  
      const storageMethod = formData.rememberMe ? localStorage : sessionStorage;
      
      storageMethod.setItem("token", token);
      storageMethod.setItem("userEmail", formData.email);
      storageMethod.setItem("userRole", userRole);
      
      if (onLoginSuccess) {
        onLoginSuccess(formData.email, userRole);
      }
      
      handleAlert("Đăng nhập thành công!", "success");
      
      setFormData({ email: "", password: "", rememberMe: false });
      
      console.log("User role:", userRole);
      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1000); 
    } catch (error) {
      console.error("Login error:", error);
      handleAlert("Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.", "error");
    }
  };

    return (
    <Box className="login-container">
      <Box className="login-form-container">
        <Typography variant="h4" className="login-title" gutterBottom>
          Đăng nhập
        </Typography>

        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={handleChange}
                name="rememberMe"
              />
            }
            label="Nhớ đăng nhập"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="login-button"
          >
            Đăng Nhập
          </Button>

          <Typography align="center">
            <Link to="/account/forgotpassword" className="forgot-password-link">
              Quên mật khẩu?
            </Link>
          </Typography>

          <Typography align="center" sx={{ mt: 1 }}>
            Nếu bạn chưa có tài khoản,&nbsp;
            <Link to="/account/register" className="register-link">
              đăng ký tại đây
            </Link>
          </Typography>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng nhập bằng
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              className="facebook-button"
            >
              <img
                src="https://www.facebook.com/favicon.ico"
                alt="Facebook icon"
                className="social-icon"
              />
              Facebook
            </Button>
            <Button
              variant="outlined"
              fullWidth
              className="google-button"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google icon"
                className="social-icon"
              />
              Google
            </Button>
          </Box>
        </form>

        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}


export default Login;