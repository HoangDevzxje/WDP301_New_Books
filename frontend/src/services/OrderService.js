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

export const getPaymentReturn = async (queryParams = {}) => {
  const response = await axiosInstance.get("/payment/return", {
    params: queryParams,
  });
  return response;
};
