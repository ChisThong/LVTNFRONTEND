import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, AlertTriangle, ShieldCheck, CheckCircle2, 
  MapPin, MessageCircle, UserPlus, UserCheck, Star, 
  ShoppingBag, Users, Calendar, MessageSquareText, 
  CreditCard, LayoutGrid, BookOpenCheck, Inbox, Leaf, 
  ThumbsUp, Truck, Plus, Check 
} from 'lucide-react';
import { getPublicShopDetail, formatPrice, getPublicShopReviews } from '../../api/productPublicApi';
import './ShopDetail.css';

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('grid-showcase');
  const [followed, setFollowed] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  // Các State phục vụ quản lý đánh giá của Shop
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPublicShopDetail(id)
      .then(res => {
        const data = res.data?.data;
        if (!data) {
          setError('Không tìm thấy gian hàng này!');
          return;
        }
        setShop(data);
      })
      .catch(() => setError('Không thể tải thông tin gian hàng. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Effect: Tải số lượng đánh giá của Shop để hiển thị trên Tab Button khi đổi Shop
  useEffect(() => {
    if (!id) return;
    getPublicShopReviews(id, 1)
      .then(res => {
        const resData = res.data?.data;
        if (resData) {
          setReviewsCount(resData.total || 0);
        }
      })
      .catch(err => console.error("Lỗi khi lấy số lượng đánh giá của shop:", err));
  }, [id]);

  // Effect: Tải dữ liệu đánh giá chi tiết (và có phân trang) khi chuyển sang Tab Đánh Giá
  useEffect(() => {
    if (activeTab === 'reviews-showcase' && id) {
      setLoadingReviews(true);
      getPublicShopReviews(id, reviewsPage)
        .then(res => {
          const resData = res.data?.data;
          if (resData) {
            setReviews(resData.data || []);
            setReviewsTotalPages(resData.last_page || 1);
          }
        })
        .catch(err => console.error("Lỗi khi tải danh sách đánh giá:", err))
        .finally(() => setLoadingReviews(false));
    }
  }, [id, activeTab, reviewsPage]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.ID_SanPham);
    
    if (existing) {
      existing.qty += 1;
    } else {
      const hinhAnhUrl = product.hinh_anh && product.hinh_anh.length > 0 ? product.hinh_anh[0].HinhAnh : null;
      cart.push({ 
        id: product.ID_SanPham, 
        name: product.TenSanPham, 
        qty: 1, 
        price: product.Gia,
        HinhAnh: hinhAnhUrl,
        ID_Shop: shop?.ID_Shop || product.ID_Shop || 'shop_0',
        TenShop: shop?.TenShop || 'Gian hàng đặc sản'
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-change'));
    
    setAddingToCart(prev => ({ ...prev, [product.ID_SanPham]: true }));
    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [product.ID_SanPham]: false }));
    }, 1500);
  };

  if (loading) {
    return (
      <main className="shop-page-wrapper">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang kết nối gian hàng đặc sản Nam Bộ...</p>
        </div>
      </main>
    );
  }

  if (error || !shop) {
    return (
      <main className="shop-page-wrapper">
        <div className="error-container">
          <AlertTriangle size={64} />
          <h2>{error || 'Không tìm thấy gian hàng này!'}</h2>
          <p>Vui lòng kiểm tra lại liên kết hoặc quay lại trang chủ.</p>
          <Link to="/" className="btn-primary-glowing">Về trang chủ</Link>
        </div>
      </main>
    );
  }

  const avatarUrl = shop.logo?.startsWith('http') 
    ? shop.logo 
    : (shop.logo ? `http://127.0.0.1:8000/storage/${shop.logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.TenShop)}&background=D44E28&color=fff&size=128`);

  const bannerUrl = shop.baner?.startsWith('http')
    ? shop.baner
    : (shop.baner ? `http://127.0.0.1:8000/storage/${shop.baner}` : 'https://sinhcafe.com/images/ben-tre-night-market-2.png');

  const products = shop.products || [];

  return (
    <div className="shop-detail-body">
      <main className="shop-page-wrapper">
        {/* Breadcrumbs */}
        <div className="shop-breadcrumbs-wrapper">
          <div className="breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <ChevronRight />
            <Link to="/products">Cửa hàng đặc sản</Link>
            <ChevronRight />
            <span className="active">{shop.TenShop}</span>
          </div>
        </div>

        <div id="shop-content-wrapper">
          {/* Premium Shop Banner Area */}
          <div className="premium-shop-banner-section">
            <div className="banner-image" style={{ backgroundImage: `url('${bannerUrl}')` }}></div>
            <div className="banner-overlay-gradient"></div>
          </div>

          {/* Premium Profile Information Card */}
          <div className="premium-profile-glass-card">
            <div className="profile-card-layout">
              <div className="shop-header-left">
                {/* Left Avatar */}
                <div className="avatar-column">
                  <div className="avatar-wrapper">
                    <img src={avatarUrl} className="shop-large-avatar" alt={shop.TenShop} />
                  </div>
                </div>

                {/* Center Info Details */}
                <div className="info-column">
                  <div className="shop-badge-and-title">
                    <h1>{shop.TenShop}</h1>
                    <span className="premium-verified-badge">
                      <ShieldCheck /> Mall
                    </span>
                  </div>
                  
                  <p className="verification-meta">
                    <CheckCircle2 className="verified-icon" />
                    Đã xác minh (CCCD: {shop.SCCD || 'Đã ẩn'})
                  </p>
                  
                  <p className="location-meta">
                    <MapPin />
                    {shop.DiaChi || 'Đang cập nhật địa chỉ...'}
                  </p>

                  {/* Big CTA Buttons */}
                  <div className="headline-actions">
                    <button className="btn-chat-premium" onClick={() => alert(`Đang mở cổng chat với ${shop.TenShop}...`)}>
                      <MessageCircle /> Chat tư vấn
                    </button>
                    <button 
                      className={`btn-follow-premium ${followed ? 'followed' : ''}`} 
                      onClick={() => setFollowed(!followed)}
                    >
                      {followed ? <><UserCheck /> Đang theo dõi</> : <><Plus /> Theo dõi</>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Status Details */}
              <div className="right-stats-column">
                <div className="mini-stat-item">
                  <span className="stat-value"><Star /> 5.0/5</span>
                  <span className="stat-label">Đánh giá Shop</span>
                </div>
                <div className="mini-stat-item">
                  <span className="stat-value"><ShoppingBag /> {shop.products_count || products.length}</span>
                  <span className="stat-label">Sản phẩm có sẵn</span>
                </div>
                <div className="mini-stat-item">
                  <span className="stat-value"><Users /> 1.2k</span>
                  <span className="stat-label">Người theo dõi</span>
                </div>
              </div>
            </div>

            {/* Fine-grained payment & registration details */}
            <div className="shop-payment-metadata-footer">
              <div className="meta-tag">
                <Calendar />
                <span>Tham gia: <strong>{new Date(shop.NgayDangKy).toLocaleDateString('vi-VN')}</strong></span>
              </div>
              <div className="meta-tag">
                <MessageSquareText />
                <span>Chat phản hồi: <strong>95% (trong vài phút)</strong></span>
              </div>
              <div className="meta-tag flex-grow-payment">
                <CreditCard />
                <span>Thanh toán: <strong>{shop.TenNganHang || 'Ngân hàng địa phương'} - STK: {shop.SoTaiKhoang ? shop.SoTaiKhoang.replace(/.$/, '***') : 'Đã ẩn'}</strong></span>
              </div>
            </div>
          </div>

          {/* Product Catalog Tabs & Showcase */}
          <section className="premium-catalog-section">
            <div className="catalog-tabs-container">
              <button 
                className={`premium-tab-btn ${activeTab === 'grid-showcase' ? 'active' : ''}`} 
                onClick={() => setActiveTab('grid-showcase')}
              >
                <LayoutGrid /> Sản phẩm đang bán ({products.length})
              </button>
              <button 
                className={`premium-tab-btn ${activeTab === 'about-showcase' ? 'active' : ''}`} 
                onClick={() => setActiveTab('about-showcase')}
              >
                <BookOpenCheck /> Giới thiệu & Cam kết sản phẩm
              </button>
              <button 
                className={`premium-tab-btn ${activeTab === 'reviews-showcase' ? 'active' : ''}`} 
                onClick={() => {
                  setActiveTab('reviews-showcase');
                  setReviewsPage(1); // Reset về trang 1 khi đổi tab
                }}
              >
                <Star /> Đánh giá Shop ({reviewsCount})
              </button>
            </div>

            {/* Products Grid Showcase */}
            <div className={`premium-tab-pane ${activeTab === 'grid-showcase' ? 'active' : ''}`}>
              <div className="shop-product-grid">
                {products.length > 0 ? products.map(product => {
                  const productImg = product.hinh_anh && product.hinh_anh.length > 0 
                    ? (product.hinh_anh[0].HinhAnh.startsWith('http') ? product.hinh_anh[0].HinhAnh : `http://127.0.0.1:8000/storage/${product.hinh_anh[0].HinhAnh}`)
                    : 'https://via.placeholder.com/400x300?text=No+Image';

                  return (
                    <div 
                      key={product.ID_SanPham} 
                      className="premium-product-card" 
                      onClick={() => navigate(`/products/${product.ID_SanPham}`)}
                    >
                      <div className="card-image-section">
                        {product.Tittle && <div className="card-badge-glow">{product.Tittle}</div>}
                        <img src={productImg} alt={product.TenSanPham} className="card-product-img" />
                        <div className="card-img-overlay"></div>
                      </div>
                      <div className="card-info-section">
                        <div className="product-origin-meta">
                          <MapPin />
                          <span>{product.NguonGoc || product.tinh_thanh?.TenTinhThanh || 'Đang cập nhật'}</span>
                        </div>
                        <h3>{product.TenSanPham}</h3>
                        <p className="product-short-desc">{product.MoTa || ''}</p>
                        
                        <div className="card-footer-pricing">
                          <div className="price-block">
                            <span className="price-val">{formatPrice(product.Gia)}</span>
                          </div>
                          <button 
                            className="btn-quick-add" 
                            onClick={(e) => handleAddToCart(e, product)}
                            style={addingToCart[product.ID_SanPham] ? { background: '#2E7D32', borderColor: '#2E7D32' } : {}}
                          >
                            {addingToCart[product.ID_SanPham] ? <Check style={{ color: 'white' }} /> : <Plus />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="empty-products-pane">
                    <Inbox size={48} />
                    <p>Gian hàng đặc sản chưa đăng bán sản phẩm nào.</p>
                  </div>
                )}
              </div>
            </div>

            {/* About / Story Showcase */}
            <div className={`premium-tab-pane ${activeTab === 'about-showcase' ? 'active' : ''}`}>
              <div className="premium-story-panel">
                <div className="story-left-decor">
                  <div className="leaf-icon">🌾</div>
                  <div className="vertical-dashed-line"></div>
                </div>
                <div className="story-right-text">
                  <h2>Hành Trình Gìn Giữ Đặc Sản Vùng Miền</h2>
                  <p className="story-para">{shop.GioiThieu || 'Shop đang cập nhật thông tin giới thiệu chi tiết...'}</p>
                  
                  <div className="commitments-section">
                    <h3><Star /> Tiêu Chuẩn Chất Lượng & Cam Thiết Sản Phẩm:</h3>
                    <div className="commit-grid">
                      <div className="commit-item">
                        <div className="commit-icon"><Leaf /></div>
                        <div className="commit-desc">
                          <strong>100% Thuần Tự Nhiên</strong>
                          <span>Nguyên liệu canh tác an toàn sinh học từ nhà vườn địa phương.</span>
                        </div>
                      </div>
                      <div className="commit-item">
                        <div className="commit-icon"><ShieldCheck /></div>
                        <div className="commit-desc">
                          <strong>Kiểm Định Vệ Sinh ATTP</strong>
                          <span>Được chứng nhận an toàn thực phẩm bởi cơ quan quản lý nông nghiệp tỉnh.</span>
                        </div>
                      </div>
                      <div className="commit-item">
                        <div className="commit-icon"><ThumbsUp /></div>
                        <div className="commit-desc">
                          <strong>Giữ Trọn Hương Vị Thật</strong>
                          <span>Gia truyền thủ công, nói không với chất bảo quản hóa học độc hại.</span>
                        </div>
                      </div>
                      <div className="commit-item">
                        <div className="commit-icon"><Truck /></div>
                        <div className="commit-desc">
                          <strong>Vận Chuyển Hỏa Tốc</strong>
                          <span>Sản vật đóng gói cẩn thận, bảo quản lạnh nếu cần, ship tới tận tay nhanh nhất.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Showcase */}
            <div className={`premium-tab-pane ${activeTab === 'reviews-showcase' ? 'active' : ''}`}>
              <div className="premium-story-panel" style={{ display: 'block', padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Star fill="var(--primary)" size={26} /> Đánh giá từ khách hàng
                </h2>

                {loadingReviews ? (
                  <div className="loading-state" style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', marginBottom: '10px' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách đánh giá của shop...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {reviews.map((item) => (
                      <div 
                        key={item.ID_DanhGia} 
                        className="review-item" 
                        style={{ 
                          background: 'white', 
                          border: '1px solid #f3ebe4', 
                          borderRadius: '20px', 
                          padding: '1.5rem',
                          boxShadow: '0 8px 24px rgba(163, 67, 45, 0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              className="user-avatar" 
                              style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '50%', 
                                background: '#f5efe9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                color: 'var(--primary)',
                                border: '1px solid #ecd8c9'
                              }}
                            >
                              {item.user?.HoTen ? item.user.HoTen.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text-dark)', fontSize: '1rem' }}>
                                {item.user?.HoTen || 'Người dùng ẩn danh'}
                              </strong>
                              {item.san_pham && (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Sản phẩm: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.san_pham.TenSanPham}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={16} 
                                fill={i < item.SoSao ? '#F59E0B' : 'transparent'} 
                                color={i < item.SoSao ? '#F59E0B' : '#cbd5e1'} 
                              />
                            ))}
                          </div>
                        </div>

                        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1rem 0', paddingLeft: '4px' }}>
                          {item.NoiDung || 'Không có bình luận chi tiết.'}
                        </p>

                        {item.phan_hoi && (
                          <div 
                            className="shop-response" 
                            style={{ 
                              background: '#faf8f6', 
                              borderLeft: '4px solid var(--primary)', 
                              borderRadius: '12px', 
                              padding: '1.2rem',
                              marginTop: '1rem',
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)'
                            }}
                          >
                            <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block', marginBottom: '6px' }}>
                              Phản hồi từ Chủ Shop:
                            </strong>
                            <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                              {item.phan_hoi.NoiDung}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {reviewsTotalPages > 1 && (
                      <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
                        {[...Array(reviewsTotalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setReviewsPage(i + 1)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '10px',
                              border: '1px solid #ecd8c9',
                              background: reviewsPage === i + 1 ? 'var(--primary)' : '#fff',
                              color: reviewsPage === i + 1 ? '#fff' : 'var(--text-dark)',
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-reviews-pane" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <Inbox size={54} style={{ color: '#ecd8c9', marginBottom: '15px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gian hàng này chưa nhận được đánh giá nào.</p>
                  </div>
                )}
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}
