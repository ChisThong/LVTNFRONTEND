import axiosClient from './axiosClient';

/**
 * GET /api/products  — Public, không cần token
 * Hỗ trợ filter: search, ID_PhanLoai, ID_TinhThanh, gia_min, gia_max, sort_by, sort_dir, per_page
 */
export const getPublicProducts = (params = {}) => {
  return axiosClient.get('/products', { params });
};

/**
 * GET /api/products/{id}  — Public
 */
export const getPublicProductDetail = (id) => {
  return axiosClient.get(`/products/${id}`);
};

/**
 * GET /api/shops/{id}  — Public
 */
export const getPublicShopDetail = (id) => {
  return axiosClient.get(`/shops/${id}`);
};

/**
 * GET /api/phan-loai  — Public, lấy danh mục
 */
export const getPhanLoai = () => {
  return axiosClient.get('/phan-loai');
};

/**
 * GET /api/tinh-thanh  — Public, lấy tỉnh thành
 */
export const getTinhThanh = () => {
  return axiosClient.get('/tinh-thanh');
};

/**
 * Helper: lấy URL ảnh đầu tiên của sản phẩm
 * Backend lưu path dạng: "products/xxx.jpg"
 * → storage public: http://127.0.0.1:8000/storage/products/xxx.jpg
 */
export const getProductImageUrl = (product) => {
  if (product?.hinh_anh && product.hinh_anh.length > 0) {
    const path = product.hinh_anh[0].HinhAnh;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }
  return null;
};

/**
 * Helper: format giá tiền VNĐ
 */
export const formatPrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num)) return '—';
  return num.toLocaleString('vi-VN') + 'đ';
};

/**
 * GET /api/products/{id}/reviews  — Public, lấy danh sách đánh giá
 */
export const getProductReviews = (id) => {
  return axiosClient.get(`/products/${id}/reviews`);
};

/**
 * POST /api/reviews  — Protected, gửi đánh giá mới
 */
export const createProductReview = (data) => {
  return axiosClient.post('/reviews', data);
};

