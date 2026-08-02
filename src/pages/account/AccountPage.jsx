import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import '../../styles/account.css';

export default function AccountPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  const [user, setUser] = useState(null);

  // Profile state
  const [profileForm, setProfileForm] = useState({ HoTen: '', sdt: '', diachi: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [pwdForm, setPwdForm] = useState({ old_password: '', password: '', password_confirmation: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get('/me');
        const userData = res.data.data;
        setUser(userData);
        setProfileForm({
          HoTen: userData.HoTen || '',
          sdt: userData.sdt || '',
          diachi: userData.diachi || ''
        });
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await axiosClient.put('/auth/update-profile', profileForm);
      setProfileMsg({ type: 'success', text: res.data.message });
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data)); // Sync localstorage
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg({ type: '', text: '' });
    try {
      const res = await axiosClient.post('/auth/change-password', {
        old_password: pwdForm.old_password,
        matkhau: pwdForm.password,
        matkhau_confirmation: pwdForm.password_confirmation
      });
      toast.success(res.data.message || 'Đổi mật khẩu thành công!');
      // Logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      const firstError = err.response?.data?.errors
        ? Object.values(err.response.data.errors)[0][0]
        : null;
      setPwdMsg({
        type: 'error',
        text: firstError || err.response?.data?.message || 'Có lỗi xảy ra.'
      });
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-container account-container--skeleton">
          <div className="account-sidebar account-sidebar--skeleton">
            <div className="skeleton-avatar" />
            <div className="skeleton-line" style={{ width: '60%', margin: '1rem auto' }} />
            <div className="skeleton-line" style={{ width: '80%', margin: '0 auto 1.5rem' }} />
            <div className="skeleton-line" style={{ height: '40px', marginBottom: '0.5rem' }} />
            <div className="skeleton-line" style={{ height: '40px' }} />
          </div>
          <div className="account-content account-content--skeleton">
            <div className="skeleton-line" style={{ width: '40%', height: '32px', marginBottom: '1rem' }} />
            <div className="skeleton-line" style={{ width: '60%', height: '18px', marginBottom: '2.5rem' }} />
            <div className="skeleton-line" style={{ height: '50px', marginBottom: '1.2rem' }} />
            <div className="skeleton-line" style={{ height: '50px', marginBottom: '1.2rem' }} />
            <div className="skeleton-line" style={{ height: '50px', marginBottom: '1.2rem' }} />
            <div className="skeleton-line" style={{ width: '150px', height: '45px' }} />
          </div>
        </div>
      </div>
    );
  }

  // is_social_login = true → tài khoản có liên kết Google
  const isSocialUser    = user.is_social_login === true;   // dùng cho icon 🔒 và badge
  const showPasswordTab = true;                             // luôn hiện tab — backend tự xử lý lỗi phân biệt
  const isGoogleLinked  = !!user.has_google;               // hiển thị badge Google Linked

  return (
    <div className="account-page">
      <div className="account-container">

        {/* Sidebar */}
        <div className="account-sidebar">
          <div className="account-sidebar-header">
            {/* ── Avatar Circle Layout ── */}
            <div className="account-avatar-wrapper">
              {user.avatar ? (
                <img src={user.avatar} alt={user.HoTen} className="account-avatar-img" />
              ) : (
                <div className="account-avatar-fallback">
                  {user.HoTen ? user.HoTen.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <h3 className="account-sidebar-name">{user.HoTen}</h3>
            <span className="account-sidebar-email">{user.email}</span>
            {isGoogleLinked && <span className="account-badge-google">Google Linked</span>}
          </div>
          
          <button 
            className={`account-tab-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            👤 Hồ sơ của tôi
          </button>

          {/* Ẩn nút "Đổi mật khẩu" nếu user không có password (thuần Google) */}
          {showPasswordTab && (
            <button 
              className={`account-tab-item ${activeTab === 'password' ? 'active' : ''}`} 
              onClick={() => setActiveTab('password')}
            >
              🔑 Đổi mật khẩu
            </button>
          )}
        </div>

        {/* Content */}
        <div className="account-content">
          {activeTab === 'profile' && (
            <div>
              <h2 className="account-section-title">Hồ Sơ Của Tôi</h2>
              <p className="account-section-subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

              {profileMsg.text && (
                <div className={`account-message-banner account-message-banner--${profileMsg.type}`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="account-form">
                <div className="account-form-group">
                  <label className="account-form-label">Tên đăng nhập / Email</label>
                  <div className="account-input-disabled-wrap">
                    <input 
                      type="text" 
                      value={user.email} 
                      readOnly 
                      className="account-form-input account-form-input--disabled" 
                      title="Email là duy nhất và không thể thay đổi."
                    />
                    {isSocialUser && <span className="google-lock-icon" title="Đã xác thực qua Google">🔒</span>}
                  </div>
                </div>
                <div className="account-form-group">
                  <label className="account-form-label">Họ Tên</label>
                  <input type="text" value={profileForm.HoTen} onChange={e => setProfileForm({ ...profileForm, HoTen: e.target.value })} className="account-form-input" required />
                </div>
                <div className="account-form-group">
                  <label className="account-form-label">Số điện thoại</label>
                  <input type="text" value={profileForm.sdt} onChange={e => setProfileForm({ ...profileForm, sdt: e.target.value })} className="account-form-input" required />
                </div>
                <div className="account-form-group account-form-group--last">
                  <label className="account-form-label">Địa chỉ </label>
                  <textarea value={profileForm.diachi} onChange={e => setProfileForm({ ...profileForm, diachi: e.target.value })} className="account-form-textarea"></textarea>
                </div>
                <button type="submit" disabled={profileLoading} className="account-btn-submit">
                  {profileLoading ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && showPasswordTab && (
            <div>
              <h2 className="account-section-title">Đổi Mật Khẩu</h2>
              <p className="account-section-subtitle">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>

              {pwdMsg.text && (
                <div className={`account-message-banner account-message-banner--${pwdMsg.type}`}>
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="account-form">
                <div className="account-form-group">
                  <label className="account-form-label">Mật khẩu hiện tại</label>
                  <input type="password" value={pwdForm.old_password} onChange={e => setPwdForm({ ...pwdForm, old_password: e.target.value })} className="account-form-input" required />
                </div>
                <div className="account-form-group">
                  <label className="account-form-label">Mật khẩu mới</label>
                  <input type="password" value={pwdForm.password} onChange={e => setPwdForm({ ...pwdForm, password: e.target.value })} className="account-form-input" required placeholder="Tối thiểu 6 ký tự" />
                </div>
                <div className="account-form-group account-form-group--last">
                  <label className="account-form-label">Xác nhận mật khẩu mới</label>
                  <input type="password" value={pwdForm.password_confirmation} onChange={e => setPwdForm({ ...pwdForm, password_confirmation: e.target.value })} className="account-form-input" required />
                </div>
                <button type="submit" disabled={pwdLoading} className="account-btn-submit">
                  {pwdLoading ? 'Đang xử lý...' : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
