import axiosInstance from "../../utils/axiosInstance";

export const fetchAllUsers = () =>
  axiosInstance.get("/admin/users").then((res) => res.data);

export const changeUserStatus = (userId) =>
  axiosInstance
    .put(`/admin/users/${userId}/change-status`)
    .then((res) => res.data);

export const updateUserRole = (userId, newRole) =>
  axiosInstance
    .put(`/admin/users/${userId}`, { role: newRole })
    .then((res) => res.data);
