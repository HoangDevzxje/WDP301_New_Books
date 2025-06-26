import axiosInstance from "../../utils/axiosInstance";

export const getBooks = () =>
  axiosInstance.get("/admin/books").then((res) => res.data);

export const getBookById = (id) =>
  axiosInstance.get(`/admin/books/${id}`).then((res) => res.data);

export const createBook = (formData) =>
  axiosInstance
    .post("/admin/books", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);

export const updateBook = (id, formData) =>
  axiosInstance
    .put(`/admin/books/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);

export const deleteBook = (id) =>
  axiosInstance.delete(`/admin/books/${id}`).then((res) => res.data);
