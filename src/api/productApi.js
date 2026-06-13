import axiosClient from './axiosClient';

/**
 * GET /api/products?ID_Shop={shopId}
 * Lấy danh sách sản phẩm của shop seller (lọc theo ID_Shop)
 * Backend index() hỗ trợ filter ?ID_Shop=...
 * Lưu ý: backend chỉ trả về TrangThai=1, seller cần xem cả ẩn
 * nên ta fetch tất cả theo shopId (kể cả TrangThai=0 sẽ hiện trong list)
 */
export const getSellerProducts = (shopId, params = {}) => {
  return axiosClient.get('/products', {
    params: { ID_Shop: shopId, per_page: 100, ...params },
  });
};

/**
 * GET /api/products/{id}
 * Lấy chi tiết một sản phẩm
 */
export const getProductDetail = (id) => {
  return axiosClient.get(`/products/${id}`);
};

/**
 * POST /api/products
 * Tạo sản phẩm mới — gửi multipart/form-data (có thể kèm file ảnh)
 * Backend: StoreProductRequest — required: TenSanPham, Gia, SoLuongTon, ID_Shop, ID_PhanLoai
 */
export const createProduct = (formData) => {
  return axiosClient.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * PUT /api/products/{id}
 * Cập nhật sản phẩm — Laravel không nhận multipart PUT
 * → dùng POST + _method=PUT
 * Nếu muốn xoá ảnh: thêm xoa_hinh_anh[] = [id1, id2, ...]
 */
export const updateProduct = (id, formData) => {
  formData.append('_method', 'PUT');
  return axiosClient.post(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * DELETE /api/products/{id}
 * Ngừng bán sản phẩm (soft delete — chỉ set TrangThai = 0)
 */
export const deleteProduct = (id) => {
  return axiosClient.delete(`/products/${id}`);
};
