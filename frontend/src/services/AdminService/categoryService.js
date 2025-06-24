import apiClient from "./apiClient";

export const getCategories = () =>
  apiClient.get("/categories").then((res) => res.data);

export const createCategory = (name) =>
  apiClient.post("/categories", { name }).then((res) => res.data);

export const updateCategory = (id, name) =>
  apiClient.put(`/categories/${id}`, { name }).then((res) => res.data);

export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);
