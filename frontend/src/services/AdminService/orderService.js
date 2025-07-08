import axiosInstance from "../../utils/axiosInstance";

export const getOrders = () =>
  axiosInstance.get("/admin/orders").then((res) => res.data);

export const confirmOrder = (orderId) =>
  axiosInstance
    .post(`/admin/orders/confirm/${orderId}`)
    .then((res) => res.data);

export const cancelOrder = (orderId) =>
  axiosInstance
    .put(`/admin/orders/${orderId}/change-status`, {
      orderStatus: "Cancelled",
    })
    .then((res) => res.data);

export const updateBoxInfo = (orderId, boxInfo) =>
  axiosInstance
    .post(`/admin/orders/update-box-info/${orderId}`, { boxInfo })
    .then((res) => res.data);
