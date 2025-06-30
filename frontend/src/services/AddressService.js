
import axiosInstance from "../utils/axiosInstance";

/* ========= GHN master-data ========= */

/** Lấy tất cả tỉnh/thành */
export const getProvinces = async () => {
  const response = await axiosInstance.get("/ghn/province");
  return response; // giữ nguyên response như getBooks()
};

/** Lấy quận/huyện theo provinceId */
export const getDistricts = async (provinceId) => {
  const response = await axiosInstance.get("/ghn/district", {
    params: { provinceId }, // ?provinceId=202
  });
  return response;
};

/** Lấy phường/xã theo districtId */
export const getWards = async (districtId) => {
  const response = await axiosInstance.get("/ghn/ward", {
    params: { districtId }, // ?districtId=1442
  });
  return response;
};

/** Tính phí GHN (vd. dùng khi checkout)
 *  payload: { from_district, to_district, to_ward, weight, height, length, width, service_type_id }
 */
export const calculateFee = async (payload) => {
  const response = await axiosInstance.get("/ghn/calculate-fee", {
    params: payload,
  });
  return response.data; // trả về data giống getBookRating()
};

/* ========= CRUD địa chỉ của User =========
*/

export const getAddresses = async (userId) =>
  axiosInstance.get(`/users/${userId}/addresses`);

export const addAddress = async (userId, data) =>
  axiosInstance.post(`/users/${userId}/addresses`, data);

export const updateAddress = async (userId, addrId, data) =>
  axiosInstance.put(`/users/${userId}/addresses/${addrId}`, data);

export const deleteAddress = async (userId, addrId) =>
  axiosInstance.delete(`/users/${userId}/addresses/${addrId}`);

export const setDefaultAddress = async (userId, addrId) =>
  axiosInstance.patch(`/users/${userId}/addresses/${addrId}/default`);
