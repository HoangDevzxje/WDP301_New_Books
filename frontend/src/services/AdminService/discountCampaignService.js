import axiosInstance from "../../utils/axiosInstance";

export const getAllCampaigns = () =>
  axiosInstance.get("/admin/discount-campaigns").then((res) => res.data);

export const createCampaign = (data) =>
  axiosInstance.post("/admin/discount-campaigns", data).then((res) => res.data);

export const updateCampaign = (id, data) =>
  axiosInstance
    .put(`/admin/discount-campaigns/${id}`, data)
    .then((res) => res.data);

export const deleteCampaign = (id) =>
  axiosInstance
    .delete(`/admin/discount-campaigns/${id}`)
    .then((res) => res.data);
export const previewBookConflicts = (payload) =>
  axiosInstance
    .post("/admin/discount-campaigns/check-book-conflicts-preview", payload)
    .then((res) => res.data);
export const checkBookConflicts = (payload) =>
  axiosInstance
    .post("/admin/discount-campaigns/check-book-conflicts", payload)
    .then((res) => res.data);
