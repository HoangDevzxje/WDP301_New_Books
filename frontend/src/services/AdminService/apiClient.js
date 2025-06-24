import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:9999/admin",
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
