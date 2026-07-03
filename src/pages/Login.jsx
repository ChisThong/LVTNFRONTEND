import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import loginBg from '../assets/login-bg.webp';
import axiosClient from '../api/axiosClient';
import '../styles/auth.css';

/* ─────────────────────────────────────────────────────────────
   SVG Inline Icons
───────────────────────────────────────────────────────────── */
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
/* Google SVG chính thức (màu branding Google) */
const IconGoogle = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Helper: Xử lý điều hướng sau khi đăng nhập thành công
───────────────────────────────────────────────────────────── */
function navigateByRole(user, navigate) {
  const roleId = user?.role?.ID_role ?? user?.ID_role;
  if (roleId === 1) {
    navigate('/admin/dashboard');
  } else if (roleId === 3) {
    navigate('/seller/dashboard');
  } else {
    navigate('/');
  }
}

/* ─────────────────────────────────────────────────────────────
   Helper: Phân loại lỗi 403 — bị khóa hay chưa xác thực?
───────────────────────────────────────────────────────────── */
function isBannedError(err) {
  if (err?.response?.status !== 403) return false;
  const errorCode = err?.response?.data?.error_code;
  const message   = err?.response?.data?.message ?? '';
  return errorCode === 'ACCOUNT_BANNED' || message.includes('bị khóa');
}

/* ─────────────────────────────────────────────────────────────
   Component: Toast thông báo khóa tài khoản (custom style)
───────────────────────────────────────────────────────────── */
function BannedToast({ t, message }) {
  return (
    <div
      className={`auth-banned-toast ${t.visible ? 'auth-banned-toast--in' : 'auth-banned-toast--out'}`}
      role="alert"
    >
      <span className="auth-banned-toast__icon">🔒</span>
      <div className="auth-banned-toast__body">
        <strong>Tài khoản bị khóa</strong>
        <p>{message}</p>
      </div>
      <button
        className="auth-banned-toast__close"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Đóng thông báo"
      >
        ✕
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Hiển thị toast ban — tái sử dụng ở cả login thường & Google
───────────────────────────────────────────────────────────── */
function showBannedToast(message) {
  const msg = message || 'Tài khoản của bạn đã bị khóa do vi phạm chính sách của sàn. Vui lòng liên hệ Admin để được hỗ trợ!';
  toast.custom(
    (t) => <BannedToast t={t} message={msg} />,
    {
      duration:  8000,
      position: 'top-center',
      id:       'account-banned', // Tránh hiện nhiều toast cùng lúc
    }
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm]               = useState({ email: '', password: '' });
  const [remember, setRemember]       = useState(false);
  const [errors, setErrors]           = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /* ── Xử lý thay đổi input ────────────────────────────────── */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
    setGeneralError('');
    setIsUnverified(false);
  };

  /* ── Lưu token + user vào localStorage, điều hướng ─────── */
  const handleLoginSuccess = (data) => {
    const { access_token, user } = data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    navigateByRole(user, navigate);
  };

  /* ── Đăng nhập thông thường ─────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');
    setIsUnverified(false);

    try {
      const res = await axiosClient.post('/auth/login', {
        email:   form.email,
        matkhau: form.password,
      });

      handleLoginSuccess(res.data.data ?? res.data);

    } catch (err) {
      if (err.response?.status === 403) {
        // Phân biệt: bị khóa vs chưa xác thực
        if (isBannedError(err)) {
          // ── Tài khoản bị khóa → chặn hoàn toàn, hiện toast đỏ ──
          showBannedToast(err.response.data?.message);
        } else {
          // ── Chưa xác thực email → giữ nguyên flow OTP ──
          const emailFromApi = err.response.data?.data?.email ?? form.email;
          localStorage.setItem('verify_email', emailFromApi);
          setIsUnverified(true);
          setGeneralError(
            err.response.data?.message ??
            'Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư và nhập mã OTP.'
          );
        }
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

  /* ── Đăng nhập Google (useGoogleLogin – Implicit / Token flow) ── */
  const handleGoogleLogin = useGoogleLogin({
    // onSuccess nhận access_token → dùng để lấy userinfo (hoặc dùng credential trong One-Tap)
    // Ở đây ta dùng flow='implicit' để lấy id_token (credential) gửi về backend
    flow: 'implicit',

    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await axiosClient.post('/auth/google', {
          credential: tokenResponse.access_token,
        });

        const responseBody  = res.data;
        const isNewUser     = responseBody.is_new_user === true;
        const { access_token, user } = responseBody.data ?? responseBody;

        // ── Hiển thị toast chào mừng trước khi navigate ──────────────
        if (isNewUser) {
          toast.success(
            '🎉 Đăng ký và đăng nhập thành công bằng Google! Chào mừng thành viên mới.',
            {
              duration: 4000,
              position: 'top-center',
              style: {
                background: '#1b4332',
                color:      '#d8f3dc',
                border:     '1.5px solid #40916c',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize:   '0.88rem',
                padding:    '0.85rem 1.1rem',
              },
              iconTheme: { primary: '#52b788', secondary: '#d8f3dc' },
            }
          );
        } else {
          toast.success(
            '👋 Chào mừng bạn quay trở lại!',
            {
              duration: 3000,
              position: 'top-center',
              style: {
                background: '#1c3a5e',
                color:      '#dbeafe',
                border:     '1.5px solid #3b82f6',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize:   '0.88rem',
                padding:    '0.85rem 1.1rem',
              },
              iconTheme: { primary: '#60a5fa', secondary: '#dbeafe' },
            }
          );
        }

        // ── Lưu token + user, rồi navigate sau khi toast hiển thị ────
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        // Phát sự kiện để đồng bộ hóa ngay lập tức Header / PublicNavbar mà không cần F5
        window.dispatchEvent(new Event('auth-change'));

        // Delay nhỏ để toast kịp render trước khi route thay đổi
        setTimeout(() => navigateByRole(user, navigate), 700);

      } catch (err) {
        if (isBannedError(err)) {
          showBannedToast(err.response?.data?.message);
        } else {
          const msg =
            err.response?.data?.message ??
            'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
          toast.error(msg, { duration: 5000, position: 'top-center' });
        }
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: (error) => {
      console.error('Google OAuth error:', error);
      if (error?.error !== 'popup_closed_by_user') {
        toast.error('Không thể mở cửa sổ đăng nhập Google. Vui lòng thử lại.', {
          position: 'top-center',
        });
      }
    },
  });

  /* ── Render ──────────────────────────────────────────────── */
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

          {/* ── Error / Unverified Banner ── */}
          {generalError && (
            <div className="auth-error-banner auth-error-banner--column" role="alert">
              <span>{generalError}</span>
              {isUnverified && (
                <Link to="/verify-otp" className="auth-error-banner-link">
                  Bấm vào đây để xác thực ngay
                </Link>
              )}
            </div>
          )}

          {/* ── Form đăng nhập ── */}
          <form id="login-form" onSubmit={handleSubmit} noValidate>

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
                  id="login-remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn-spinner">
                  <span className="auth-spinner" />
                  Đang đăng nhập...
                </span>
              ) : 'ĐĂNG NHẬP'}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="auth-divider">Hoặc đăng nhập với</div>

          {/* ── Khu vực đăng nhập bằng Google ── */}
          <div className="auth-social-single">
            <button
              id="login-google-btn"
              type="button"
              className="auth-google-btn-full"
              onClick={() => handleGoogleLogin()}
              disabled={googleLoading}
              aria-label="Đăng nhập bằng Google"
            >
              {googleLoading ? (
                <span className="auth-btn-spinner">
                  <span className="auth-spinner auth-spinner--sm" />
                  Đang xử lý...
                </span>
              ) : (
                <>
                  <IconGoogle />
                  <span>Đăng nhập với Google</span>
                </>
              )}
            </button>
          </div>

          {/* ── Switch đăng ký ── */}
          <p className="auth-switch-row">
            Chưa có tài khoản?{' '}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
