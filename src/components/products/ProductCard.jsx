import { Link } from 'react-router-dom';
import { getProductImageUrl, formatPrice } from '../../api/productPublicApi';
import './ProductCard.css';

/* ── Badge presets — luân phiên màu ── */
const BADGE_PRESETS = [
  { label: 'Bán chạy',  bg: '#D4A373', color: '#4B3A1C' },
  { label: 'Đặc biệt',  bg: '#8B7355', color: '#fff'    },
  { label: 'Mới',       bg: '#6B8E5E', color: '#fff'    },
  { label: 'Gia truyền',bg: '#C17C5A', color: '#fff'    },
  { label: 'Hữu cơ',   bg: '#7BAE7F', color: '#fff'    },
  { label: 'Cao cấp',   bg: '#5B6F7C', color: '#fff'    },
  { label: 'Tự nhiên',  bg: '#A8C686', color: '#3D2B1F' },
  { label: 'Mùa vụ',   bg: '#E08A3A', color: '#fff'    },
];

export default function ProductCard({ product, index = 0, onAddToCart }) {
  const imageUrl = getProductImageUrl(product);
  const price    = formatPrice(product?.Gia);

  const badge = BADGE_PRESETS[index % BADGE_PRESETS.length];

  /* Mapping dữ liệu backend */
  const tinhThanh   = product?.tinh_thanh?.TenTinhThanh
                   || product?.tinhThanh?.TenTinhThanh
                   || 'Miền Nam';
  const phanLoai    = product?.phan_loai?.TenLoai
                   || product?.phanLoai?.TenLoai
                   || '';
  /* Tittle = mô tả ngắn, MoTa = mô tả dài — ưu tiên Tittle */
  const description = product?.Tittle || product?.MoTa || '';

  return (
    <div className="product-card">

      {/* Badge nằm trên ảnh */}
      <div
        className="product-badge"
        style={{ background: badge.bg, color: badge.color }}
      >
        {badge.label}
      </div>

      {/* Ảnh — aspect-ratio 1:1 theo demo specialties page */}
      <Link to={`/products/${product.ID_SanPham}`} className="product-img-link">
        <div className="product-img-wrapper">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.TenSanPham}
              className="product-img"
              loading="lazy"
            />
          ) : (
            <div className="product-img-placeholder">
              <span>🍃</span>
              <small>Chưa có ảnh</small>
            </div>
          )}
        </div>
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="product-details">
        <Link to={`/products/${product.ID_SanPham}`} style={{ textDecoration: 'none' }}>
          <h3>{product.TenSanPham}</h3>
        </Link>

        {/* Tỉnh thành + phân loại */}
        <div className="product-origin">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{tinhThanh}</span>
          {phanLoai && (
            <span className="product-cat-tag">{phanLoai}</span>
          )}
        </div>

        {/* Mô tả 2 dòng */}
        <p className="product-description">{description}</p>

        {/* Footer: giá + nút thêm giỏ */}
        <div className="product-footer">
          <span className="price">{price}</span>
          <button
            className="add-to-cart"
            onClick={() => onAddToCart && onAddToCart(product)}
            title="Thêm vào giỏ hàng"
            aria-label="Thêm vào giỏ hàng"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
