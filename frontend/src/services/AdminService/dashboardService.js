import axiosInstance from "../../utils/axiosInstance";

export const getDashboardStats = () =>
  axiosInstance.get("/admin/dashboard").then((res) => res.data);
