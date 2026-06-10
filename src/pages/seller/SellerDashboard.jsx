import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMyShop } from '../../api/shopApi';
import '../../styles/seller.css';

const BASE_URL = 'http://127.0.0.1:8000/storage/';

const IconEdit    = () => <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconShop    = () => <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconBox     = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconStar    = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

/* ── Trạng thái duyệt config ── */
const STATUS_CONFIG = {
  cho_duyet: {
    label:  'Đang chờ duyệt',
    desc:   'Gian hàng của bạn đang chờ quản trị viên xét duyệt. Thường trong 1-3 ngày làm việc.',
    icon:   '⏳',
    cls:    'cho_duyet',
  },
  da_duyet: {
    label:  'Đã được duyệt',
    desc:   'Chúc mừng! Gian hàng đã được duyệt. Bạn có thể bắt đầu đăng sản phẩm.',
    icon:   '✅',
    cls:    'da_duyet',
  },
  tu_choi: {
    label:  'Gian hàng bị từ chối',
    desc:   'Gian hàng của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.',
    icon:   '❌',
    cls:    'tu_choi',
  },
};

export default function SellerDashboard() {
  const [shop,    setShop]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getMyShop()
      .then(res => {
        if (res.data?.success) setShop(res.data.data);
        else setError(res.data?.message || 'Không lấy được thông tin gian hàng.');
      })
      .catch(err => {
        const msg = err?.response?.data?.message;
        if (err?.response?.status === 404) {
          setError('Bạn chưa đăng ký gian hàng.');
        } else {
          setError(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Auto polling (Cách 2) ── */
  useEffect(() => {
    let intervalId;

    // Chỉ bật polling nếu trạng thái đang là 'cho_duyet'
    if (shop && shop.TrangThaiDuyet === 'cho_duyet') {
      intervalId = setInterval(() => {
        getMyShop().then(res => {
          if (res.data?.success) {
            const newShop = res.data.data;
            
            // Nếu có sự thay đổi trạng thái
            if (newShop.TrangThaiDuyet === 'da_duyet') {
              alert('🎉 Gian hàng của bạn đã được duyệt!');
              setShop(newShop);
              window.dispatchEvent(new Event('auth-change')); // Gọi lại /api/me ở Navbar
            } else if (newShop.TrangThaiDuyet === 'tu_choi') {
              alert('❌ Gian hàng của bạn đã bị từ chối!');
              setShop(newShop);
            } else {
              // Vẫn đang chờ duyệt, update ngầm data lỡ có đổi tên/logo
              setShop(newShop);
            }
          }
        }).catch(err => console.error("Lỗi khi polling shop:", err));
      }, 30000); // Mỗi 30 giây
    }

    // Cleanup interval khi unmount hoặc khi trạng thái thay đổi
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [shop?.TrangThaiDuyet]);

  const status = shop ? (STATUS_CONFIG[shop.TrangThaiDuyet] || STATUS_CONFIG.cho_duyet) : null;

  return (
    <div className="seller-page">
      <Navbar />
      <div className="seller-dashboard">

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--seller-muted)' }}>
            <div style={{
              width: 44, height: 44,
              border: '4px solid #e8dfd0',
              borderTopColor: 'var(--seller-gold)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }} />
            Đang tải thông tin gian hàng...
          </div>
        )}

        {/* ── Error / no shop ── */}
        {!loading && error && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--seller-white)',
            borderRadius: 'var(--seller-radius)',
            boxShadow: 'var(--seller-shadow)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏪</div>
            <h2 style={{ color: 'var(--seller-brown)', marginBottom: '0.5rem' }}>
              {error}
            </h2>
            <p style={{ color: 'var(--seller-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Mở gian hàng ngay để bắt đầu bán đặc sản Miền Nam!
            </p>
            <Link to="/seller/register" className="seller-btn seller-btn-primary">
              Đăng ký gian hàng
            </Link>
          </div>
        )}

        {/* ── Shop loaded ── */}
        {!loading && shop && (
          <>
            {/* Status banner */}
            <div className={`seller-status-banner ${status.cls}`}>
              <span className="seller-status-icon">{status.icon}</span>
              <div className="seller-status-text">
                <h2>{status.label}</h2>
                <p>{status.desc}</p>
              </div>
            </div>

            {/* Mini stats */}
            <div className="seller-stats-row">
              {[
                { icon: '📦', value: '—', label: 'Sản phẩm' },
                { icon: '🛒', value: '—', label: 'Đơn hàng' },
                { icon: '⭐', value: '—', label: 'Đánh giá' },
              ].map((s, i) => (
                <div key={i} className="seller-stat-card">
                  <span className="seller-stat-icon">{s.icon}</span>
                  <div className="seller-stat-value">{s.value}</div>
                  <div className="seller-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Shop card */}
            <div className="seller-shop-card">

              {/* Banner */}
              {shop.baner ? (
                <img
                  src={`${BASE_URL}${shop.baner}`}
                  alt="Banner gian hàng"
                  className="seller-shop-banner"
                />
              ) : (
                <div className="seller-shop-banner-placeholder">🌴</div>
              )}

              {/* Head: logo + tên + actions */}
              <div className="seller-shop-head">
                {shop.logo ? (
                  <img
                    src={`${BASE_URL}${shop.logo}`}
                    alt="Logo gian hàng"
                    className="seller-shop-logo"
                  />
                ) : (
                  <div className="seller-shop-logo-placeholder">🏪</div>
                )}

                <div className="seller-shop-name-block">
                  <div className="seller-shop-name">{shop.TenShop}</div>
                  {shop.Tittle && <div className="seller-shop-tagline">{shop.Tittle}</div>}
                  <span className={`seller-status-pill ${shop.TrangThaiDuyet}`} style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
                    {status.icon} {status.label}
                  </span>
                </div>

                <div className="seller-shop-actions">
                  <Link to="/seller/shop/edit" className="seller-btn seller-btn-primary">
                    <IconEdit /> Chỉnh sửa
                  </Link>
                </div>
              </div>

              {/* Detail info */}
              <div className="seller-shop-body">
                <div className="seller-info-grid">
                  <div className="seller-info-item">
                    <span className="seller-info-label">📍 Địa chỉ</span>
                    <span className="seller-info-value">{shop.DiaChi || '—'}</span>
                  </div>
                  <div className="seller-info-item">
                    <span className="seller-info-label">🆔 CCCD</span>
                    <span className="seller-info-value">{shop.SCCD || '—'}</span>
                  </div>
                  <div className="seller-info-item">
                    <span className="seller-info-label">🏦 Ngân hàng</span>
                    <span className="seller-info-value">{shop.TenNganHang || '—'}</span>
                  </div>
                  <div className="seller-info-item">
                    <span className="seller-info-label">💳 Số tài khoản</span>
                    <span className="seller-info-value">{shop.SoTaiKhoang || '—'}</span>
                  </div>
                  <div className="seller-info-item">
                    <span className="seller-info-label">📅 Ngày đăng ký</span>
                    <span className="seller-info-value">
                      {shop.NgayDangKy
                        ? new Date(shop.NgayDangKy).toLocaleDateString('vi-VN')
                        : '—'}
                    </span>
                  </div>
                  {shop.NgayDuyet && (
                    <div className="seller-info-item">
                      <span className="seller-info-label">✅ Ngày duyệt</span>
                      <span className="seller-info-value">
                        {new Date(shop.NgayDuyet).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {shop.GioiThieu && (
                  <div className="seller-info-desc">
                    <div style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--seller-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                      📝 Giới thiệu
                    </div>
                    {shop.GioiThieu}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            {shop.TrangThaiDuyet === 'da_duyet' && (
              <div style={{
                background: 'var(--seller-white)',
                borderRadius: 'var(--seller-radius)',
                padding: '1.5rem',
                boxShadow: 'var(--seller-shadow)',
                border: '1px solid var(--seller-border)',
              }}>
                <div className="seller-section-title" style={{ marginBottom: '1rem' }}>
                  ⚡ Thao tác nhanh
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to="/seller/products" className="seller-btn seller-btn-primary">
                    📦 Quản lý sản phẩm
                  </Link>
                  <Link to="/seller/orders" className="seller-btn seller-btn-outline">
                    🛒 Đơn hàng
                  </Link>
                  <Link to="/seller/shop/edit" className="seller-btn seller-btn-outline">
                    ✏️ Sửa gian hàng
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
