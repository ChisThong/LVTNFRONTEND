import axiosClient from "./axiosClient";
export const getBaiVietById = (id) => {
    return axiosClient.get(`/BlogControl/${id}`);
}
export const getBanDoDacSan = (params = {}) => {
    return axiosClient.get('/bando', { params });
}