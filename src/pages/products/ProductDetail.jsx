import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, StarHalf, Minus, Plus, ShoppingCart, CheckCircle, MapPin, MessageCircle, Store } from 'lucide-react';
import { getPublicProductDetail, getPublicProducts, formatPrice } from '../../api/productPublicApi';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPublicProductDetail(id)
      .then(res => {
        const data = res.data?.data;
        if (!data) { setError('Sản phẩm không tồn tại.'); return; }
        setProduct(data);
      })
      .catch(() => setError('Không thể tải sản phẩm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product?.ID_PhanLoai) {
      getPublicProducts({ ID_PhanLoai: product.ID_PhanLoai, per_page: 5 })
        .then(res => {
          const list = res.data?.data?.data || [];
          setRelatedProducts(list.filter(p => p.ID_SanPham !== product.ID_SanPham).slice(0, 4));
        })
        .catch(() => {});
    }
  }, [product?.ID_PhanLoai, product?.ID_SanPham]);

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.ID_SanPham);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: product.ID_SanPham, name: product.TenSanPham, qty, price: product.Gia });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-change'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    alert("Chuyển đến trang thanh toán (TODO)");
    // navigate('/checkout'); // TODO
  };

  const moveGallery = (dir) => {
    if (!images || images.length === 0) return;
    let nextIndex = activeImg + dir;
    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;
    setActiveImg(nextIndex);
  };

  // ── Gather data ─────────────────────────────────────────────────────────
  const images = product?.hinh_anh || [];
  const mainImageUrl = images.length > 0
    ? (() => {
        const p = images[activeImg]?.HinhAnh || images[0]?.HinhAnh;
        return p?.startsWith('http') ? p : `http://127.0.0.1:8000/storage/${p}`;
      })()
    : null;

  const tinhThanh   = product?.tinh_thanh?.TenTinhThanh || product?.tinhThanh?.TenTinhThanh || '—';
  const phanLoai    = product?.phan_loai?.TenLoai || product?.phanLoai?.TenLoai || '—';
  const shopName    = product?.shop?.TenShop || '—';
  
  // Dummy shop info for demo mapping
  const shopAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(shopName)}&background=D44E28&color=fff`;

  if (loading) return (
    <div className="pd-loading">
      <div className="pd-spinner" />
      <p>Đang tải thông tin sản phẩm...</p>
    </div>
  );

  if (error) return (
    <div className="pd-error-page">
      <span>😕</span>
      <h2>{error}</h2>
      <button onClick={() => navigate('/products')}>← Quay lại danh sách</button>
    </div>
  );

  return (
    <div className="product-detail-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Trang chủ</Link>
        <ChevronRight />
        <Link to="/products">Đặc sản</Link>
        <ChevronRight />
        <span>{product.TenSanPham}</span>
      </div>

      <div className="product-main">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            {images.length > 1 && (
              <div className="gallery-nav">
                <button onClick={() => moveGallery(-1)}><ChevronLeft /></button>
                <button onClick={() => moveGallery(1)}><ChevronRight /></button>
              </div>
            )}
            {mainImageUrl ? (
              <img src={mainImageUrl} alt={product.TenSanPham} />
            ) : (
              <div style={{ padding: '50px', color: '#ccc' }}>Chưa có ảnh</div>
            )}
          </div>
          
          {images.length > 0 && (
            <div className="thumbnail-list">
              {images.map((img, idx) => {
                const thumbUrl = img.HinhAnh?.startsWith('http')
                  ? img.HinhAnh
                  : `http://127.0.0.1:8000/storage/${img.HinhAnh}`;
                return (
                  <div 
                    key={img.ID_HinhAnh || idx} 
                    className={`thumbnail-item ${idx === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(idx)}
                  >
                    <img src={thumbUrl} alt={`${product.TenSanPham} ${idx + 1}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="badge-large">Mới</div>
          <h1>{product.TenSanPham}</h1>
          <div className="product-meta">
            <div className="rating-summary">
              <div className="stars">
                <Star fill="#FFB300" size={18} />
                <Star fill="#FFB300" size={18} />
                <Star fill="#FFB300" size={18} />
                <Star fill="#FFB300" size={18} />
                <Star fill="#FFB300" size={18} />
              </div>
              <span className="review-count">(12 đánh giá)</span>
            </div>
            <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.85rem' }}>Đã bán 250+</span>
          </div>
          
          <div className="product-price">{formatPrice(product.Gia)}</div>
          
          {product.Tittle && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{product.Tittle}</p>
          )}

          <div className="product-attributes">
            <div className="attribute-item">
              <span>Xuất xứ</span>
              <span>{product.NguonGoc || tinhThanh}</span>
            </div>
            <div className="attribute-item">
              <span>Danh mục</span>
              <span>{phanLoai}</span>
            </div>
            <div className="attribute-item">
              <span>Tình trạng</span>
              <span>{(product.SoLuongTon || 0) > 0 ? `Còn hàng (${product.SoLuongTon})` : 'Hết hàng'}</span>
            </div>
            <div className="attribute-item">
              <span>Đơn vị</span>
              <span>{product.Donvi || 'Gói/Hộp'}</span>
            </div>
          </div>

          <div className="purchase-actions">
            <div className="quantity-selector">
              <button 
                className="qty-btn" 
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
              ><Minus size={18} /></button>
              <input 
                type="number" 
                className="qty-input" 
                value={qty} 
                onChange={(e) => {
                  let v = parseInt(e.target.value);
                  if (isNaN(v) || v < 1) v = 1;
                  const max = product.SoLuongTon || 99;
                  if (v > max) v = max;
                  setQty(v);
                }} 
              />
              <button 
                className="qty-btn" 
                onClick={() => setQty(Math.min(product.SoLuongTon || 99, qty + 1))}
                disabled={qty >= (product.SoLuongTon || 99)}
              ><Plus size={18} /></button>
            </div>
            
            <div className="action-buttons">
              <button 
                className="add-to-cart-large" 
                onClick={handleAddToCart}
                disabled={(product.SoLuongTon || 0) === 0}
              >
                <ShoppingCart size={20} />
                {addedToCart ? 'Đã thêm' : 'Thêm vào giỏ hàng'}
              </button>
              <button 
                className="buy-now-btn" 
                onClick={handleBuyNow}
                disabled={(product.SoLuongTon || 0) === 0}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Section */}
      <div className="shop-section">
        <div className="shop-info-main">
          <div className="shop-avatar-wrapper">
            <img src={shopAvatar} className="shop-avatar" alt="Shop Avatar" />
            <div className="shop-badge-premium">Yêu thích</div>
          </div>
          <div className="shop-details">
            <h3>{shopName}</h3>
            <p><CheckCircle size={14} /> Online 5 phút trước</p>
            <p style={{ marginTop: '5px' }}><MapPin size={14} /> {tinhThanh}, Việt Nam</p>
          </div>
        </div>
        <div className="shop-stats">
          <div className="stat-box">
            <span>Đánh giá</span>
            <span>4.9/5</span>
          </div>
          <div className="stat-box">
            <span>Sản phẩm</span>
            <span>85</span>
          </div>
          <div className="stat-box">
            <span>Phản hồi</span>
            <span>98%</span>
          </div>
        </div>
        <div className="shop-actions">
          <button className="btn-chat" onClick={() => alert(`Đang kết nối chat với ${shopName}!`)}>
            <MessageCircle size={18} /> Chat ngay
          </button>
          <button className="btn-shop-outline" onClick={() => navigate(`/shops/${product.shop?.ID_Shop}`)}>
            <Store size={18} /> Xem Shop
          </button>
        </div>
      </div>

      {/* Product Tabs */}
      <section className="product-tabs">
        <div className="tabs-nav">
          <div 
            className={`tab-link ${activeTab === 'description' ? 'active' : ''}`} 
            onClick={() => setActiveTab('description')}
          >Mô tả chi tiết</div>
          <div 
            className={`tab-link ${activeTab === 'reviews' ? 'active' : ''}`} 
            onClick={() => setActiveTab('reviews')}
          >Đánh giá & Bình luận (12)</div>
          <div 
            className={`tab-link ${activeTab === 'shipping' ? 'active' : ''}`} 
            onClick={() => setActiveTab('shipping')}
          >Chính sách vận chuyển</div>
        </div>

        <div className={`tab-content ${activeTab === 'description' ? 'active' : ''}`}>
          <div className="description-text" style={{ maxWidth: '800px', color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {product.MoTa || 'Đang cập nhật mô tả sản phẩm...'}
          </div>
        </div>

        <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
          <div className="reviews-grid">
            <div className="review-stats">
              <div className="big-rating">
                <h2>4.8</h2>
                <div className="stars" style={{ justifyContent: 'center', margin: '0.5rem 0' }}>
                  <Star fill="#FFB300" />
                  <Star fill="#FFB300" />
                  <Star fill="#FFB300" />
                  <Star fill="#FFB300" />
                  <StarHalf fill="#FFB300" />
                </div>
                <p className="review-count">Dựa trên 12 đánh giá</p>
              </div>
              <div className="rating-bars">
                {[
                  { star: 5, pct: 85 },
                  { star: 4, pct: 10 },
                  { star: 3, pct: 5 },
                  { star: 2, pct: 0 },
                  { star: 1, pct: 0 },
                ].map(b => (
                  <div className="bar-item" key={b.star}>
                    <span>{b.star} sao</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${b.pct}%` }}></div>
                    </div>
                    <span>{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reviews-main">
              <div className="comment-form-container">
                <div className="comment-form">
                  <h3>Viết đánh giá của bạn</h3>
                  <div className="star-rating-input">
                    <Star size={24} />
                    <Star size={24} />
                    <Star size={24} />
                    <Star size={24} />
                    <Star size={24} />
                  </div>
                  <div className="form-group">
                    <label>Bình luận</label>
                    <textarea rows="4" placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."></textarea>
                  </div>
                  <button className="submit-comment" onClick={() => alert('Tính năng bình luận đang phát triển (TODO)')}>Gửi đánh giá</button>
                </div>
              </div>

              <div className="review-list">
                <div className="review-item">
                  <div className="review-header">
                    <div className="user-info">
                      <img src="https://ui-avatars.com/api/?name=Nguyễn+Văn+A&background=random" className="user-avatar" alt="User" />
                      <div>
                        <div className="user-name">Nguyễn Văn An</div>
                        <div className="stars">
                          <Star fill="#FFB300" size={14} />
                          <Star fill="#FFB300" size={14} />
                          <Star fill="#FFB300" size={14} />
                          <Star fill="#FFB300" size={14} />
                          <Star fill="#FFB300" size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="review-date">2 ngày trước</div>
                  </div>
                  <p className="review-content">Sản phẩm rất ngon, đóng gói kỹ càng. Giao hàng nhanh hơn dự kiến. Rất hài lòng!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`tab-content ${activeTab === 'shipping' ? 'active' : ''}`}>
          <div className="shipping-info" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <h4>Thời gian giao hàng:</h4>
            <ul>
              <li>Nội thành: 1-2 ngày làm việc.</li>
              <li>Các tỉnh miền Tây: 2-3 ngày làm việc.</li>
              <li>Toàn quốc: 3-5 ngày làm việc.</li>
            </ul>
            <br />
            <h4>Phí vận chuyển:</h4>
            <p>Đồng giá 30.000đ cho đơn hàng dưới 500.000đ. Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên.</p>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products" style={{ marginTop: '6rem' }}>
          <div className="section-header" style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Sản phẩm liên quan</h2>
            <p style={{ color: 'var(--text-muted)' }}>Có thể bạn cũng thích những đặc sản này</p>
          </div>
          
          {/* Note: In a real scenario we'd reuse <ProductCard /> here if it matches the layout or make a simplified grid */}
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {relatedProducts.map(rel => {
              const relImg = rel.hinh_anh && rel.hinh_anh.length > 0 
                ? (rel.hinh_anh[0].HinhAnh.startsWith('http') ? rel.hinh_anh[0].HinhAnh : `http://127.0.0.1:8000/storage/${rel.hinh_anh[0].HinhAnh}`)
                : null;
              
              return (
                <div key={rel.ID_SanPham} className="product-card" onClick={() => navigate(`/products/${rel.ID_SanPham}`)} style={{ cursor: 'pointer' }}>
                  <div className="product-img-wrapper">
                    <img src={relImg} alt={rel.TenSanPham} className="product-img" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  </div>
                  <div className="product-details" style={{ padding: '1rem 0' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{rel.TenSanPham}</h3>
                    <div className="product-origin" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <MapPin size={14} />
                      <span>{rel.NguonGoc || rel.tinh_thanh?.TenTinhThanh || '—'}</span>
                    </div>
                    <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="price" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{formatPrice(rel.Gia)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
