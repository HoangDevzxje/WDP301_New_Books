import axiosInstance from "../utils/axiosInstance";

export const getCategories = async () => {
  const response = await axiosInstance.get(`/category`);
  return response;
};

export const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`/category/${id}`);
  return response;
};
