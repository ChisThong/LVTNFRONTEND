import { NavLink , useNavigate} from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useState } from 'react';
import '../styles/navbar-admin.css';
import { 
    LayoutDashboard, 
    Store, 
    ShoppingBag, 
    Package, 
    Map, 
    FileText, 
    BarChart3 ,
    ChevronUp,
    LogOut,
    Settings,
    Home,
    User
} from 'lucide-react';

function AdminNavbar() {
    const navigate = useNavigate();
    const [ismenu,setmenu]=useState(false);
    const [userInfo] = useState(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return {
            name: parsedUser.HoTen || parsedUser.name || parsedUser.email || 'Admin',
            role: parsedUser.ID_role === 1 ? 'Quản trị viên tối cao' : 'Nhân viên'
        };
    }
    
    // Nếu chưa có data trong localStorage thì trả về mặc định
    return { name: 'Admin', role: 'Đang tải...' };
});
    const handleLogout = async () => {
        try {
            // axiosClient tự động đính kèm token, chỉ cần gọi endpoint
            await axiosClient.post('/logout'); 
        } catch (error) {
            console.error("Lỗi đăng xuất ở Backend:", error);
        } finally {
            // Xóa dữ liệu và đá về trang login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <NavLink to="/admin/dashboard" className="admin-logo">
                    <span style={{ fontSize: '1.8rem' }}>🌴</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>NamBộ</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '1px' }}>
                            CENTRAL
                        </span>
                    </div>
                </NavLink>
            </div>

            <nav className="sidebar-menu">
                <NavLink to="/admin/dashboard" className="menu-item">
                    <LayoutDashboard size={20} /> Dashboard hệ thống
                </NavLink>
                <NavLink to="/admin/shops" className="menu-item">
                    <Store size={20} /> Duyệt gian hàng
                </NavLink>
                <NavLink to="/admin/orders" className="menu-item">
                    <ShoppingBag size={20} /> Quản lý đơn hàng
                </NavLink>
                <NavLink to="/admin/products" className="menu-item">
                    <Package size={20} /> Quản lý sản phẩm
                </NavLink>
                <NavLink to="/admin/regions" className="menu-item">
                   <Map size={20} /> Danh mục vùng miền
                </NavLink>
                <NavLink to="/admin/posts" className="menu-item">
                    <FileText size={20} /> Quản lý bài viết
                </NavLink>
                <NavLink to="/admin/reports" className="menu-item">
                    <BarChart3 size={20} /> Báo cáo & Thống kê
                </NavLink>
                 <NavLink to="/admin/users" className="menu-item">
                    <User size={20} /> Quản lý người dùng
                </NavLink>
            </nav>

            <div className="sidebar-footer" style={{ position: 'relative' }}>
                
                {ismenu && (
                    <div className="user-dropdown-menu">
                        <button className="dropdown-item" onClick={() => navigate('/')}>
                            <Home size={16} /> Quay lại trang chủ
                        </button>
                        <button className="dropdown-item" onClick={() => navigate('/admin/settings')}>
                            <Settings size={16} /> Cài đặt tài khoản
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout" onClick={handleLogout}>
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    </div>
                )}

                <div 
                    className="admin-user" 
                    onClick={() => setmenu(!ismenu)} 
                    style={{ cursor: 'pointer' }}
                >
                    <img src={`https://ui-avatars.com/api/?name=${userInfo.name}&background=D4A373&color=fff`} alt="Admin" />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, color: 'white' }}>
                            {userInfo.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                            {userInfo.role}
                        </p>
                    </div>
                    <ChevronUp 
                        size={20} 
                        style={{ 
                            color: 'rgba(255,255,255,0.5)', 
                            transform: ismenu ? 'rotate(180deg)' : 'none', 
                            transition: 'transform 0.3s' 
                        }} 
                    />
                </div>
            </div>
        </aside>
    );
}

export default AdminNavbar;