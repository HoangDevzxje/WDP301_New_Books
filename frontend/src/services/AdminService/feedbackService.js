import apiClient from "./apiClient";

export const fetchAllFeedbacks = () =>
  apiClient.get("/feedbacks").then((res) => res.data);

export const deleteFeedback = (feedbackId) =>
  apiClient.delete(`/feedbacks/${feedbackId}`).then((res) => res.data);

export const fetchFeedbacksByBook = (bookId) =>
  apiClient.get(`/books/${bookId}/feedbacks`).then((res) => res.data);

export const fetchFeedbacksByUser = (userId) =>
  apiClient.get(`/users/${userId}/feedbacks`).then((res) => res.data);
