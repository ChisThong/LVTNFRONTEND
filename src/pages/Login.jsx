import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginBg from '../assets/login-bg.png';
import axiosClient from '../api/axiosClient';
import '../styles/auth.css';

/* ── SVG inline icons ── */
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
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

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false); // 403 chưa xác thực
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
    setGeneralError('');
    setIsUnverified(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');
    setIsUnverified(false);

    try {
      const res = await axiosClient.post('/auth/login', {
        email: form.email,
        matkhau: form.password,  // field backend là matkhau
      });

      const { access_token, user } = res.data.data ?? res.data;
      localStorage.setItem('token', access_token ?? res.data.token);

      // Điều hướng theo role
      if (user.role?.ID_role === 1 || user.ID_role === 1) navigate('/admin');
      else if (user.role?.ID_role === 3 || user.ID_role === 3) navigate('/seller/products');
      else navigate('/');
    } catch (err) {
      if (err.response?.status === 403) {
        // Chưa xác thực email
        const emailFromApi = err.response.data?.data?.email ?? form.email;
        localStorage.setItem('verify_email', emailFromApi);
        setIsUnverified(true);
      } else if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        setGeneralError(
          err.response?.data?.message ?? 'Email hoặc mật khẩu không đúng.'
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
        <img src={loginBg} alt="Chợ nổi miền Nam" className="auth-left__bg" />
        <div className="auth-left__overlay" />
        <div className="auth-left__content">
          <span className="auth-left__badge">PREMIUM CHOICE</span>
          <h2 className="auth-left__title">
            Hương vị<br />Phù sa
          </h2>
          <p className="auth-left__desc">
            Khám phá bộ sưu tập sản vật tinh túy từ 8 tỉnh miền Tây Nam Bộ,
            được tuyển chọn kỹ lưỡng để mang đến hương vị nguyên bản nhất.
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

          <h1 className="auth-heading">Chào mừng trở lại!</h1>
          <p className="auth-subheading">
            Vui lòng đăng nhập để tiếp tục hành trình khám phá.
          </p>

          {/* Error banner */}
          {generalError && (
            <div className="auth-error-banner" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span>{generalError}</span>
              {isUnverified && (
                <Link 
                  to="/verify-otp" 
                  style={{ color: '#c62828', fontWeight: 'bold', textDecoration: 'underline', marginTop: '0.4rem' }}
                >
                  Bấm vào đây để xác thực ngay
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">Email của bạn</label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
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
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={errors.password ? 'is-invalid' : ''}
                />
                <span className="auth-input-icon"><IconLock /></span>
              </div>
              {errors.password && (
                <span className="auth-field-error">{errors.password[0]}</span>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="auth-row-extra">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="auth-forgot-link">Quên mật khẩu?</a>
            </div>

            {/* Submit */}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">Hoặc đăng nhập với</div>

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
            Chưa có tài khoản?{' '}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
          <p className="auth-admin-link">
            Bạn là quản trị viên?{' '}
            <Link to="/login?role=admin">Đăng nhập Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
