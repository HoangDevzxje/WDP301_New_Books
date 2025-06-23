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

export const getCategories = () =>
  apiClient.get("/categories").then((res) => res.data);

export const createCategory = (name) =>
  apiClient.post("/categories", { name }).then((res) => res.data);

export const updateCategory = (id, name) =>
  apiClient.put(`/categories/${id}`, { name }).then((res) => res.data);

export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);

export const getBooks = () => apiClient.get("/books").then((res) => res.data);

export const getBookById = (id) =>
  apiClient.get(`/books/${id}`).then((res) => res.data);

export const createBook = (payload) =>
  apiClient.post("/books", payload).then((res) => res.data);

export const updateBook = (id, payload) =>
  apiClient.put(`/books/${id}`, payload).then((res) => res.data);

export const deleteBook = (id) => apiClient.delete(`/books/${id}`);
