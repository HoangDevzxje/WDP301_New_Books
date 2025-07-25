import axiosInstance from "../utils/axiosInstance";

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post("/order/create", orderData);
  return response;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get("/order/my-orders");
  return response;
};

export const getOrderDetails = async (orderId) => {
  const response = await axiosInstance.get(`/order/details/${orderId}`);
  return response;
};

export const createPayment = async (orderId) => {
  const response = await axiosInstance.post("/payment/create", { orderId });
  return response;
};

export const cancelOrder = async (orderId) => {
  const res = await axiosInstance.put(`/order/cancel/${orderId}`);
  return res;
};

export const getPaymentReturn = async (queryString = "") => {
  const params = Object.fromEntries(new URLSearchParams(queryString));
  const response = await axiosInstance.get("/payment/return", {
    params,
  });
  return response;
};
// Lấy chi tiết trạng thái GHN cho 1 đơn
export const getGhnTracking = async (orderId) => {
  const response = await axiosInstance.get(`/ghn/tracking/${orderId}`);
  return response.data.data;
};
