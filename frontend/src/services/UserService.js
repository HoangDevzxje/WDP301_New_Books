import axiosInstance from "../utils/axiosInstance";

export const getProfile = () => axiosInstance.get("/user/profile");

export const updateProfile = (data) => axiosInstance.put("/user/profile", data);

export const changePassword = ({ oldPassword, newPassword }) =>
  axiosInstance.post("/auth/change-password", { oldPassword, newPassword });

export const sendOTP = (email, type = "reset-password") =>
  axiosInstance.post("/auth/send-otp", { email, type });

export const verifyOTP = (email, otp, type = "reset-password") =>
  axiosInstance.post("/auth/verify-otp", { email, otp, type });

export const resetPassword = (email, newPassword) =>
  axiosInstance.post("/auth/reset-password", { email, newPassword });

export const getComplaints = () => axiosInstance.get("/user/complaint");

export const submitComplaint = (data) =>
  axiosInstance.post("/user/complaint", data);

export const cancelComplaint = (id) =>
  axiosInstance.delete(`/user/complaint/${id}`);
