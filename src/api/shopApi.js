import axiosClient from './axiosClient';

/**
 * POST /api/seller/shop/register
 * Gửi FormData (có file logo/baner)
 */
export const registerShop = (formData) => {
  return axiosClient.post('/seller/shop/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * GET /api/seller/shop
 * Lấy thông tin shop của user hiện tại
 */
export const getMyShop = () => {
  return axiosClient.get('/seller/shop');
};

/**
 * PUT /api/seller/shop
 * Cập nhật thông tin shop (có thể kèm file logo/baner)
 * Laravel nhận PUT với FormData cần dùng POST + _method=PUT
 */
export const updateShop = (formData) => {
  // Laravel không hỗ trợ multipart PUT natively → dùng POST + _method override
  formData.append('_method', 'PUT');
  return axiosClient.post('/seller/shop', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
