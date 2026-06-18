import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

// Tạm dùng CSS in-line hoặc tái sử dụng class có sẵn để nhanh gọn
// Nếu cần có thể tạo src/styles/account.css sau
const pageStyle = {
  padding: '120px 5%',
  minHeight: '80vh',
  backgroundColor: '#f9f9f9'
};

const containerStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  display: 'flex',
  gap: '2rem',
  alignItems: 'flex-start'
};

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  padding: '1rem',
  flexShrink: 0
};

const contentStyle = {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  padding: '2rem'
};

const tabItemStyle = (isActive) => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '1rem',
  border: 'none',
  backgroundColor: isActive ? '#f0fdf4' : 'transparent',
  color: isActive ? '#16a34a' : '#333',
  fontWeight: isActive ? 'bold' : 'normal',
  cursor: 'pointer',
  borderLeft: isActive ? '4px solid #16a34a' : '4px solid transparent',
  marginBottom: '0.5rem',
  transition: 'all 0.2s'
});

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
      alert(res.data.message);
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

  if (!user) return <div style={pageStyle}>Đang tải dữ liệu...</div>;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.HoTen}</h3>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</span>
          </div>
          <button style={tabItemStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>
            Hồ sơ của tôi
          </button>
          <button style={tabItemStyle(activeTab === 'password')} onClick={() => setActiveTab('password')}>
            Đổi mật khẩu
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Hồ Sơ Của Tôi</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
              
              {profileMsg.text && (
                <div style={{ 
                  padding: '1rem', marginBottom: '1rem', borderRadius: '4px',
                  backgroundColor: profileMsg.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: profileMsg.type === 'success' ? '#2e7d32' : '#c62828'
                }}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tên đăng nhập / Email</label>
                  <input type="text" value={user.email} disabled style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f5f5f5' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Họ Tên</label>
                  <input type="text" value={profileForm.HoTen} onChange={e => setProfileForm({...profileForm, HoTen: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Số điện thoại</label>
                  <input type="text" value={profileForm.sdt} onChange={e => setProfileForm({...profileForm, sdt: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} required />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Địa chỉ giao hàng mặc định</label>
                  <textarea value={profileForm.diachi} onChange={e => setProfileForm({...profileForm, diachi: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}></textarea>
                </div>
                <button type="submit" disabled={profileLoading} style={{ padding: '0.8rem 2rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {profileLoading ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Đổi Mật Khẩu</h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              
              {pwdMsg.text && (
                <div style={{ 
                  padding: '1rem', marginBottom: '1rem', borderRadius: '4px',
                  backgroundColor: pwdMsg.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: pwdMsg.type === 'success' ? '#2e7d32' : '#c62828'
                }}>
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mật khẩu hiện tại</label>
                  <input type="password" value={pwdForm.old_password} onChange={e => setPwdForm({...pwdForm, old_password: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} required />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mật khẩu mới</label>
                  <input type="password" value={pwdForm.password} onChange={e => setPwdForm({...pwdForm, password: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} required placeholder="Tối thiểu 6 ký tự" />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Xác nhận mật khẩu mới</label>
                  <input type="password" value={pwdForm.password_confirmation} onChange={e => setPwdForm({...pwdForm, password_confirmation: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} required />
                </div>
                <button type="submit" disabled={pwdLoading} style={{ padding: '0.8rem 2rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
