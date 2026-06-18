import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginBg from '../../assets/login-bg.png';
import axiosClient from '../../api/axiosClient';
import '../../styles/auth.css';

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

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & pass mới
  const [email, setEmail] = useState('');
  const [otpForm, setOtpForm] = useState({ otp_code: '', password: '', password_confirmation: '' });
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');

    try {
      const res = await axiosClient.post('/auth/forgot-password', { email });
      setSuccessMessage(res.data.message || 'Mã OTP đã được gửi đến email của bạn.');
      setStep(2);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else if (err.response?.status === 429) {
        setGeneralError('Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 1 phút.');
      } else {
        setGeneralError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const res = await axiosClient.post('/auth/reset-password', {
        email,
        otp_code: otpForm.otp_code,
        matkhau: otpForm.password,
        matkhau_confirmation: otpForm.password_confirmation
      });
      alert(res.data.message || 'Đổi mật khẩu thành công!');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
        if (err.response.data.message) {
            setGeneralError(err.response.data.message);
        }
      } else {
        setGeneralError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <img src={loginBg} alt="Chợ nổi miền Nam" className="auth-left__bg" />
        <div className="auth-left__overlay" />
        <div className="auth-left__content">
          <span className="auth-left__badge">BẢO MẬT</span>
          <h2 className="auth-left__title">Lấy lại mật khẩu</h2>
          <p className="auth-left__desc">
            Đừng lo lắng, chúng tôi sẽ gửi mã xác thực đến email của bạn để lấy lại quyền truy cập an toàn.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <Link to="/login" className="auth-back-link">
          <IconArrowLeft /> Quay lại đăng nhập
        </Link>

        <div className="auth-form-wrapper">
          <a href="/" className="auth-logo">
            <span className="auth-logo__icon">🌴</span>
            <span className="auth-logo__text">
              <span className="brand-main">NamBộ</span>
              <span className="brand-accent">Specialties</span>
            </span>
          </a>

          <h1 className="auth-heading">Quên Mật Khẩu</h1>
          <p className="auth-subheading">
            {step === 1 ? 'Vui lòng nhập email đăng ký tài khoản của bạn.' : 'Nhập mã OTP từ email và mật khẩu mới.'}
          </p>

          {generalError && (
            <div className="auth-error-banner">
              <span>{generalError}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-error-banner" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', borderLeftColor: '#4caf50' }}>
              <span>{successMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} noValidate>
              <div className="auth-field">
                <label>Email của bạn</label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className={errors.email ? 'is-invalid' : ''}
                  />
                  <span className="auth-input-icon"><IconMail /></span>
                </div>
                {errors.email && <span className="auth-field-error">{errors.email[0]}</span>}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading || !email}>
                {loading ? 'Đang gửi...' : 'GỬI MÃ XÁC NHẬN OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} noValidate>
              <div className="auth-field">
                <label>Mã OTP (gửi về email)</label>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    value={otpForm.otp_code}
                    onChange={(e) => setOtpForm({ ...otpForm, otp_code: e.target.value })}
                    placeholder="Nhập 6 số OTP"
                    className={errors.otp_code ? 'is-invalid' : ''}
                  />
                  <span className="auth-input-icon"><IconLock /></span>
                </div>
                {errors.otp_code && <span className="auth-field-error">{errors.otp_code[0]}</span>}
              </div>

              <div className="auth-field">
                <label>Mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <input
                    type="password"
                    value={otpForm.password}
                    onChange={(e) => setOtpForm({ ...otpForm, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className={errors.matkhau ? 'is-invalid' : ''}
                  />
                  <span className="auth-input-icon"><IconLock /></span>
                </div>
                {errors.matkhau && <span className="auth-field-error">{errors.matkhau[0]}</span>}
              </div>

              <div className="auth-field">
                <label>Xác nhận mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <input
                    type="password"
                    value={otpForm.password_confirmation}
                    onChange={(e) => setOtpForm({ ...otpForm, password_confirmation: e.target.value })}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <span className="auth-input-icon"><IconLock /></span>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
