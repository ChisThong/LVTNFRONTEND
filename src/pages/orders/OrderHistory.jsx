import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../../api/productPublicApi';

const BACKEND_URL = "http://localhost:8000/storage/";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";

// Helper lấy ảnh
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

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get('/don-hang');
      // Trả về là DonHangTong
      setOrders(res.data.data.data || res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (idDonHangCon) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Quá trình này không thể hoàn tác.')) {
      return;
    }

    try {
      toast.loading('Đang xử lý hủy đơn...', { id: 'cancelOrder' });
      const res = await axiosClient.put(`/orders/${idDonHangCon}/cancel`);
      toast.success(res.data.message || 'Đã hủy đơn hàng thành công!', { id: 'cancelOrder' });
      fetchOrders(); // Load lại danh sách sau khi hủy
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn', { id: 'cancelOrder' });
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 0: return { label: 'Chờ xác nhận', color: '#f59e0b', icon: <Clock size={16}/> };
      case 1: return { label: 'Đã xác nhận', color: '#3b82f6', icon: <CheckCircle size={16}/> };
      case 2: return { label: 'Đang giao', color: '#10b981', icon: <Truck size={16}/> };
      case 3: return { label: 'Hoàn tất', color: '#16a34a', icon: <CheckCircle size={16}/> };
      case 4: return { label: 'Đã hủy', color: '#ef4444', icon: <XCircle size={16}/> };
      default: return { label: 'Không rõ', color: '#6b7280', icon: <Package size={16}/> };
    }
  };

  if (loading) {
    return <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Đang tải...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '80vh', padding: '120px 5% 40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package color="var(--shopee-orange)" /> Đơn mua của tôi
        </h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '8px' }}>
            <Package size={60} color="#ccc" style={{ marginBottom: '1rem' }} />
            <h3>Chưa có đơn hàng nào</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Bạn chưa có đơn hàng nào trong lịch sử.</p>
            <button onClick={() => navigate('/products')} className="shopee-btn">Tiếp tục mua sắm</button>
          </div>
        ) : (
          orders.map((donHangTong) => (
            <div key={donHangTong.ID_DonHangTong} style={{ marginBottom: '2rem' }}>
              
              {/* Header Đơn hàng tổng */}
              <div style={{ background: '#fff', padding: '1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>Mã Đơn Tổng: #{donHangTong.ID_DonHangTong}</strong>
                  <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Thanh toán: {donHangTong.PhuongThucThanhToan} 
                    {donHangTong.TrangThaiThanhToan === 1 ? ' (Đã thanh toán)' : ' (Chưa thanh toán)'}
                  </span>
                </div>
                <strong style={{ color: 'var(--shopee-orange)' }}>Tổng: {formatPrice(donHangTong.TongGiaTien)}</strong>
              </div>

              {/* Danh sách các đơn hàng con (Mỗi shop 1 đơn con) */}
              {donHangTong.don_hangs?.map((donHangCon) => {
                const statusInfo = getStatusInfo(donHangCon.TrangThai);
                return (
                  <div key={donHangCon.ID_DonHang} style={{ background: '#fff', marginBottom: '0.5rem', padding: '1.5rem', borderRadius: donHangTong.don_hangs.length === 1 ? '0 0 8px 8px' : '0' }}>
                    
                    {/* Thông tin Shop */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        <Store size={18} /> {donHangCon.shop?.TenShop || 'Tên Shop'}
                        <button className="shopee-btn-outline" style={{ padding: '2px 8px', fontSize: '0.8rem', marginLeft: '10px' }} onClick={() => navigate(`/shops/${donHangCon.ID_Shop}`)}>Xem Shop</button>
                      </div>
                      <div style={{ color: statusInfo.color, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>

                    {/* Danh sách sản phẩm của Đơn con */}
                    {donHangCon.chi_tiet?.map((ct) => (
                      <div key={ct.ID_ChiTiet} style={{ display: 'flex', gap: '15px', marginBottom: '1rem' }}>
                        <img src={getProductImage(ct)} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} alt="Product" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 5px 0' }}>{ct.san_pham?.TenSanPham}</h4>
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>x{ct.SoLuong}</div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--shopee-orange)' }}>
                          {formatPrice(Number(ct.TongGia) || 0)}
                        </div>
                      </div>
                    ))}

                    {/* Action Bar của đơn con */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        Mã vận đơn: {donHangCon.MaVanDon || 'Chưa có'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div>Thành tiền: <strong style={{ color: 'var(--shopee-orange)', fontSize: '1.2rem' }}>{formatPrice(donHangCon.TongGia + donHangCon.PhiVanChuyen)}</strong></div>
                        
                        {/* NÚT HỦY ĐƠN - Chỉ hiện khi chờ xác nhận (0) */}
                        {donHangCon.TrangThai === 0 && (
                          <button 
                            onClick={() => handleCancelOrder(donHangCon.ID_DonHang)}
                            style={{ 
                              padding: '8px 16px', 
                              backgroundColor: '#fff', 
                              border: '1px solid #ccc', 
                              borderRadius: '4px', 
                              color: '#666',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.borderColor = '#d32f2f'; e.target.style.color = '#d32f2f'; }}
                            onMouseOut={(e) => { e.target.style.borderColor = '#ccc'; e.target.style.color = '#666'; }}
                          >
                            Hủy Đơn Hàng
                          </button>
                        )}

                        {donHangCon.TrangThai === 3 && (
                          <button className="shopee-btn" style={{ padding: '8px 16px' }}>Đánh Giá</button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
