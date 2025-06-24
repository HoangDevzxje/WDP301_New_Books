import apiClient from "./apiClient";

export const getBooks = () => apiClient.get("/books").then((res) => res.data);

export const getBookById = (id) =>
  apiClient.get(`/books/${id}`).then((res) => res.data);

export const createBook = (payload) =>
  apiClient.post("/books", payload).then((res) => res.data);

export const updateBook = (id, payload) =>
  apiClient.put(`/books/${id}`, payload).then((res) => res.data);

export const deleteBook = (id) => apiClient.delete(`/books/${id}`);
