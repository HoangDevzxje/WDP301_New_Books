import axiosInstance from "../../utils/axiosInstance";

export const getCategories = () =>
  axiosInstance.get("/admin/categories").then((res) => res.data);

export const createCategory = (name) =>
  axiosInstance.post("/admin/categories", { name }).then((res) => res.data);

export const updateCategory = (id, name) =>
  axiosInstance
    .put(`/admin/categories/${id}`, { name })
    .then((res) => res.data);

export const deleteCategory = (id) =>
  axiosInstance.delete(`/admin/categories/${id}`);
