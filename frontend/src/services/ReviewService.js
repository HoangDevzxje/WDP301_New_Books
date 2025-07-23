import axiosInstance from "../utils/axiosInstance";

export const getReviews = async () => {
  const response = await axiosInstance.get(`/review/`);
  return response;
};

export const getReviewById = async (id) => {
  const response = await axiosInstance.get(`/review/${id}`);
  return response;
};

export const postComment = async (reviewId, content) => {
  const response = await axiosInstance.post(`/comment`, {
    reviewId,
    content
  });
  return response;
};

export const getAllComments = async () => {
  const response = await axiosInstance.get(`/comment`);
  return response;
};

export const getCommentsByReviewId = async (reviewId) => {
  const response = await axiosInstance.get(`/comment/review/${reviewId}`);
  return response;
};

export const approveComment = async (id) => {
  const response = await axiosInstance.put(`/comment/approve/${id}`);
  return response;
};

export const deleteComment = async (id) => {
  const response = await axiosInstance.delete(`/comment/${id}`);
  return response;
};