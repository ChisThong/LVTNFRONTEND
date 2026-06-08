import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/auth.css';

/* ── SVG inline icons ── */
const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  // Đếm ngược cooldown gửi lại
  const [cooldown, setCooldown] = useState(0);

  // Đọc email từ localStorage khi mount
  useEffect(() => {
    const stored = localStorage.getItem('verify_email');
    if (!stored) {
      navigate('/register', { replace: true });
      return;
    }
    setEmail(stored);
  }, [navigate]);

  // Đếm ngược cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleOtpChange = (e) => {
    // Chỉ cho nhập số, tối đa 6 ký tự
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(val);
    setErrors({});
    setGeneralError('');
    setSuccessMsg('');
  };

  /* ── Xác thực OTP ── */
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setErrors({ otp_code: ['Mã OTP phải gồm đúng 6 chữ số.'] });
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError('');
    setSuccessMsg('');

    try {
      await axiosClient.post('/auth/verify-otp', {
        email,
        otp_code: otpCode,
      });

      // Dọn email khỏi localStorage
      localStorage.removeItem('verify_email');

      setSuccessMsg('✅ Xác thực thành công! Đang chuyển sang trang đăng nhập...');

      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors;
        if (serverErrors) {
          setErrors(serverErrors);
        } else {
          setGeneralError(err.response.data.message ?? 'Mã OTP không hợp lệ.');
        }
      } else {
        setGeneralError(err.response?.data?.message ?? 'Xác thực thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Gửi lại OTP ── */
  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendMsg('');
    setGeneralError('');
    setSuccessMsg('');

    try {
      await axiosClient.post('/auth/resend-otp', { email });
      setResendMsg('📬 Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
      setCooldown(60); // cooldown 60 giây
      setOtpCode('');
    } catch (err) {
      setGeneralError(
        err.response?.data?.message ?? 'Gửi lại OTP thất bại. Vui lòng thử lại.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Cột trái: minh hoạ ── */}
      <div className="auth-left otp-left">
        <div className="auth-left__overlay" />
        <div className="auth-left__content">
          <span className="auth-left__badge">BẢO MẬT TÀI KHOẢN</span>
          <h2 className="auth-left__title">
            Xác thực<br />Email
          </h2>
          <p className="auth-left__desc">
            Chúng tôi đã gửi mã OTP gồm 6 chữ số đến địa chỉ email của bạn.
            Mã có hiệu lực trong <strong style={{ color: '#D4A373' }}>5 phút</strong>.
          </p>
        </div>
      </div>

      {/* ── Cột phải: form ── */}
      <div className="auth-right">
        <Link to="/login" className="auth-back-link">
          <IconArrowLeft />
          Về trang đăng nhập
        </Link>

        <div className="auth-form-wrapper">
          {/* Logo */}
          <a href="/" className="auth-logo">
            <span className="auth-logo__icon">🌴</span>
            <span className="auth-logo__text">
              <span className="brand-main">NamBộ</span>
              <span className="brand-accent">Specialties</span>
            </span>
          </a>

          <h1 className="auth-heading">Xác thực Email</h1>
          <p className="auth-subheading">
            Nhập mã OTP đã được gửi đến:
          </p>

          {/* Email badge */}
          <div className="otp-email-badge">
            <IconMail />
            <span>{email}</span>
          </div>

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="auth-success-banner">{successMsg}</div>
          )}

          {/* Thông báo gửi lại */}
          {resendMsg && !successMsg && (
            <div className="auth-info-banner">{resendMsg}</div>
          )}

          {/* Lỗi chung */}
          {generalError && (
            <div className="auth-error-banner">{generalError}</div>
          )}

          <form onSubmit={handleVerify} noValidate>
            {/* Input OTP */}
            <div className="auth-field">
              <label htmlFor="otp-code">Mã OTP</label>
              <div className="auth-input-wrap otp-input-wrap">
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="otp_code"
                  value={otpCode}
                  onChange={handleOtpChange}
                  placeholder="_ _ _ _ _ _"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={errors.otp_code ? 'is-invalid' : ''}
                />
                <span className="auth-input-icon"><IconShield /></span>
              </div>
              {errors.otp_code && (
                <span className="auth-field-error">{errors.otp_code[0]}</span>
              )}
            </div>

            {/* Nút Xác thực */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? 'Đang xác thực...' : 'XÁC THỰC'}
            </button>
          </form>

          {/* Gửi lại OTP */}
          <div className="otp-resend-row">
            <span>Không nhận được mã?</span>
            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={cooldown > 0 || resendLoading}
            >
              {resendLoading
                ? 'Đang gửi...'
                : cooldown > 0
                  ? `Gửi lại sau ${cooldown}s`
                  : 'Gửi lại mã OTP'}
            </button>
          </div>

          {/* Link đổi email */}
          <p className="auth-switch-row" style={{ marginTop: '1rem' }}>
            Đăng ký email khác?{' '}
            <Link to="/register">Quay lại đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
