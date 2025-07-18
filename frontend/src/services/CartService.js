import axiosInstance from "../utils/axiosInstance";

export const getCart = async () => {
  const response = await axiosInstance.get(`/cart`);
  return response;
};

export const addToCart = async (bookData) => {
  const response = await axiosInstance.post(`/cart/add`, bookData);
  return response;
};

export const updateCart = async (bookData) => {
  const response = await axiosInstance.put(`/cart/update`, bookData);
  return response;
};

export const removeFromCart = async (bookId) => {
  const response = await axiosInstance.delete(`/cart/remove/${bookId}`);
  return response;
};
