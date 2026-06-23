import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { getPublicProducts } from '../api/productPublicApi';
import '../styles/home.css';
import heroBg from '../assets/quadep.webp';

/* ══════════════════════════════════════════════════════════
   Component con: Slideshow thuần CSS @keyframes
   Tất cả ảnh render cùng lúc, mỗi ảnh có animationDelay
   nối đuôi nhau — không cần JS timer, GPU xử lý hoàn toàn.
   ══════════════════════════════════════════════════════════ */

// Keyframes inject 1 lần vào <head> — không re-inject nếu đã có
const KEYFRAME_ID = 'region-slideshow-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAME_ID)) {
  const style = document.createElement('style');
  style.id = KEYFRAME_ID;
  style.textContent = `
    @keyframes regionGifEffect {
      0%           { opacity: 0; transform: scale(1);    }
      5%,  25%     { opacity: 1; transform: scale(1);    }
      30%, 100%    { opacity: 0; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// delay tăng đều theo số lượng ảnh, tổng chu kỳ = 20s (4 ảnh x 5s mỗi ảnh)
const DELAYS = ['0s', '5s', '10s', '15s'];

function RegionImageSlideshow({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <>
      {images.map((src, i) => (
        <div
          key={i}
          className="region-slideshow-layer"
          style={{
            backgroundImage: `url('${src}')`,
            animationDelay: DELAYS[i] ?? `${i * 5}s`,
          }}
        />
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   Danh sách ảnh slideshow cho từng tỉnh thành
   ══════════════════════════════════════════════════════════ */
const REGION_IMAGES = {
  tienGiang: [
    'https://static.mservice.io/blogscontents/momo-upload-api-221028143745-638025646651875182.jpg',
    new URL('../assets/image copy 13.webp', import.meta.url).href,
    new URL('../assets/image copy 6.webp',  import.meta.url).href,
    new URL('../assets/image.webp',         import.meta.url).href,
  ],
  benTre: [
    new URL('../assets/image copy 11.webp', import.meta.url).href,
    new URL('../assets/keodua.webp',        import.meta.url).href,
    new URL('../assets/banhtrang.webp',     import.meta.url).href,
    new URL('../assets/image copy 4.webp',  import.meta.url).href,
  ],
  canTho: [
    'https://canthoriviu.vn/wp-content/uploads/2022/07/1d-min.jpg',
    new URL('../assets/image copy 7.webp', import.meta.url).href,
    new URL('../assets/image copy 8.webp', import.meta.url).href,
    new URL('../assets/quadep.webp',       import.meta.url).href,
  ],
  dongThap: [
    'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://cdn-media.sforum.vn/storage/app/media/thanhhuyen/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%E1%BB%93ng%20th%C3%A1p/1/anh-dep-dong-thap-9.jpg',
    new URL('../assets/image copy 12.webp', import.meta.url).href,
    new URL('../assets/image copy 5.webp',  import.meta.url).href,
    new URL('../assets/image copy 2.webp',  import.meta.url).href,
  ],
};

/* ══════════════════════════════════════════════════════════
   Home Page
   ══════════════════════════════════════════════════════════ */
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
        {/* ── Hero Section ─────────────────────────────────── */}
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

        {/* ── Region Filter — Premium Slideshow Layout ─────── */}
        <section id="regions-premium">
          <div className="section-header-mall">
            <h2>Khám phá theo khu vực</h2>
            <p>Tìm kiếm đặc sản theo từng tỉnh thành Miền Nam</p>
          </div>
          <div className="region-grid-premium">

            {/* Tiền Giang */}
            <Link
              to="/products?tinh=Tiền Giang"
              className="region-card-premium"
            >
              <RegionImageSlideshow images={REGION_IMAGES.tienGiang} />
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Tiền Giang</h3>
                <p>Vương quốc trái cây</p>
              </div>
            </Link>

            {/* Bến Tre */}
            <Link
              to="/products?tinh=Bến Tre"
              className="region-card-premium"
            >
              <RegionImageSlideshow images={REGION_IMAGES.benTre} />
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Bến Tre</h3>
                <p>Xứ sở dừa xanh</p>
              </div>
            </Link>

            {/* Cần Thơ */}
            <Link
              to="/products?tinh=Cần Thơ"
              className="region-card-premium"
            >
              <RegionImageSlideshow images={REGION_IMAGES.canTho} />
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Cần Thơ</h3>
                <p>Tây Đô gạo trắng nước trong</p>
              </div>
            </Link>

            {/* Đồng Tháp */}
            <Link
              to="/products?tinh=Đồng Tháp"
              className="region-card-premium"
            >
              <RegionImageSlideshow images={REGION_IMAGES.dongThap} />
              <div className="region-gradient-overlay"></div>
              <div className="region-info-premium">
                <h3>Đồng Tháp</h3>
                <p>Thủ phủ Đất Sen Hồng</p>
              </div>
            </Link>

          </div>
        </section>

        {/* ── Featured Products — Premium Layout ───────────── */}
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
