import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useWallet } from '../../context/WalletContext';
import logoImg from '../../assets/logo.webp';
import '../../styles/home.css';

/* ── SVG Icons ──────────────────────────────────────────────── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   PublicNavbar — dùng cho tất cả trang Public
   ═══════════════════════════════════════════════════════════ */
export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { wallet, setWallet, walletLoading, fetchWallet } = useWallet();

  // ── Scroll effect ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Sync Cart Count ──────────────────────────────────────
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.SoLuong || item.qty || 1), 0);
        setCartCount(total);
      } catch (e) {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cart-change', updateCartCount);
    return () => window.removeEventListener('cart-change', updateCartCount);
  }, []);

  // ── Fetch current user + seed wallet từ /me (1 request duy nhất) ──────
  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      axiosClient.get('/me')
        .then(res => {
          const data = res.data?.data;
          if (data) {
            setUser(data);
            // ✅ Seed wallet từ dữ liệu đã gộp trong /me — không cần request /wallet riêng
            if (data.wallet) {
              setWallet(data.wallet);
            } else {
              // Fallback: nếu backend chưa gộp wallet thì vẫn fetch song song
              fetchWallet();
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    };

    fetchUser();
    window.addEventListener('auth-change', fetchUser);
    return () => window.removeEventListener('auth-change', fetchUser);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <img
            src={logoImg}
            alt="NamBộ Specialties Logo"
            className="logo-img"
            style={{ height: '42px', objectFit: 'contain' }}
          />
          <span className="logo-text">NamBộ<span>Specialties</span></span>
        </Link>

        {/* Nav links */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" end className={navClass} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, textAlign: 'center' }}>
            <span>Trang chủ</span>
          </NavLink>
          <NavLink to="/about" className={navClass} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, textAlign: 'center' }}>
            <span>Giới thiệu</span>
          </NavLink>
          <NavLink to="/products" className={navClass} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, textAlign: 'center' }}>
            <span>Đặc sản</span>
          </NavLink>
          <NavLink to="/map" className={navClass} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, textAlign: 'center' }}>
            <span>Bản đồ</span>
            <span>đặc sản</span>
          </NavLink>
          <NavLink to="/stories" className={navClass} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, textAlign: 'center' }}>
            <span>Câu chuyện</span>
            <span>sản vật</span>
          </NavLink>
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
            <span className="cart-count">{cartCount}</span>
          </Link>

          {/* User dropdown */}
          {user ? (
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className="dropdown-toggle"
                onClick={() => setUserMenuOpen(prev => !prev)}
                aria-expanded={userMenuOpen}
              >
                {wallet && (
                  <span
                    style={{ color: 'var(--shopee-orange)', fontWeight: 'bold', marginRight: '8px', cursor: 'pointer' }}
                    title={`Số dư khả dụng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance || 0)}\nĐóng băng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.frozen_balance || 0)}`}
                  >
                    💰 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance || 0)}
                  </span>
                )}
                <span>Chào, {user?.HoTen?.split(' ').pop() || 'Tài khoản'}</span>
                <IconChevronDown />
              </button>
              <div className={`dropdown-menu ${userMenuOpen ? 'show' : ''}`}>
                <Link to={(user?.shop || user?.role?.ID_role === 3) ? "/seller/wallet" : "/wallet"} onClick={() => setUserMenuOpen(false)}>
                  💰 Ví của tôi
                </Link>
                <Link to="/wallet/deposit" onClick={() => setUserMenuOpen(false)}>
                  ➕ Nạp tiền VNPay
                </Link>
                <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }}></div>
                <Link to="/account" onClick={() => setUserMenuOpen(false)}>
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

        {/* Hamburger Menu Toggle Button for Mobile */}
        <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(prev => !prev)} aria-label="Toggle navigation">
          {mobileMenuOpen ? <IconClose /> : <IconMenu />}
        </button>

      </div>
    </nav>
  );
}