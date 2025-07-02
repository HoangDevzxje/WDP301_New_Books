import axiosInstance from "../utils/axiosInstance";

export const getProfile = () => axiosInstance.get("/user/profile");

export const updateProfile = (data) => axiosInstance.put("/user/profile", data);

export const changePassword = ({ oldPassword, newPassword }) =>
  axiosInstance.post("/auth/change-password", { oldPassword, newPassword });
