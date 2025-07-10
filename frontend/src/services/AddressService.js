import axiosInstance from "../utils/axiosInstance";
/* ========= CRUD địa chỉ của User =========
 */

export const getAddresses = async (userId) =>
  axiosInstance.get(`/addresses/users/${userId}`);

export const addAddress = async (userId, data) =>
  axiosInstance.post(`/addresses/users/${userId}`, data);

export const updateAddress = async (userId, addrId, data) =>
  axiosInstance.put(`/addresses/users/${userId}/${addrId}`, data);

export const deleteAddress = async (userId, addrId) =>
  axiosInstance.delete(`/addresses/users/${userId}/${addrId}`);

export const setDefaultAddress = async (userId, addrId) =>
  axiosInstance.patch(`/addresses/users/${userId}/${addrId}/default`);
