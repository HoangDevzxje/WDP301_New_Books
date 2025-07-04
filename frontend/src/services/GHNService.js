import axiosInstance from "../utils/axiosInstance";

/* ========= GHN master-data ========= */

// Lấy danh sách tỉnh
export const getProvinces = async () => axiosInstance.get("/ghn/province");

// Lấy danh sách huyện theo ProvinceID
export const getDistricts = async (provinceId) =>
  axiosInstance.get("/ghn/district", { params: { provinceID: provinceId } });

// Lấy danh sách xã/phường theo DistrictID
export const getWards = async (districtId) =>
  axiosInstance.get("/ghn/ward", { params: { districtID: districtId } });

/** Tính phí GHN (vd. dùng khi checkout)
 *  payload: { from_district, to_district, to_ward, weight, height, length, width, service_type_id }
 */
export const calculateFee = async (payload) => {
  const response = await axiosInstance.get("/ghn/calculate-fee", {
    params: payload,
  });
  return response.data; // trả về data giống getBookRating()
};
