import axiosInstance from "../utils/axiosInstance";

export const getWishlist = async () => {
  const response = await axiosInstance.get(`/user/wishlist`);
  return response;
};

export const addToWishlist = async (bookId) => {
  const response = await axiosInstance.post(`/user/wishlist/${bookId}`);
  return response;
};

export const deleteFromWishlist = async (bookId) => {
  const response = await axiosInstance.delete(`/user/wishlist/${bookId}`);
  return response;
};
