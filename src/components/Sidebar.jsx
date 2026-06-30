import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useState, useEffect } from 'react';
import logoImg from '../assets/logo.webp';
import '../styles/navbar-admin.css';
import {
    LayoutDashboard, Store, ShoppingBag, Package, Map, FileText, BarChart3,
    ChevronUp, LogOut, Settings, Home, User, Menu,
    ShoppingCart, Star, ChevronDown, Wallet, MessageCircle
} from 'lucide-react';

function Sidebar({ role, mobileOpen, setMobileOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isShopSettingRoute =
        location.pathname.startsWith("/seller/settings") ||
        location.pathname.startsWith("/seller/shop/edit");

    const [shopMenuOpen, setShopMenuOpen] = useState(isShopSettingRoute);
    const [prevPath, setPrevPath] = useState(location.pathname);

    if (location.pathname !== prevPath) {
        setPrevPath(location.pathname);
        if (role === 'seller') {
            setShopMenuOpen(isShopSettingRoute);
        }
    }
    const storageKey = role === 'admin' ? "adminSidebarCollapsed" : "sellerSidebarCollapsed";
    const dashboardLink = role === 'admin' ? "/admin/dashboard" : "/seller/dashboard";
    const logoText = role === 'admin' ? "NamBộ CENTRAL" : "Kênh Người Bán";
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem(storageKey) === "true";
    });

    const toggleSidebar = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem(storageKey, newState);
    };

    const handleMenuClick = () => {
        setCollapsed(true);
        localStorage.setItem(storageKey, "true");
        if (setMobileOpen) setMobileOpen(false);
    };
    const [ismenu, setmenu] = useState(false);

    const [userInfo] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (role === 'admin') {
                return {
                    name: parsedUser.HoTen || parsedUser.name || parsedUser.email || 'Admin',
                    role: parsedUser.ID_role === 1 ? 'Quản trị viên tối cao' : 'Nhân viên'
                };
            } else {
                return {
                    name: parsedUser.HoTen || 'Người bán',
                    role: 'Chủ shop'
                };
            }
        }
        return { name: role === 'admin' ? 'Admin' : 'Người bán', role: 'Đang tải...' };
    });

    const handleLogout = async () => {
        try {
            if (role === 'admin') {
                await axiosClient.post('/logout');
            }
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    // ── Sync Unread Chat Count ──────────────────────────────────
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const fetchUnreadCount = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUnreadChatCount(0);
            return;
        }
        axiosClient.get('/chat/so-tin-chua-doc')
            .then(res => {
                if (res.data?.success) {
                    setUnreadChatCount(res.data.tong_chua_doc || 0);
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        fetchUnreadCount();
        window.addEventListener('chat-unread-change', fetchUnreadCount);
        window.addEventListener('auth-change', fetchUnreadCount);
        return () => {
            window.removeEventListener('chat-unread-change', fetchUnreadCount);
            window.removeEventListener('auth-change', fetchUnreadCount);
        };
    }, [role]);

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header" style={{ position: 'relative', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <NavLink to={dashboardLink} className="admin-logo">
                    <img
                        src={logoImg}
                        alt="NamBộ Specialties Logo"
                        style={{ height: '36px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    {role === 'admin' ? (
                        <div className="admin-logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1 }}>NamBộ</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '1px' }}>
                                CENTRAL
                            </span>
                        </div>
                    ) : (
                        <span className="admin-logo-text" style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 700 }}>{logoText}</span>
                    )}
                </NavLink>
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: 'absolute',
                        right: collapsed ? '0' : '15px',
                        left: collapsed ? '0' : 'auto',
                        margin: collapsed ? '0 auto' : '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex'
                    }}
                    title={collapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
                >
                    <Menu size={20} />
                </button>
            </div>

            <nav className="sidebar-menu">
                {role === 'admin' && (
                    <>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Dashboard hệ thống">
                            <LayoutDashboard size={20} /> <span>Dashboard hệ thống</span>
                        </NavLink>
                       
                        <NavLink to="/admin/shops" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Duyệt gian hàng">
                            <Store size={20} /> <span>Duyệt gian hàng</span>
                        </NavLink>
                        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Quản lý đơn hàng">
                            <ShoppingBag size={20} /> <span>Quản lý đơn hàng</span>
                        </NavLink>
                        <NavLink to="/admin/products" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Quản lý sản phẩm">
                            <Package size={20} /> <span>Quản lý sản phẩm</span>
                        </NavLink>
                        <NavLink to="/admin/regions" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Danh mục vùng miền">
                            <Map size={20} /> <span>Danh mục vùng miền</span>
                        </NavLink>
                        <NavLink to="/admin/posts" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Quản lý bài viết">
                            <FileText size={20} /> <span>Quản lý bài viết</span>
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Quản lý người dùng">
                            <User size={20} /> <span>Quản lý người dùng</span>
                        </NavLink>
                        <NavLink to="/admin/wallet" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Quản lý Ví điện tử">
                            <Wallet size={20} /> <span>Quản lý Ví điện tử</span>
                        </NavLink>
                         <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} onClick={handleMenuClick} data-tooltip="Báo cáo & Thống kê">
                            <BarChart3 size={20} /> <span>Báo cáo & Thống kê</span>
                        </NavLink>
                    </>
                )}

                {role === 'seller' && (
                    <>
                        <NavLink to="/seller/dashboard" end className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Tổng quan" onClick={handleMenuClick}>
                            <Store size={20} /> <span>Tổng quan</span>
                        </NavLink>
                        <NavLink to="/seller/chat" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Tin nhắn" onClick={handleMenuClick} style={{ position: 'relative' }}>
                            <MessageCircle size={20} /> <span>Tin nhắn</span>
                            {unreadChatCount > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: collapsed ? '4px' : '50%',
                                    right: collapsed ? '4px' : '15px',
                                    transform: collapsed ? 'none' : 'translateY(-50%)',
                                    background: '#EF4444',
                                    color: '#ffffff',
                                    borderRadius: '10px',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    padding: '2px 5px',
                                    minWidth: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    zIndex: 10
                                }}>
                                    {unreadChatCount}
                                </div>
                            )}
                        </NavLink>
                        <NavLink to="/seller/wallet" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Ví điện tử của Shop" onClick={handleMenuClick}>
                            <Wallet size={20} /> <span>Ví điện tử</span>
                        </NavLink>
                        <NavLink to="/seller/products" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Quản lý sản phẩm" onClick={handleMenuClick}>
                            <Package size={20} /> <span>Quản lý sản phẩm</span>
                        </NavLink>
                        <NavLink to="/seller/orders" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Quản lý đơn hàng" onClick={handleMenuClick}>
                            <ShoppingCart size={20} /> <span>Quản lý đơn hàng</span>
                        </NavLink>
                        <NavLink to="/seller/reviews" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Đánh giá khách hàng" onClick={handleMenuClick}>
                            <Star size={20} /> <span>Đánh giá khách hàng</span>
                        </NavLink>
                        <NavLink to="/seller/revenue" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} data-tooltip="Thống kê doanh thu" onClick={handleMenuClick}>
                            <BarChart3 size={20} /> <span>Thống kê doanh thu</span>
                        </NavLink>

                        {/* Cài đặt gian hàng Dropdown */}
                        <div style={{ marginTop: '0.5rem' }}>
                            <button
                                onClick={() => {
                                    if (collapsed) setCollapsed(false);
                                    setShopMenuOpen(!shopMenuOpen);
                                }}
                                className={`menu-item ${isShopSettingRoute ? 'active' : ''}`}
                                style={{ width: '100%', background: isShopSettingRoute ? 'var(--sidebar-active)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: isShopSettingRoute ? '#fff' : 'rgba(255, 255, 255, 0.65)' }}
                                data-tooltip="Cài đặt gian hàng"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Settings size={20} />
                                    <span>Cài đặt gian hàng</span>
                                </div>
                                <ChevronDown size={16} className={`submenu-chevron ${shopMenuOpen ? 'open' : ''}`} />
                            </button>

                            <div className={`submenu-container ${shopMenuOpen ? 'open' : ''}`}>
                                <NavLink to="/seller/settings/profile" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} data-tooltip="Thông tin cửa hàng" onClick={handleMenuClick}>
                                    <User size={16} /> <span>Thông tin cửa hàng</span>
                                </NavLink>
                                <NavLink to="/seller/settings/shipping" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"} style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} data-tooltip="Vận chuyển" onClick={handleMenuClick}>
                                    <Package size={16} /> <span>Vận chuyển</span>
                                </NavLink>
                            </div>
                        </div>
                    </>
                )}
            </nav>

            <div className="sidebar-footer" style={{ position: 'relative' }}>
                {ismenu && (
                    <div className="user-dropdown-menu">
                        <button className="dropdown-item" onClick={() => navigate('/')}>
                            <Home size={16} /> Quay lại trang chủ
                        </button>
                        {role === 'admin' && (
                            <button className="dropdown-item" onClick={() => navigate('/admin/settings')}>
                                <Settings size={16} /> Cài đặt tài khoản
                            </button>
                        )}
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
                    title={collapsed ? userInfo.name : ""}
                >
                    <img src={`https://ui-avatars.com/api/?name=${userInfo.name}&background=D4A373&color=fff`} alt={role === 'admin' ? 'Admin' : 'Seller'} />
                    <div className="admin-user-info" style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {userInfo.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {userInfo.role}
                        </p>
                    </div>
                    <ChevronUp
                        size={20}
                        className="admin-user-chevron"
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

export default Sidebar;
