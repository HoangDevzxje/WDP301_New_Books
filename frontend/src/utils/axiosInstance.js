import axios from "axios";
import AuthService from "../services/AuthService";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL_BACKEND,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      const refreshToken = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
      if (!refreshToken) {
        return Promise.reject(error); 
      }

      originalRequest._retry = true;

      try {
        const newToken = await AuthService.refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/account/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
