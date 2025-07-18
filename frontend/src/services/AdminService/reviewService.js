import axiosInstance from "../../utils/axiosInstance";

export const createReview = (formData) =>
  axiosInstance
    .post("/review", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);

export const getAllReviews = () =>
  axiosInstance.get("/review").then((res) => res.data);

export const updateReview = (id, body) =>
  axiosInstance.put(`/review/${id}`, body).then((res) => res.data);

export const deleteReview = (id) =>
  axiosInstance.delete(`/review/${id}`).then((res) => res.data);
