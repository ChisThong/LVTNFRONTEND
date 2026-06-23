import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import logoImg from '../assets/logo.webp';

/* SVG Icons */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconLogOut = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const IconBox = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [user, setUser]               = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef                   = useRef(null);
  const navigate                      = useNavigate();

  // ── Scroll effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch current user ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axiosClient.get('/me')
          .then(res => {
            if (res.data && res.data.data) setUser(res.data.data);
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

  // ── Close dropdown khi click bên ngoài ────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setUserMenuOpen(false);
      navigate('/');
    }
  };

  // ── NavLink class helper — dùng function để React Router tự xử lý active ──
  const navLinkClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <img
            src={logoImg}
            alt="NamBộ Specialties Logo"
            className="logo-img"
            style={{ height: '42px', objectFit: 'contain' }}
          />
          <span className="logo-text">NamBộ<span>Specialties</span></span>
        </Link>

        {/* Nav links — dùng NavLink để active tự động theo route */}
        <div className="nav-links">
          {/* Trang chủ: chỉ active khi path === "/" (end=true) */}
          <NavLink to="/" end className={navLinkClass}>
            Trang chủ
          </NavLink>

          {/* Giới thiệu */}
          <NavLink to="/about" className={navLinkClass}>
            Giới thiệu
          </NavLink>

          {/* Đặc sản: active khi path bắt đầu bằng /products */}
          <NavLink
            to="/products"
            className={({ isActive, isPending }) =>
              (isActive || isPending) ? 'active' : ''
            }
          >
            Đặc sản
          </NavLink>

          {/* Bản đồ đặc sản */}
          <NavLink to="/map" className={navLinkClass}>
            Bản đồ đặc sản
          </NavLink>

          {/* Câu chuyện sản vật */}
          <NavLink to="/intro" className={navLinkClass}>
            Câu chuyện sản vật
          </NavLink>
        </div>

        {/* Nav actions */}
        <div className="nav-actions">
          <button className="search-btn" aria-label="Tìm kiếm">
            <IconSearch />
          </button>

          <Link
            to="/cart"
            className="cart-btn"
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
                  <IconUser />
                  Tài khoản của tôi
                </Link>
                <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                  <IconBox />
                  Đơn mua
                </Link>
                <button onClick={handleLogout} className="logout">
                  <IconLogOut />
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Đăng nhập</Link>
          )}

          {/* Seller button */}
          {user && user.shop ? (
            <Link to="/seller/dashboard" className="seller-btn">
              <span>Quản lý</span>
              <span>gian hàng</span>
            </Link>
          ) : (
            <Link to="/seller/register" className="seller-btn">
              <span>Kênh</span>
              <span>người bán</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
