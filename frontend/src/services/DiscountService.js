
import axiosInstance from "../utils/axiosInstance";

export const getSuitableDiscounts = async (amount) => {
  const response = await axiosInstance.get(`/discount/suitable`, {
    params: { amount },
  });
  return response;
};
