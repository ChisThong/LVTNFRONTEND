import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/navbar-admin.css';
import '../styles/seller.css';

function SellerLayout() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isShopLocked = user?.shop?.TrangThai === 0;

  return (
    <div className="admin-wrapper" style={{ '--sidebar-bg': '#2C3A29', '--sidebar-active': '#4A5B45', '--gold': '#D2B48C' }}>
      <Sidebar role="seller" />
      {/* Main content */}
      <main className="admin-main" style={{ background: '#F8F5F1', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isShopLocked && (
          <div style={{
            background: '#FEF2F2', borderLeft: '4px solid #DC2626', color: '#991B1B',
            padding: '1rem 1.5rem', margin: '0', fontWeight: 600, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            Gian hàng của bạn hiện đang bị quản trị viên tạm khóa. Bạn không thể thêm mới hoặc chỉnh sửa sản phẩm.
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Outlet context={{ isShopLocked }} />
        </div>
      </main>
    </div>
  );
}

export default SellerLayout;
