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
  const [shopStats, setShopStats] = useState({ avg_rating: 5.0, response_rate: 100, products_count: 0 });

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
        if (res.data) {
          setShopStats({
            avg_rating: res.data.avg_rating || 5.0,
            response_rate: res.data.response_rate || 100,
            products_count: res.data.products_count || 0
          });
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
    : (shop.logo ? `https://lvtnbackend.onrender.com/storage/${shop.logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.TenShop)}&background=D44E28&color=fff&size=128`);

  const bannerUrl = shop.baner?.startsWith('http')
    ? shop.baner
    : (shop.baner ? `https://lvtnbackend.onrender.com/storage/${shop.baner}` : 'https://sinhcafe.com/images/ben-tre-night-market-2.png');

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
                  <span className="stat-value"><Star /> {shopStats.avg_rating}/5</span>
                  <span className="stat-label">Đánh giá Shop</span>
                </div>
                <div className="mini-stat-item">
                  <span className="stat-value"><ShoppingBag /> {shopStats.products_count}</span>
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
                <span>Chat phản hồi: <strong>{shopStats.response_rate}% (trong vài phút)</strong></span>
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

            </div>

            {/* Products Grid Showcase */}
            <div className={`premium-tab-pane ${activeTab === 'grid-showcase' ? 'active' : ''}`}>
              <div className="shop-product-grid">
                {products.length > 0 ? products.map(product => {
                  const productImg = product.hinh_anh && product.hinh_anh.length > 0
                    ? (product.hinh_anh[0].HinhAnh.startsWith('http') ? product.hinh_anh[0].HinhAnh : `https://lvtnbackend.onrender.com/storage/${product.hinh_anh[0].HinhAnh}`)
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



          </section>
        </div>
      </main>
    </div>
  );
}
