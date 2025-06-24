import axiosInstance from "../../utils/axiosInstance";

export const fetchAllFeedbacks = () =>
  axiosInstance.get("/admin/feedbacks").then((res) => res.data);

export const deleteFeedback = (feedbackId) =>
  axiosInstance
    .delete(`/admin/feedbacks/${feedbackId}`)
    .then((res) => res.data);

export const fetchFeedbacksByBook = (bookId) =>
  axiosInstance.get(`/admin/books/${bookId}/feedbacks`).then((res) => res.data);

export const fetchFeedbacksByUser = (userId) =>
  axiosInstance.get(`/admin/users/${userId}/feedbacks`).then((res) => res.data);
