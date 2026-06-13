import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   PublicFooter — dùng cho tất cả trang Public
   ═══════════════════════════════════════════════════════════ */
export default function PublicFooter() {
  return (
    <footer id="footer">
      <div className="footer-content">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <span className="logo-icon">🌴</span>
            <span className="logo-text">NamBộ<span>Specialties</span></span>
          </Link>
          <p>Nâng tầm giá trị đặc sản Việt, hỗ trợ chuyển đổi số cho hộ kinh doanh địa phương.</p>
        </div>

        {/* Về chúng tôi */}
        <div className="footer-links">
          <h4>Về chúng tôi</h4>
          <Link to="/about">Giới thiệu</Link>
          <a href="#">Liên hệ</a>
          <Link to="/privacy">Chính sách bảo mật</Link>
          <Link to="/terms">Điều khoản sử dụng</Link>
        </div>

        {/* Dành cho người bán */}
        <div className="footer-links">
          <h4>Dành cho người bán</h4>
          <Link to="/seller/register">Đăng ký gian hàng</Link>
          <a href="#">Quy định bán hàng</a>
          <a href="#">Thanh toán &amp; Đối soát</a>
        </div>

        {/* Khám phá */}
        <div className="footer-links">
          <h4>Khám phá</h4>
          <Link to="/products">Đặc sản miền Nam</Link>
          <Link to="/map">Bản đồ đặc sản</Link>
          <Link to="/stories">Câu chuyện sản vật</Link>
        </div>

        {/* Bản tin */}
        <div className="footer-newsletter">
          <h4>Bản tin</h4>
          <p>Nhận thông báo về các đặc sản mới nhất.</p>
          <div className="subscribe-box">
            <input type="email" placeholder="Email của bạn" aria-label="Email đăng ký bản tin" />
            <button type="button">Gửi</button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 NamBộ Specialties. Thiết kế bởi Antigravity.</p>
      </div>
    </footer>
  );
}
