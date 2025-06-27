import axiosInstance from "../utils/axiosInstance";

export const getUserFeedbackForBook = async (bookId) => {
  const response = await axiosInstance.get(`/user/${bookId}`);
  return response;
};

export const createFeedback = async (bookId, feedbackData) => {
  const response = await axiosInstance.post(`/${bookId}`, feedbackData);
  return response;
};

export const getAllFeedbacksForBook = async (bookId) => {
  const response = await axiosInstance.get(`/${bookId}`);
  return response;
};

export const updateFeedback = async (feedbackId, updatedData) => {
  const response = await axiosInstance.put(`/update/${feedbackId}`, updatedData);
  return response;
};

export const deleteFeedback = async (feedbackId) => {
  const response = await axiosInstance.delete(`/delete/${feedbackId}`);
  return response;
};
