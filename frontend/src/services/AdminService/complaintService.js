import axiosInstance from "../../utils/axiosInstance";

export const getComplaints = () =>
  axiosInstance.get("/admin/complaints").then((res) => res.data.data);

export const updateComplaintStatus = (id, status) =>
  axiosInstance
    .put(`/admin/complaints/${id}`, { status })
    .then((res) => res.data);
