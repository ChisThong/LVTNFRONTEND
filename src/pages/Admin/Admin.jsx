import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Menu, Bell } from 'lucide-react';
import '../../styles/navbar-admin.css';

function Admin() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Map location pathname to readable title
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/dashboard')) return 'Dashboard hệ thống';
        if (path.includes('/admin/shops')) return 'Duyệt gian hàng';
        if (path.includes('/admin/orders')) return 'Quản lý đơn hàng';
        if (path.includes('/admin/products')) return 'Quản lý sản phẩm';
        if (path.includes('/admin/regions')) return 'Danh mục vùng miền';
        if (path.includes('/admin/posts')) return 'Quản lý bài viết';
        if (path.includes('/admin/reports')) return 'Báo cáo & Thống kê';
        if (path.includes('/admin/users')) return 'Quản lý người dùng';
        return 'Báo cáo & Thống kê';
    };

    return (
        <div className="admin-layout-container">
            {/* Mobile Header */}
            <header className="admin-mobile-header">
                <div className="mobile-header-left">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="mobile-header-title">{getPageTitle()}</span>
                </div>
                <div className="mobile-header-right">
                    <button className="mobile-nav-link" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span>Về</span>
                        <span>trang chủ</span>
                    </button>
                    <button className="mobile-bell-btn">
                        <Bell size={20} />
                        <span className="mobile-bell-badge"></span>
                    </button>
                </div>
            </header>

            {/* Sidebar Backdrop */}
            <div 
                className={`admin-sidebar-backdrop ${sidebarOpen ? 'show' : ''}`} 
                onClick={() => setSidebarOpen(false)}
            />

            <div className="admin-wrapper">
                <Sidebar role="admin" mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Admin;
