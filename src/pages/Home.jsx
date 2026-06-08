import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import heroBg from '../assets/quadep.png';

export default function Home() {

  // Logic from the original main.js for region image slider
  useEffect(() => {
    // We don't necessarily need JS for region images because the CSS keyframes 
    // `regionGifEffect` is already doing the slider effect perfectly in the provided CSS.
    // However, if there are other effects (like fade in), we can handle them here.

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            entry.target.style.opacity = 1; // Make sure it's visible if it has a delay
          }
        });
      },
      { threshold: 0.1 }
    );

    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-delay, .fade-in-delay-2');
    fadeElements.forEach((el) => {
      // Temporarily pause animation until scrolled into view
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });

    return () => {
      fadeElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="hero-content">
            <h1 className="fade-in">Hương vị Miền Nam <br />Tinh Hoa Văn Hóa - <br />Kết Nối Phương Nam</h1>
            <p className="fade-in-delay">
              Hỗ trợ hộ kinh doanh địa phương, quảng bá bản sắc văn hóa Việt Nam qua những
              đặc sản tinh túy nhất từ vùng đất chín rồng.
            </p>
            <div className="hero-btns fade-in-delay-2">
              <button className="btn-primary">Mua sắm ngay</button>
            </div>
          </div>
          <div className="hero-overlay"></div>
        </section>

        {/* Region Filter */}
        <section id="regions">
          <div className="section-header">
            <h2>Khám phá theo khu vực</h2>
            <p>Tìm kiếm đặc sản theo từng tỉnh thành Miền Nam</p>
          </div>
          <div className="region-grid">
            {/* Tiền Giang */}
            <div className="region-card" data-region="tiengiang">
              <div className="region-img-wrapper">
                <div className="region-img" style={{ backgroundImage: "url('https://static.mservice.io/blogscontents/momo-upload-api-221028143745-638025646651875182.jpg')" }}></div>
                <div className="region-img" style={{ backgroundColor: "#e2d5c4" }}></div>
                <div className="region-img" style={{ backgroundColor: "#d4a373" }}></div>
                <div className="region-img" style={{ backgroundColor: "#4a6741" }}></div>
              </div>
              <div className="region-info">
                <h3>Tiền Giang</h3>
                <p>Vương quốc trái cây</p>
              </div>
            </div>

            {/* Bến Tre */}
            <div className="region-card" data-region="bentre">
              <div className="region-img-wrapper">
                <div className="region-img" style={{ backgroundImage: "url('https://sinhcafe.com/images/ben-tre-night-market-2.png')" }}></div>
                <div className="region-img" style={{ backgroundColor: "#e2d5c4" }}></div>
                <div className="region-img" style={{ backgroundColor: "#d4a373" }}></div>
                <div className="region-img" style={{ backgroundColor: "#4a6741" }}></div>
              </div>
              <div className="region-info">
                <h3>Bến Tre</h3>
                <p>Xứ sở dừa xanh</p>
              </div>
            </div>

            {/* Cần Thơ */}
            <div className="region-card" data-region="cantho">
              <div className="region-img-wrapper">
                <div className="region-img" style={{ backgroundImage: "url('https://canthoriviu.vn/wp-content/uploads/2022/07/1d-min.jpg')" }}></div>
                <div className="region-img" style={{ backgroundColor: "#e2d5c4" }}></div>
                <div className="region-img" style={{ backgroundColor: "#d4a373" }}></div>
                <div className="region-img" style={{ backgroundColor: "#4a6741" }}></div>
              </div>
              <div className="region-info">
                <h3>Cần Thơ</h3>
                <p>Tây Đô gạo trắng nước trong</p>
              </div>
            </div>

            {/* Đồng Tháp */}
            <div className="region-card" data-region="dongthap">
              <div className="region-img-wrapper">
                <div className="region-img" style={{ backgroundImage: "url('https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://cdn-media.sforum.vn/storage/app/media/thanhhuyen/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20%C4%91%E1%BB%93ng%20th%C3%A1p/1/anh-dep-dong-thap-9.jpg')" }}></div>
                <div className="region-img" style={{ backgroundColor: "#e2d5c4" }}></div>
                <div className="region-img" style={{ backgroundColor: "#d4a373" }}></div>
                <div className="region-img" style={{ backgroundColor: "#4a6741" }}></div>
              </div>
              <div className="region-info">
                <h3>Đồng Tháp</h3>
                <p>Thủ phủ Đất Sen Hồng</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="featured">
          <div className="section-header">
            <h2>Sản phẩm nổi bật</h2>
            <div className="filter-tabs">
              <button className="tab active">Tất cả</button>
              <button className="tab">Trái cây</button>
              <button className="tab">Bánh kẹo</button>
              <button className="tab">Thủy hải sản</button>
            </div>
          </div>
          <div className="product-grid" id="productGrid">
            {/* Products will be injected by JS, but for now let's add some static placeholders based on the design */}
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="product-card">
                <div className="product-badge">Bán chạy</div>
                <div className="product-img-wrapper">
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}></div>
                </div>
                <div className="product-details">
                  <h3>Sản phẩm đặc sản {item}</h3>
                  <div className="product-origin">
                    📍 Miền Tây
                  </div>
                  <p className="product-description">
                    Mô tả ngắn gọn về sản phẩm đặc sản thơm ngon, chất lượng cao từ địa phương.
                  </p>
                  <div className="product-footer">
                    <span className="price">150.000đ</span>
                    <button className="add-to-cart">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">🌴</span>
              <span className="logo-text">NamBộ<span>Specialties</span></span>
            </div>
            <p>Nâng tầm giá trị đặc sản Việt, hỗ trợ chuyển đổi số cho hộ kinh doanh địa phương.</p>
          </div>
          <div className="footer-links">
            <h4>Về chúng tôi</h4>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
          <div className="footer-links">
            <h4>Dành cho người bán</h4>
            <a href="#">Đăng ký gian hàng</a>
            <a href="#">Quy định bán hàng</a>
            <a href="#">Thanh toán & Đối soát</a>
          </div>
          <div className="footer-newsletter">
            <h4>Bản tin</h4>
            <p>Nhận thông báo về các đặc sản mới nhất.</p>
            <div className="subscribe-box">
              <input type="email" placeholder="Email của bạn" />
              <button>Gửi</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 NamBộ Specialties. Thiết kế bởi Antigravity.</p>
        </div>
      </footer>
    </>
  );
}
