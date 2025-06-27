import axiosInstance from "../utils/axiosInstance";

export const getBooks = async () => {
  const response = await axiosInstance.get(`/book/`);
  return response;
};

export const getBookRating = async (bookId) => {
  const response = await axiosInstance.get(`/reviews/${bookId}`);
  return response.data;
};

export const getBookById = async (id) => {
  const response = await axiosInstance.get(`/book/${id}`);
  return response;
};

export const getBooksByCategory = async (categoryId) => {
  const response = await axiosInstance.get(`/book/category/${categoryId}`);
  return response;
};