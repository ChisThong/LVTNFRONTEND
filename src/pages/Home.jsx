import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getPublicProducts } from '../api/productPublicApi';
import '../styles/home.css';
import heroBg from '../assets/quadep.png';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeTab, setActiveTab]               = useState('');
  const [featuredLoading, setFeaturedLoading]   = useState(true);

  // Fetch featured products
  useEffect(() => {
    setFeaturedLoading(true);
    const params = { per_page: 8 };
    if (activeTab) params.ID_PhanLoai = activeTab;
    getPublicProducts(params)
      .then(res => {
        const data = res.data?.data?.data || [];
        setFeaturedProducts(data);
      })
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, [activeTab]);

  return (
    <main className="home-main-wrapper">
        {/* Hero Section */}
        <section id="hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="hero-content">
            <h1 className="fade-in animate-slide-up">Hương vị Miền Nam <br />Tinh Hoa Văn Hóa - <br />Kết Nối Phương Nam</h1>
            <p className="fade-in-delay animate-slide-up">
              Hỗ trợ hộ kinh doanh địa phương, quảng bá bản sắc văn hóa Việt Nam qua những
              đặc sản tinh túy nhất từ vùng đất chín rồng.
            </p>
            <div className="hero-btns fade-in-delay-2 animate-slide-up">
              <Link to="/products" className="btn-primary-mall">
                Khám phá ngay
              </Link>
            </div>
          </div>
          <div className="hero-overlay-gradient"></div>
        </section>

        {/* Region Filter - Premium Layout */}
        <section id="regions-premium">
          <div className="section-header-mall">
            <h2>Khám phá theo khu vực</h2>
            <p>Tìm kiếm đặc sản theo từng tỉnh thành Miền Nam</p>
          </div>
          <div className="region-grid-premium">
            {/* Tiền Giang */}
            <Link to="/products?tinh=Tiền Giang" className="region-card-premium">
              <div className="region-img-bg" style={{ backgroundImage: "url('https://static.mservice.io/blogscontents/momo-upload-api-221028143745-638025646651875182.jpg')" }}></div>
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Tiền Giang</h3>
                <p>Vương quốc trái cây</p>
              </div>
            </Link>

            {/* Bến Tre */}
            <Link to="/products?tinh=Bến Tre" className="region-card-premium">
              <div className="region-img-bg" style={{ backgroundImage: "url('https://sinhcafe.com/images/ben-tre-night-market-2.png')" }}></div>
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Bến Tre</h3>
                <p>Xứ sở dừa xanh</p>
              </div>
            </Link>

            {/* Cần Thơ */}
            <Link to="/products?tinh=Cần Thơ" className="region-card-premium">
              <div className="region-img-bg" style={{ backgroundImage: "url('https://canthoriviu.vn/wp-content/uploads/2022/07/1d-min.jpg')" }}></div>
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Cần Thơ</h3>
                <p>Tây Đô gạo trắng nước trong</p>
              </div>
            </Link>

            {/* Đồng Tháp */}
            <Link to="/products?tinh=Đồng Tháp" className="region-card-premium">
              <div className="region-img-bg" style={{ backgroundImage: "url('https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://cdn-media.sforum.vn/storage/app/media/thanhhuyen/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%E1%BB%93ng%20th%C3%A1p/1/anh-dep-dong-thap-9.jpg')" }}></div>
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Đồng Tháp</h3>
                <p>Thủ phủ Đất Sen Hồng</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products - Premium Layout */}
        <section id="featured-premium">
          <div className="section-header-mall">
            <h2>Sản phẩm nổi bật</h2>
            <div className="filter-tabs-pill">
              <button
                className={`tab-pill ${activeTab === '' ? 'active' : ''}`}
                onClick={() => setActiveTab('')}
              >Tất cả</button>
              <button
                className={`tab-pill ${activeTab === '1' ? 'active' : ''}`}
                onClick={() => setActiveTab('1')}
              >Trái cây</button>
              <button
                className={`tab-pill ${activeTab === '2' ? 'active' : ''}`}
                onClick={() => setActiveTab('2')}
              >Bánh kẹo</button>
              <button
                className={`tab-pill ${activeTab === '3' ? 'active' : ''}`}
                onClick={() => setActiveTab('3')}
              >Thủy hải sản</button>
            </div>
          </div>

          <div className="product-grid-mall">
            {featuredLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-product-mall">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-text long"></div>
                </div>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="empty-state-mall">
                <p>Chưa có sản phẩm nào. Hãy quay lại sau!</p>
              </div>
            ) : (
              featuredProducts.map((product, idx) => (
                <div key={product.ID_SanPham} className="fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <ProductCard product={product} index={idx} />
                </div>
              ))
            )}
          </div>

          <div className="view-all-wrapper">
            <Link to="/products" className="btn-outline-mall">
              Xem tất cả đặc sản →
            </Link>
          </div>
        </section>
      </main>
  );
}
