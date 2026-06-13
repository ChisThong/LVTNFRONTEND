import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

/* ── SVG Icons ──────────────────────────────────────────────── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   PublicNavbar — dùng cho tất cả trang Public
   ═══════════════════════════════════════════════════════════ */
export default function PublicNavbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [user, setUser]                 = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef                     = useRef(null);
  const navigate                        = useNavigate();

  // ── Scroll effect ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch current user ───────────────────────────────────
  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axiosClient.get('/me')
          .then(res => {
            if (res.data?.data) setUser(res.data.data);
          })
          .catch(() => {
            localStorage.removeItem('token');
            setUser(null);
          });
      } else {
        setUser(null);
      }
    };
    fetchUser();
    window.addEventListener('auth-change', fetchUser);
    return () => window.removeEventListener('auth-change', fetchUser);
  }, []);

  // ── Close dropdown khi click ngoài ──────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const handleLogout = async () => {
    try { await axiosClient.post('/auth/logout'); } catch (e) { console.error(e); }
    finally {
      localStorage.removeItem('token');
      setUser(null);
      setUserMenuOpen(false);
      navigate('/');
    }
  };

  // NavLink class helper
  const navClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon">🌴</span>
          <span className="logo-text">NamBộ<span>Specialties</span></span>
        </Link>

        {/* Nav links — NavLink tự active theo route */}
        <div className="nav-links">
          {/* "/" — end prop: chỉ active khi path === "/" */}
          <NavLink to="/" end className={navClass}>Trang chủ</NavLink>
          <NavLink to="/about"    className={navClass}>Giới thiệu</NavLink>
          {/* "/products" — active khi /products hoặc /products/:id */}
          <NavLink to="/products" className={navClass}>Đặc sản</NavLink>
          <NavLink to="/map"      className={navClass}>Bản đồ đặc sản</NavLink>
          <NavLink to="/stories"  className={navClass}>Câu chuyện sản vật</NavLink>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <button className="search-btn" aria-label="Tìm kiếm">
            <IconSearch />
          </button>

          <Link to="/cart" className="cart-btn"
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
            aria-label="Giỏ hàng"
          >
            <IconCart />
            <span className="cart-count">0</span>
          </Link>

          {/* User dropdown */}
          {user ? (
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className="dropdown-toggle"
                onClick={() => setUserMenuOpen(prev => !prev)}
                aria-expanded={userMenuOpen}
              >
                <span>Chào, {user.HoTen?.split(' ').pop() || 'Tài khoản'}</span>
                <IconChevronDown />
              </button>
              <div className={`dropdown-menu ${userMenuOpen ? 'show' : ''}`}>
                <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                  <IconUser /> Tài khoản của tôi
                </Link>
                <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                  <IconBox /> Đơn mua
                </Link>
                <button onClick={handleLogout} className="logout">
                  <IconLogOut /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Đăng nhập</Link>
          )}

          {/* Seller button */}
          {user?.shop ? (
            <Link to="/seller/dashboard" className="seller-btn">
              <span>Quản lý</span><span>gian hàng</span>
            </Link>
          ) : (
            <Link to="/seller/register" className="seller-btn">
              <span>Kênh</span><span>người bán</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
