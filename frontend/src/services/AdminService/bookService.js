import axiosInstance from "../../utils/axiosInstance";

export const getBooks = () =>
  axiosInstance.get("/admin/books").then((res) => res.data);

export const getBookById = (id) =>
  axiosInstance.get(`/admin/books/${id}`).then((res) => res.data);

export const createBook = (payload) =>
  axiosInstance.post("/admin/books", payload).then((res) => res.data);

export const updateBook = (id, payload) =>
  axiosInstance.put(`/admin/books/${id}`, payload).then((res) => res.data);

export const deleteBook = (id) =>
  axiosInstance.delete(`/admin/books/${id}`).then((res) => res.data);
