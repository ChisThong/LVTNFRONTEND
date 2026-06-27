import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Package, Clock, CheckCircle, Truck, XCircle, Store, Star, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../../api/productPublicApi';
import '../../styles/orders.css';

const BACKEND_URL = "http://localhost:8000/storage/";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";

// ── Mapping trạng thái DB (số) ↔ tab key (chuỗi) ─────────────────────────────
const STATUS_MAP = {
  pending:    [0],       // Chờ xác nhận
  processing: [1],       // Đã xác nhận (đang xử lý)
  shipping:   [2],       // Đang giao
  completed:  [3],       // Hoàn tất
  cancelled:  [4],       // Đã hủy
};

const ORDER_TABS = [
  { key: 'all',        label: 'Tất cả' },
  { key: 'pending',    label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping',   label: 'Đang giao' },
  { key: 'completed',  label: 'Đã giao' },
  { key: 'cancelled',  label: 'Đã hủy' },
];

// ── Helper lấy ảnh ────────────────────────────────────────────────────────────
const getProductImage = (item) => {
  if (!item) return FALLBACK_IMAGE;
  let sp = item.san_pham || item.product || {};
  let imgPath = sp.HinhAnh || sp.hinhanh || sp.hinh_anh || sp.image || sp.HinhAnhDauTien;

  if (!imgPath || typeof imgPath !== 'string') {
    if (Array.isArray(sp.hinh_anh) && sp.hinh_anh.length > 0) {
      imgPath = sp.hinh_anh[0].HinhAnh || sp.hinh_anh[0].hinhanh;
    } else if (Array.isArray(sp.hinhanh) && sp.hinhanh.length > 0) {
      imgPath = sp.hinhanh[0].HinhAnh || sp.hinhanh[0].hinhanh;
    }
  }

  if (imgPath && typeof imgPath === 'string') {
    return imgPath.startsWith('http') ? imgPath : `${BACKEND_URL}${imgPath}`;
  }
  return FALLBACK_IMAGE;
};

// ── Component chính ───────────────────────────────────────────────────────────
export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('all'); 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewInputs, setReviewInputs] = useState({});
  const [submittingReview, setSubmittingReview] = useState({});

  const handleOpenReviewModal = (donHangCon) => {
    setSelectedOrder(donHangCon);
    const initialInputs = {};
    donHangCon.chi_tiet?.forEach(ct => {
      initialInputs[ct.ID_ChiTiet] = {
        XepLoai: 5,
        BinhLuan: '',
        HinhAnh: null,
        previewUrl: null
      };
    });
    setReviewInputs(initialInputs);
  };

  const handleRatingChange = (ctId, rating) => {
    setReviewInputs(prev => ({
      ...prev,
      [ctId]: {
        ...prev[ctId],
        XepLoai: rating
      }
    }));
  };

  const handleCommentChange = (ctId, text) => {
    setReviewInputs(prev => ({
      ...prev,
      [ctId]: {
        ...prev[ctId],
        BinhLuan: text
      }
    }));
  };

  const handleImageChange = (ctId, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setReviewInputs(prev => ({
        ...prev,
        [ctId]: {
          ...prev[ctId],
          HinhAnh: file,
          previewUrl: previewUrl
        }
      }));
    }
  };

  const handleCloseModal = () => {
    Object.values(reviewInputs).forEach(input => {
      if (input.previewUrl) {
        URL.revokeObjectURL(input.previewUrl);
      }
    });
    setSelectedOrder(null);
  };

  const handleSubmitReview = async (ctId, idSanPham) => {
    const input = reviewInputs[ctId];
    if (!input) return;

    setSubmittingReview(prev => ({ ...prev, [ctId]: true }));
    const formData = new FormData();
    formData.append('ID_ChiTiet', ctId);
    formData.append('ID_SanPham', idSanPham);
    formData.append('XepLoai', input.XepLoai);
    formData.append('BinhLuan', input.BinhLuan);
    if (input.HinhAnh) {
      formData.append('HinhAnh', input.HinhAnh);
    }

    try {
      toast.loading('Đang gửi đánh giá...', { id: 'submitReview' });
      const res = await axiosClient.post('/danh-gia', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Gửi đánh giá thành công!', { id: 'submitReview' });
      
      // Cập nhật trạng thái local
      setSelectedOrder(prevOrder => {
        if (!prevOrder) return null;
        return {
          ...prevOrder,
          chi_tiet: prevOrder.chi_tiet.map(ct => {
            if (ct.ID_ChiTiet === ctId) {
              return {
                ...ct,
                danh_gia: res.data.data
              };
            }
            return ct;
          })
        };
      });

      setOrders(prevOrders => {
        return prevOrders.map(dt => ({
          ...dt,
          don_hangs: dt.don_hangs?.map(dh => {
            if (dh.ID_DonHang === selectedOrder.ID_DonHang) {
              return {
                ...dh,
                chi_tiet: dh.chi_tiet?.map(ct => {
                  if (ct.ID_ChiTiet === ctId) {
                    return { ...ct, danh_gia: res.data.data };
                  }
                  return ct;
                })
              };
            }
            return dh;
          })
        }));
      });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại', { id: 'submitReview' });
    } finally {
      setSubmittingReview(prev => ({ ...prev, [ctId]: false }));
    }
  };

  // ── Fetch ──
  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/don-hang');
      setOrders(res.data.data.data || res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── Hủy đơn ──
  const handleCancelOrder = async (idDonHangCon) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Quá trình này không thể hoàn tác.')) return;
    try {
      toast.loading('Đang xử lý hủy đơn...', { id: 'cancelOrder' });
      const res = await axiosClient.put(`/orders/${idDonHangCon}/cancel`);
      toast.success(res.data.message || 'Đã hủy đơn hàng thành công!', { id: 'cancelOrder' });
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn', { id: 'cancelOrder' });
    }
  };

  // ── Xác nhận đã nhận hàng ──
  const handleConfirmReceived = async (idDonHangCon) => {
    if (!window.confirm('Bạn xác nhận đã nhận được hàng? Hành động này sẽ hoàn tất đơn hàng và giải ngân tiền cho Shop.')) return;
    try {
      toast.loading('Đang xử lý...', { id: 'confirmReceived' });
      const res = await axiosClient.put(`/don-hang/${idDonHangCon}/confirm-received`);
      toast.success(res.data.message || 'Xác nhận thành công! Cảm ơn bạn đã mua sắm.', { id: 'confirmReceived' });

      // Cập nhật optimistic UI: thây TrangThai 2 → 3 ngay không cần reload toàn bộ
      setOrders((prev) =>
        prev.map((dht) => ({
          ...dht,
          don_hangs: (dht.don_hangs || []).map((dc) =>
            dc.ID_DonHang === idDonHangCon ? { ...dc, TrangThai: 3 } : dc
          ),
        }))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.', { id: 'confirmReceived' });
    }
  };

  // ── Status helper ──
  const getStatusInfo = (status) => {
    switch (status) {
      case 0: return { label: 'Chờ xác nhận', color: '#f59e0b', icon: <Clock size={16}/> };
      case 1: return { label: 'Đã xác nhận',  color: '#3b82f6', icon: <CheckCircle size={16}/> };
      case 2: return { label: 'Đang giao',    color: '#10b981', icon: <Truck size={16}/> };
      case 3: return { label: 'Hoàn tất',     color: '#16a34a', icon: <CheckCircle size={16}/> };
      case 4: return { label: 'Đã hủy',       color: '#ef4444', icon: <XCircle size={16}/> };
      default:return { label: 'Không rõ',     color: '#6b7280', icon: <Package size={16}/> };
    }
  };

  // ── Filter theo tab ──
  // orders là mảng DonHangTong; mỗi DonHangTong có don_hangs[] (đơn con).
  // Một DonHangTong hiển thị khi có ÍT NHẤT 1 đơn con khớp với tab đang chọn.
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders
        .map((dht) => ({
          ...dht,
          don_hangs: (dht.don_hangs || []).filter((dc) =>
            STATUS_MAP[activeTab]?.includes(dc.TrangThai)
          ),
        }))
        .filter((dht) => dht.don_hangs.length > 0);

  // ── Đếm số đơn con theo tab (cho badge) ──
  const countByTab = (key) => {
    if (key === 'all') return orders.reduce((s, o) => s + (o.don_hangs?.length || 0), 0);
    return orders.reduce(
      (s, o) =>
        s + (o.don_hangs || []).filter((dc) => STATUS_MAP[key]?.includes(dc.TrangThai)).length,
      0
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="loading-screen order-loading-screen">
        <div className="spinner order-loading-spinner" />
        <p className="order-loading-text">Đang tải đơn hàng...</p>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="order-history-page">
      <div className="order-history-container">

        {/* ── Tiêu đề ── */}
        <h2 className="order-history-title">
          <Package color="var(--shopee-orange)" /> Đơn mua của tôi
        </h2>

        {/* ══════════════════════════════════════════════════
            THANH TAB TRẠNG THÁI — Shopee style
            ══════════════════════════════════════════════════ */}
        <div className="order-tabs">
          {ORDER_TABS.map((tab) => {
            const count   = countByTab(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`order-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`order-tab-btn ${isActive ? 'active' : ''}`}
              >
                {tab.label}
                {/* Badge số lượng */}
                {count > 0 && (
                  <span className="order-tab-badge">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════
            NỘI DUNG ĐƠN HÀNG
            ══════════════════════════════════════════════════ */}
        <div className="order-content-list">

          {/* Empty state toàn bộ */}
          {orders.length === 0 && (
            <div className="order-empty-state">
              <Package size={60} color="#ccc" className="order-empty-icon" />
              <h3>Chưa có đơn hàng nào</h3>
              <p className="order-empty-text">Bạn chưa có đơn hàng nào trong lịch sử.</p>
              <button onClick={() => navigate('/products')} className="shopee-btn">
                Tiếp tục mua sắm
              </button>
            </div>
          )}

          {/* Empty state theo tab */}
          {orders.length > 0 && filteredOrders.length === 0 && (
            <div className="order-empty-state">
              <ShoppingBag size={64} color="#e0e0e0" className="order-empty-icon" />
              <h3 className="order-empty-subtitle" style={{ color: '#bbb', fontWeight: 500 }}>Chưa có đơn hàng nào thuộc trạng thái này</h3>
              <p className="order-empty-subtitle">
                Thử chọn tab khác hoặc tiếp tục mua sắm nhé!
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="shopee-btn-outline order-empty-btn-all"
              >
                Xem tất cả đơn
              </button>
              <button
                onClick={() => navigate('/products')}
                className="shopee-btn order-empty-btn-shop"
              >
                Mua sắm ngay
              </button>
            </div>
          )}

          {/* Danh sách đơn hàng đã lọc */}
          {filteredOrders.map((donHangTong) => (
            <div key={donHangTong.ID_DonHangTong} className="order-group-wrapper">

              {/* Header đơn hàng tổng */}
              <div className="order-group-header">
                <div>
                  <strong className="order-group-id">
                    Mã Đơn Tổng: #{donHangTong.ID_DonHangTong}
                  </strong>
                  <span className="order-group-payment">
                    {donHangTong.PhuongThucThanhToan}
                    {donHangTong.TrangThaiThanhToan === 1 ? ' · Đã thanh toán' : ' · Chưa thanh toán'}
                  </span>
                </div>
                <strong className="order-group-total">
                  Tổng: {formatPrice(donHangTong.TongGiaTien)}
                </strong>
              </div>

              {/* Danh sách đơn con */}
              {donHangTong.don_hangs?.map((donHangCon) => {
                const statusInfo = getStatusInfo(donHangCon.TrangThai);
                const isLast = donHangTong.don_hangs.length === 1;
                return (
                  <div
                    key={donHangCon.ID_DonHang}
                    className={`order-item-card ${isLast ? 'order-item-card--last' : ''}`}
                  >
                    {/* Shop header */}
                    <div className="order-item-shop-header">
                      <div className="order-item-shop-info">
                        <Store size={18} />
                        {donHangCon.shop?.TenShop || 'Tên Shop'}
                        <button
                          className="shopee-btn-outline order-item-shop-btn"
                          onClick={() => navigate(`/shops/${donHangCon.ID_Shop}`)}
                        >
                          Xem Shop
                        </button>
                      </div>

                      {/* Badge trạng thái */}
                      <div
                        className="order-item-status-badge"
                        style={{
                          '--status-color': statusInfo.color,
                          '--status-bg': `${statusInfo.color}15`,
                          '--status-border': `${statusInfo.color}40`
                        }}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>

                    {/* Sản phẩm */}
                    {donHangCon.chi_tiet?.map((ct) => (
                      <div key={ct.ID_ChiTiet} className="order-item-product-row">
                        <img
                          src={getProductImage(ct)}
                          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                          alt="Product"
                          className="order-item-product-img"
                        />
                        <div className="order-item-product-info">
                          <h4 className="order-item-product-title">
                            {ct.san_pham?.TenSanPham}
                          </h4>
                          <div className="order-item-product-qty">x{ct.SoLuong}</div>
                        </div>
                        <div className="order-item-product-price">
                          {formatPrice(Number(ct.TongGia) || 0)}
                        </div>
                      </div>
                    ))}

                    {/* Action bar */}
                    <div className="order-item-action-row">
                      <div className="order-item-tracking-code">
                        Mã vận đơn: <span className="order-item-tracking-value">{donHangCon.MaVanDon || 'Chưa có'}</span>
                      </div>

                      <div className="order-item-buttons-group">
                        <div className="order-item-total-price-text">
                          Thành tiền:{' '}
                          <strong className="order-item-total-price-val">
                            {formatPrice(donHangCon.TongGia + donHangCon.PhiVanChuyen)}
                          </strong>
                        </div>

                        {/* Nút Hủy — chỉ khi chờ xác nhận */}
                        {donHangCon.TrangThai === 0 && (
                          <button
                            onClick={() => handleCancelOrder(donHangCon.ID_DonHang)}
                            className="order-item-btn-cancel"
                          >
                            Hủy Đơn
                          </button>
                        )}

                        {/* Nút Đã nhận được hàng — chỉ khi đang giao (2) */}
                        {donHangCon.TrangThai === 2 && (
                          <button
                            onClick={() => handleConfirmReceived(donHangCon.ID_DonHang)}
                            className="order-item-btn-confirm-received"
                          >
                            ✅ Đã nhận được hàng
                          </button>
                        )}

                        {/* Nút Đánh giá — chỉ khi hoàn tất */}
                        {donHangCon.TrangThai === 3 && (
                          <button 
                            onClick={() => handleOpenReviewModal(donHangCon)}
                            className="shopee-btn" 
                            style={{ padding: '8px 16px' }}
                          >
                            Đánh Giá
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>

      {/* Modal Đánh giá sản phẩm */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 'bold' }}>
                Đánh giá sản phẩm
              </h3>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', backgroundColor: '#f9fafb', padding: '10px 15px', borderRadius: '8px' }}>
                Đơn hàng con: <strong style={{ color: '#374151' }}>#{selectedOrder.ID_DonHang}</strong> ({selectedOrder.shop?.TenShop || 'Shop'})
              </div>

              {selectedOrder.chi_tiet?.map((ct) => {
                const isRated = !!ct.danh_gia;
                const input = reviewInputs[ct.ID_ChiTiet] || { XepLoai: 5, BinhLuan: '', HinhAnh: null };
                const isSubmitting = !!submittingReview[ct.ID_ChiTiet];

                return (
                  <div key={ct.ID_ChiTiet} style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: isRated ? '#f9fafb' : '#fff'
                  }}>
                    {/* Product Info */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <img 
                        src={getProductImage(ct)} 
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }} 
                        alt="Product" 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1f2937' }}>{ct.san_pham?.TenSanPham}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Đơn giá: {formatPrice(Number(ct.TongGia) / ct.SoLuong)} | Số lượng: {ct.SoLuong}</div>
                      </div>
                    </div>

                    {isRated ? (
                      /* Rated State */
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', color: '#166534', fontWeight: 'bold' }}>
                          <CheckCircle size={16} /> Đã đánh giá
                        </div>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={16} 
                              fill={star <= ct.danh_gia.XepLoai ? "#FFB300" : "none"} 
                              stroke="#FFB300" 
                            />
                          ))}
                        </div>
                        <p style={{ margin: 0, color: '#374151', fontStyle: ct.danh_gia.BinhLuan ? 'normal' : 'italic' }}>
                          {ct.danh_gia.BinhLuan || 'Không có bình luận.'}
                        </p>
                        {ct.danh_gia.HinhAnh && (
                          <div style={{ marginTop: '8px' }}>
                            <img 
                              src={`http://127.0.0.1:8000/storage/${ct.danh_gia.HinhAnh}`} 
                              alt="Review image" 
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Rating Form */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Rating Selection */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>Chất lượng sản phẩm:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={22} 
                                fill={star <= input.XepLoai ? "#FFB300" : "none"} 
                                stroke="#FFB300" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleRatingChange(ct.ID_ChiTiet, star)}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Comment Input */}
                        <div>
                          <textarea 
                            rows="3" 
                            placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                            value={input.BinhLuan}
                            onChange={(e) => handleCommentChange(ct.ID_ChiTiet, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '0.9rem',
                              outline: 'none',
                              resize: 'none'
                            }}
                          />
                        </div>

                        {/* Image Upload & Submit Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 12px',
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              color: '#374151',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}>
                              Chọn ảnh thực tế
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageChange(ct.ID_ChiTiet, e.target.files[0])}
                                style={{ display: 'none' }} 
                              />
                            </label>
                            {input.previewUrl && (
                              <img 
                                src={input.previewUrl} 
                                alt="Preview" 
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} 
                              />
                            )}
                          </div>

                          <button 
                            onClick={() => handleSubmitReview(ct.ID_ChiTiet, ct.ID_SanPham)}
                            disabled={isSubmitting}
                            style={{
                              padding: '8px 20px',
                              backgroundColor: 'var(--shopee-orange)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'opacity 0.2s',
                              opacity: isSubmitting ? 0.7 : 1
                            }}
                          >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              zIndex: 1
            }}>
              <button 
                onClick={handleCloseModal}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  color: '#374151',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
