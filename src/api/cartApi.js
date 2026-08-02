import axiosClient from './axiosClient';

/**
 * cartApi.js — Tất cả API calls liên quan đến giỏ hàng
 */

/** Lấy giỏ hàng từ server */
export const getCart = () => axiosClient.get('/cart');

/** Thêm sản phẩm vào giỏ (hoặc cộng thêm số lượng nếu đã có) */
export const addToCartApi = (ID_SanPham, SoLuong = 1) =>
  axiosClient.post('/cart', { ID_SanPham, SoLuong });

/** Cập nhật số lượng sản phẩm */
export const updateCartItemApi = (ID_SanPham, SoLuong) =>
  axiosClient.put(`/cart/${ID_SanPham}`, { SoLuong });

/** Xóa 1 sản phẩm khỏi giỏ */
export const removeCartItemApi = (ID_SanPham) =>
  axiosClient.delete(`/cart/${ID_SanPham}`);

/** Xóa toàn bộ giỏ hàng */
export const clearCartApi = () =>
  axiosClient.delete('/cart');

/**
 * Đồng bộ localStorage cart lên server (gọi sau khi đăng nhập).
 * items: [{ ID_SanPham, SoLuong }]
 */
export const syncCartApi = (items) =>
  axiosClient.post('/cart/sync', { items });
