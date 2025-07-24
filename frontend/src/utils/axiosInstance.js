import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AuthService from "../services/AuthService";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL_BACKEND,
});

const getStorageMethod = () => {
  if (localStorage.getItem("access_token")) return localStorage;
  if (sessionStorage.getItem("access_token")) return sessionStorage;
  return sessionStorage;
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (err) {
    return true;
  }
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    const storage = getStorageMethod();

    if (token) {
      if (isTokenExpired(token)) {
        try {
          console.log("Token hết hạn, đang refresh...");
          const newTokenData = await AuthService.refreshAccessToken();
          token = newTokenData.access_token;

          storage.setItem("access_token", token);
        } catch (error) {
          console.error("Refresh token failed:", error);
          storage.clear();
          window.location.href = "/account/login";
          throw error;
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (dự phòng)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const storage = getStorageMethod();

      try {
        console.log("Token hết hạn, đang refresh... dự phòng");
        const newTokenData = await AuthService.refreshAccessToken();
        const token = newTokenData.access_token;

        if (token) {
          storage.setItem("access_token", token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        storage.clear();
        window.location.href = "/account/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
