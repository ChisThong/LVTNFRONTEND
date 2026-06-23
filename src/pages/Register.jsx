import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import registerBg from '../assets/register-bg.webp';
import axiosClient from '../api/axiosClient';
import '../styles/auth.css';

/* ── SVG inline icons ── */
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconGoogle = () => (
  <svg viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    HoTen: '',
    email: '',
    matkhau: '',
    matkhau_confirmation: '',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi của field vừa sửa
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validate phía frontend ──
    const frontendErrors = {};

    if (!formData.HoTen.trim()) {
      frontendErrors.HoTen = ['Họ tên không được để trống.'];
    }
    if (!formData.email.trim()) {
      frontendErrors.email = ['Email không được để trống.'];
    }
    if (formData.matkhau.length < 6) {
      frontendErrors.matkhau = ['Mật khẩu phải có tối thiểu 6 ký tự.'];
    }
    if (!formData.matkhau_confirmation.trim()) {
      frontendErrors.matkhau_confirmation = ['Vui lòng nhập xác nhận mật khẩu.'];
    } else if (formData.matkhau !== formData.matkhau_confirmation) {
      frontendErrors.matkhau_confirmation = ['Xác nhận mật khẩu không khớp.'];
    }

    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      return; // Không gọi API
    }

    if (!isAgreed) {
      setGeneralError('Bạn cần đồng ý với Điều khoản & Chính sách để tiếp tục.');
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const res = await axiosClient.post('/auth/register', {
        HoTen: formData.HoTen,
        email: formData.email,
        matkhau: formData.matkhau,
        matkhau_confirmation: formData.matkhau_confirmation,
      });

      // Lưu email để trang VerifyOtp đọc
      localStorage.setItem('verify_email', formData.email);

      // Chuyển sang trang xác thực OTP
      navigate('/verify-otp');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        setGeneralError(
          err.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Cột trái: ảnh nền ── */}
      <div className="auth-left">
        <img src={registerBg} alt="Chợ nổi giao thương" className="auth-left__bg" />
        <div className="auth-left__overlay" />
        <div className="auth-left__content">
          <span className="auth-left__badge">CỘNG ĐỒNG VIP</span>
          <h2 className="auth-left__title">
            Kết nối<br />Giao thương
          </h2>
          <p className="auth-left__desc">
            Tham gia cộng đồng kinh doanh sản vật miền Tây lớn nhất, nơi hội
            tụ những tinh hoa nông sản từ vùng đất chín rồng.
          </p>
        </div>
      </div>

      {/* ── Cột phải: form ── */}
      <div className="auth-right">
        <a href="/" className="auth-back-link">
          <IconArrowLeft />
          Quay lại trang chủ
        </a>

        <div className="auth-form-wrapper">
          {/* Logo */}
          <a href="/" className="auth-logo">
            <span className="auth-logo__icon">🌴</span>
            <span className="auth-logo__text">
              <span className="brand-main">NamBộ</span>
              <span className="brand-accent">Specialties</span>
            </span>
          </a>

          <h1 className="auth-heading">Tạo tài khoản mới</h1>
          <p className="auth-subheading">
            Bắt đầu hành trình tinh hoa nông sản ngay.
          </p>

          {/* Error banner */}
          {generalError && (
            <div className="auth-error-banner">{generalError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Họ và tên */}
            <div className="auth-field">
              <label htmlFor="reg-hoten">Họ và tên</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-hoten"
                  type="text"
                  name="HoTen"
                  value={formData.HoTen}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  className={errors.HoTen ? 'is-invalid' : ''}
                />
                <span className="auth-input-icon"><IconUser /></span>
              </div>
              {errors.HoTen && (
                <span className="auth-field-error">{errors.HoTen[0]}</span>
              )}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email đăng ký</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@email.com"
                  autoComplete="email"
                  className={errors.email ? 'is-invalid' : ''}
                />
                <span className="auth-input-icon"><IconMail /></span>
              </div>
              {errors.email && (
                <span className="auth-field-error">{errors.email[0]}</span>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="auth-field">
              <label htmlFor="reg-matkhau">Mật khẩu</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-matkhau"
                  type="password"
                  name="matkhau"
                  value={formData.matkhau}
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  className={errors.matkhau ? 'is-invalid' : ''}
                />
                <span className="auth-input-icon"><IconLock /></span>
              </div>
              {errors.matkhau && (
                <span className="auth-field-error">{errors.matkhau[0]}</span>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="auth-field">
              <label htmlFor="reg-matkhau-confirm">Xác nhận mật khẩu</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-matkhau-confirm"
                  type="password"
                  name="matkhau_confirmation"
                  value={formData.matkhau_confirmation}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  className={errors.matkhau_confirmation ? 'is-invalid' : ''}
                />
                <span className="auth-input-icon"><IconLock /></span>
              </div>
              {errors.matkhau_confirmation && (
                <span className="auth-field-error">{errors.matkhau_confirmation[0]}</span>
              )}
            </div>

            {/* Terms */}
            <label className="auth-terms">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <span>
                Tôi đồng ý với{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer">Điều khoản</Link>
                {' & '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer">Chính sách</Link>
              </span>
            </label>

            {/* Submit */}
            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={loading || !isAgreed}
              style={!isAgreed ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#9ca3af', color: '#fff' } : {}}
            >
              {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">Hoặc đăng ký nhanh với</div>

          {/* Social */}
          <div className="auth-social-row">
            <button type="button" className="auth-social-btn">
              <IconGoogle /> Google
            </button>
            <button type="button" className="auth-social-btn">
              <IconFacebook /> Facebook
            </button>
          </div>

          {/* Switch */}
          <p className="auth-switch-row">
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
