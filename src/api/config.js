/**
 * config.js — Cấu hình URL trung tâm cho toàn bộ Frontend
 *
 * Đặt biến môi trường trong file .env:
 *   VITE_BACKEND_URL=http://127.0.0.1:8000          ← Local
 *   VITE_BACKEND_URL=https://lvtnbackend.onrender.com ← Production
 *
 * Nếu không đặt, mặc định là local (http://127.0.0.1:8000).
 */

// URL gốc của backend (không có dấu / ở cuối)
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

// URL thư mục storage public của Laravel
export const STORAGE_URL = `${BACKEND_URL}/storage`;

/**
 * Chuyển đổi path ảnh từ DB thành URL đầy đủ.
 * @param {string|null} path  - Giá trị lưu trong DB, ví dụ: "products/abc.jpg"
 * @returns {string|null}     - URL đầy đủ hoặc null nếu không có ảnh
 */
export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // đã là URL đầy đủ
  return `${STORAGE_URL}/${path}`;
};

/**
 * Hàm tự động xử lý khi ảnh bị lỗi load (chỉ có trên DB mà không có file local).
 * Sẽ tự động chuyển URL sang server production Render để tải ảnh thật.
 */
export const handleImageError = (e) => {
  const currentSrc = e.target.src;
  const prodStorage = 'https://lvtnbackend.onrender.com/storage';
  
  if (currentSrc && currentSrc.includes('/storage/') && !currentSrc.startsWith(prodStorage)) {
    const parts = currentSrc.split('/storage/');
    const path = parts[parts.length - 1];
    e.target.src = `${prodStorage}/${path}`;
  } else {
    e.target.src = 'https://via.placeholder.com/300x220?text=NamBo+Specialties';
  }
};

