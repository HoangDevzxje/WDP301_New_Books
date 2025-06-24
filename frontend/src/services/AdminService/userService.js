import apiClient from "./apiClient";

export const fetchAllUsers = () =>
  apiClient.get("/users").then((res) => res.data);

export const changeUserStatus = (userId) =>
  apiClient.put(`/users/${userId}/change-status`).then((res) => res.data);

export const updateUserRole = (userId, newRole) =>
  apiClient.put(`/users/${userId}`, { role: newRole }).then((res) => res.data);
