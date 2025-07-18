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

export const getNewBook = async() => {
  const response = await axiosInstance.get(`/book/new-book`);
  return response;
}

export const getSalesBook = async() => {
  const response = await axiosInstance.get(`/book/sales`);
  return response;
}

export const getBooksByAuthor = async (author) => {
  const response = await axiosInstance.get(`/book/author/${author}`);
  return response;
};

export const getBookByPublisher = async (publisher) => {
  const response = await axiosInstance.get(`/book/publisher/${publisher}`);
  return response;
};

export const getBestSellers = async () => {
  const response = await axiosInstance.get(`/book/best-seller`);
  return response;
};