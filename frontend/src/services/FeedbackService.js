import axiosInstance from "../utils/axiosInstance";

export const getUserFeedbackForBook = async (bookId) => {
  const response = await axiosInstance.get(`/feedback/user/${bookId}`);
  return response;
};

export const createFeedback = async (bookId, feedbackData) => {
  const response = await axiosInstance.post(`/feedback/${bookId}`, feedbackData);
  return response;
};

export const getAllFeedbacksForBook = async (bookId) => {
  const response = await axiosInstance.get(`/feedback/${bookId}`);
  return response;
};

export const updateFeedback = async (feedbackId, updatedData) => {
  const response = await axiosInstance.put(`/feedback/update/${feedbackId}`, updatedData);
  return response;
};

export const deleteFeedback = async (feedbackId) => {
  const response = await axiosInstance.delete(`/feedback/delete/${feedbackId}`);
  return response;
};
