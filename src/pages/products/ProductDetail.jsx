import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, StarHalf, Minus, Plus, ShoppingCart, CheckCircle, MapPin, MessageCircle, Store } from 'lucide-react';
import { getPublicProductDetail, getPublicProducts, formatPrice, getProductReviews, createProductReview } from '../../api/productPublicApi';
import axiosClient from '../../api/axiosClient';
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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [eligibleItem, setEligibleItem] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = () => {
    setReviewsLoading(true);
    getProductReviews(id)
      .then(res => {
        setReviews(res.data?.data || []);
      })
      .catch(err => console.error("Lỗi tải đánh giá:", err))
      .finally(() => setReviewsLoading(false));
  };

  const checkEligibility = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setEligibleItem(null);
      return;
    }
    try {
      const res = await axiosClient.get('/don-hang');
      const orders = res.data?.data?.data || [];
      const completedOrders = orders.filter(o => Number(o.TrangThai) === 3);
      
      let foundItem = null;
      for (const order of completedOrders) {
        const item = order.chi_tiet?.find(det => Number(det.ID_SanPham) === Number(id));
        if (item) {
          const reviewsRes = await getProductReviews(id);
          const currentReviews = reviewsRes.data?.data || [];
          const alreadyReviewed = currentReviews.some(rev => Number(rev.ID_ChiTiet) === Number(item.ID_ChiTiet));
          
          if (!alreadyReviewed) {
            foundItem = item;
            break;
          }
        }
      }
      setEligibleItem(foundItem);
    } catch (e) {
      console.error("Lỗi kiểm tra quyền đánh giá:", e);
      setEligibleItem(null);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [id]);

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
      const hinhAnhUrl = product.hinh_anh && product.hinh_anh.length > 0 ? product.hinh_anh[0].HinhAnh : null;
      cart.push({ 
        id: product.ID_SanPham, 
        name: product.TenSanPham, 
        qty, 
        price: product.Gia,
        HinhAnh: hinhAnhUrl,
        ID_Shop: product.shop?.ID_Shop || 'shop_0',
        TenShop: product.shop?.TenShop || 'Gian hàng đặc sản'
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-change'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!eligibleItem) {
      alert("Bạn không có đơn hàng hoàn tất nào đủ điều kiện để đánh giá sản phẩm này.");
      return;
    }
    setSubmittingReview(true);
    
    const formData = new FormData();
    formData.append('ID_ChiTiet', eligibleItem.ID_ChiTiet);
    formData.append('ID_SanPham', id);
    formData.append('XepLoai', ratingInput);
    formData.append('BinhLuan', commentInput);
    if (imageFile) {
      formData.append('HinhAnh', imageFile);
    }

    try {
      const res = await createProductReview(formData);
      if (res.data?.success) {
        alert("Gửi đánh giá sản phẩm thành công!");
        setCommentInput('');
        setImageFile(null);
        setRatingInput(5);
        fetchReviews();
        checkEligibility();
      } else {
        alert(res.data?.message || "Gửi đánh giá thất bại.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gửi đánh giá thất bại do lỗi hệ thống.");
    } finally {
      setSubmittingReview(false);
    }
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

  // Tính trung bình rating và phần trăm sao
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.XepLoai), 0) / totalReviews).toFixed(1)
    : 0;

  const starPercentages = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Number(r.XepLoai) === star).length;
    return {
      star,
      pct: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    };
  });

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
          >Đánh giá & Bình luận ({totalReviews})</div>
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
                <h2>{averageRating}</h2>
                <div className="stars" style={{ justifyContent: 'center', margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => {
                    const diff = averageRating - s;
                    if (diff >= 0) return <Star key={s} fill="#FFB300" stroke="#FFB300" size={16} />;
                    if (diff > -1) return <StarHalf key={s} fill="#FFB300" stroke="#FFB300" size={16} />;
                    return <Star key={s} stroke="#FFB300" size={16} />;
                  })}
                </div>
                <p className="review-count">Dựa trên {totalReviews} đánh giá</p>
              </div>
              <div className="rating-bars">
                {starPercentages.map(b => (
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
              {eligibleItem ? (
                <div className="comment-form-container" style={{ marginBottom: '2rem' }}>
                  <form className="comment-form" onSubmit={handleReviewSubmit}>
                    <h3>Viết đánh giá của bạn</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Đánh giá cho đơn hàng <strong>{eligibleItem.don_hang?.MaDonHangCon || `#${eligibleItem.ID_DonHang}`}</strong>
                    </p>
                    <div className="star-rating-input" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={24} 
                          fill={star <= ratingInput ? "#FFB300" : "none"} 
                          stroke="#FFB300"
                          onClick={() => setRatingInput(star)}
                        />
                      ))}
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Bình luận *</label>
                      <textarea 
                        rows="4" 
                        required
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                      ></textarea>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Hình ảnh thực tế</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        style={{ display: 'block', width: '100%' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="submit-comment"
                      disabled={submittingReview}
                      style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                </div>
              ) : null}

              <div className="review-list">
                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sản phẩm này chưa có đánh giá nào.</div>
                ) : (
                  reviews.map((rev) => (
                    <div className="review-item" key={rev.ID_DanhGia} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                      <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.HoTen || 'K')}&background=random`} 
                            className="user-avatar" 
                            alt="User" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                          />
                          <div>
                            <div className="user-name" style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>{rev.user?.HoTen || 'Khách hàng ẩn danh'}</div>
                            <div className="stars" style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={14} 
                                  fill={star <= rev.XepLoai ? "#FFB300" : "none"} 
                                  stroke="#FFB300"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="review-date" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {rev.NgayDanhGia ? new Date(rev.NgayDanhGia).toLocaleDateString('vi-VN') : '—'}
                        </div>
                      </div>
                      
                      <p className="review-content" style={{ margin: '0.5rem 0', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                        {rev.BinhLuan || 'Không có bình luận.'}
                      </p>

                      {rev.HinhAnh && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img 
                            src={`http://127.0.0.1:8000/storage/${rev.HinhAnh}`} 
                            alt="Hình ảnh thực tế từ khách hàng" 
                            style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}

                      {/* Phản hồi từ Shop nếu có */}
                      {rev.phan_hoi && (
                        <div style={{ marginTop: '1rem', background: '#F8F5F1', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--gold)' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-dark)' }}>
                            🏪 Phản hồi từ người bán:
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {rev.phan_hoi.NoiDungPhanHoi}
                          </p>
                          <small style={{ display: 'block', marginTop: '6px', color: 'rgba(0,0,0,0.3)', fontSize: '0.75rem' }}>
                            {new Date(rev.phan_hoi.NgayPhanHoi).toLocaleDateString('vi-VN')}
                          </small>
                        </div>
                      )}
                    </div>
                  ))
                )}
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
