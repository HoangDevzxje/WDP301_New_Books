import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9999",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
