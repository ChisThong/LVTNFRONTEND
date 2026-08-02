import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { formatPrice } from '../../api/productPublicApi';
import { Phone, Smartphone, MapPin, Search, Bell, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../styles/seller-products.css';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/storage/`;

const getProductImage = (item) => {
    if (!item) return 'https://via.placeholder.com/60';
    let imgName = null;
    if (Array.isArray(item.hinh_anh) && item.hinh_anh.length > 0) {
        imgName = item.hinh_anh[0].HinhAnh || item.hinh_anh[0].hinhanh;
    } else if (Array.isArray(item.hinhanh) && item.hinhanh.length > 0) {
        imgName = item.hinhanh[0].HinhAnh || item.hinhanh[0].hinhanh;
    } else if (typeof item.HinhAnh === 'string') {
        imgName = item.HinhAnh;
    } else if (typeof item.hinhanh === 'string') {
        imgName = item.hinhanh;
    }
    
    if (!imgName) return 'https://via.placeholder.com/60';
    return imgName.startsWith('http') ? imgName : `${BACKEND_URL}${imgName.startsWith('/') ? imgName.substring(1) : imgName}`;
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // States cho Tabs & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all', 0, 1, 2, 3, 4
  const [searchTerm, setSearchTerm] = useState('');

  // States cho Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const avatarText = user?.shop?.TenShop ? user.shop.TenShop.substring(0, 2).toUpperCase() : 'BT';
  const displayName = user?.shop?.TenShop || 'Cô Ba Bến Tre';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/seller/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (idDonHang, newStatus) => {
    let confirmMsg = 'Xác nhận cập nhật trạng thái đơn hàng này?';
    if (newStatus === 3) {
        confirmMsg = 'Xác nhận đơn hàng giao thành công? Doanh thu sẽ được cộng vào Ví của bạn.';
    }

    if (!window.confirm(confirmMsg)) return;
    
    try {
      toast.loading('Đang cập nhật...', { id: 'updateStatus' });
      await axiosClient.put(`/seller/orders/${idDonHang}/status`, { TrangThai: newStatus });
      toast.success('Cập nhật trạng thái thành công', { id: 'updateStatus' });
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái', { id: 'updateStatus' });
    }
  };

  // Helper cho giao diện Trạng Thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 0: return <span style={{ background: '#FFF7ED', color: '#EA580C', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Chờ xác nhận</span>;
      case 1: return <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Đang đóng gói</span>;
      case 2: return <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Đang giao</span>;
      case 3: return <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Hoàn thành</span>;
      case 4: return <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Đã hủy</span>;
      default: return <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Không rõ</span>;
    }
  };

  // Helper đếm số lượng đơn cho Tabs
  const getCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => Number(o.TrangThai) === status).length;
  };

  // Lọc danh sách theo Tab & Search
  const filteredOrders = orders.filter(order => {
    const matchTab = activeTab === 'all' || Number(order.TrangThai) === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      String(order.MaDonHangCon || order.ID_DonHang).toLowerCase().includes(searchLower) ||
      (order.thong_tin_giao_hang?.HoTen || '').toLowerCase().includes(searchLower) ||
      (order.thong_tin_giao_hang?.SoDienThoai || '').includes(searchLower);
    return matchTab && matchSearch;
  });

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Style helper cho Tab
  const tabStyle = (status) => ({
    padding: '12px 0',
    marginRight: '2rem',
    cursor: 'pointer',
    fontWeight: activeTab === status ? 'bold' : '600',
    color: activeTab === status ? '#1A1A1A' : '#6B7280',
    borderBottom: activeTab === status ? '2px solid #1A1A1A' : '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  });

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="sp-page-new">
      {/* ── MAIN CONTENT ── */}
      <div className="sp-content-new">
        <div className="sp-title-row" style={{ marginBottom: '2rem', marginTop: '1rem' }}>
          <h1 className="sp-title-text" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>Quản lý đơn hàng</h1>
        </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: '1.5rem', overflowX: 'auto', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          <div style={tabStyle('all')} onClick={() => { setActiveTab('all'); setCurrentPage(1); }}>
            Tất cả đơn <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{getCount('all')}</span>
          </div>
          <div style={tabStyle(0)} onClick={() => { setActiveTab(0); setCurrentPage(1); }}>
            Chờ xác nhận <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{getCount(0)}</span>
          </div>
          <div style={tabStyle(1)} onClick={() => { setActiveTab(1); setCurrentPage(1); }}>
            Đang đóng gói <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{getCount(1)}</span>
          </div>
          <div style={tabStyle(2)} onClick={() => { setActiveTab(2); setCurrentPage(1); }}>
            Đang giao <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{getCount(2)}</span>
          </div>
          <div style={tabStyle(3)} onClick={() => { setActiveTab(3); setCurrentPage(1); }}>
            Hoàn thành
          </div>
          <div style={tabStyle(4)} onClick={() => { setActiveTab(4); setCurrentPage(1); }}>
            Đã hủy
          </div>
        </div>

        {/* Search Input on the right of tabs */}
        <form className="sp-search-pill" onSubmit={(e) => e.preventDefault()} style={{ margin: '0 0 10px 0', minWidth: '280px', display: 'flex', alignItems: 'center' }}>
          <Search size={18} className="icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn, tên khách..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          />
          <button type="submit" style={{ border: 'none', background: '#2C3A29', color: '#FFF', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, marginLeft: '6px' }}>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: 'auto', width: '100%', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', background: '#FFF', border: '1px solid #F3F4F6' }}>
        <div style={{ minWidth: '1000px' }}>
          
          {/* Thead */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', background: '#FAFAFA', borderBottom: '1px solid #F3F4F6', borderRadius: '12px 12px 0 0', fontWeight: 'bold', color: '#4B5563', fontSize: '0.85rem' }}>
            <div>MÃ ĐƠN / NGÀY ĐẶT</div>
            <div>SẢN PHẨM</div>
            <div>KHÁCH HÀNG</div>
            <div>TỔNG TIỀN</div>
            <div style={{ textAlign: 'center' }}>TRẠNG THÁI</div>
            <div style={{ textAlign: 'center' }}>HÀNH ĐỘNG</div>
          </div>

          {/* Tbody */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
          ) : currentItems.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9CA3AF' }}>
              <p style={{ fontSize: '1.1rem' }}>Không tìm thấy đơn hàng nào phù hợp.</p>
            </div>
          ) : (
            <div>
              {currentItems.map((order, idx) => (
                <div key={order.ID_DonHang} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr 1fr 1fr 1fr', gap: '1rem', padding: '1.5rem', borderBottom: idx < currentItems.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>
                  
                  {/* Cột 1: Mã đơn & Ngày đặt */}
                  <div>
                    <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem', marginBottom: '4px' }}>
                      #{order.MaDonHangCon || order.ID_DonHang}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                      {formatDate(order.NgayTao || order.created_at)}
                    </div>
                  </div>

                  {/* Cột 2: Sản phẩm */}
                  <div>
                    {order.chi_tiet?.map((ct, i) => (
                      <div key={ct.ID_ChiTiet} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < order.chi_tiet.length - 1 ? '12px' : '0' }}>
                        <img 
                          src={getProductImage(ct.san_pham)} 
                          alt={ct.san_pham?.TenSanPham}
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB', flexShrink: 0 }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.95rem' }}>{ct.san_pham?.TenSanPham || 'Sản phẩm'}</div>
                          <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                            x {ct.SoLuong} | {formatPrice(ct.DonGia || (ct.TongGia / ct.SoLuong))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cột 3: Khách hàng */}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.95rem', marginBottom: '4px' }}>
                      {order.don_hang_tong?.NguoiNhan || order.nguoi_mua?.HoTen || order.nguoi_mua?.name || 'Khách hàng'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#6B7280', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '4px' }}>
                      <Smartphone size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                      <span>{order.don_hang_tong?.SDTNhan || order.nguoi_mua?.sdt || order.nguoi_mua?.phone || 'Chưa có'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#6B7280', fontSize: '0.85rem', lineHeight: '1.4' }}>
                      <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                      <span>{order.don_hang_tong?.DiaChiNhan || order.nguoi_mua?.dia_chi || order.nguoi_mua?.address || 'Chưa có'}</span>
                    </div>
                  </div>

                  {/* Cột 4: Tổng tiền */}
                  <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem' }}>
                    {formatPrice(order.TongGia + order.PhiVanChuyen)}
                  </div>

                  {/* Cột 5: Trạng thái */}
                  <div style={{ textAlign: 'center' }}>
                    {getStatusBadge(Number(order.TrangThai))}
                  </div>

                  {/* Cột 6: Hành động */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    {Number(order.TrangThai) === 0 && (
                      <button onClick={() => handleUpdateStatus(order.ID_DonHang, 1)} style={{ padding: '6px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.2s', width: '110px' }}>
                        Duyệt đơn
                      </button>
                    )}
                    {Number(order.TrangThai) === 1 && (
                      <button onClick={() => handleUpdateStatus(order.ID_DonHang, 2)} style={{ padding: '6px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.2s', width: '110px' }}>
                        Giao cho ĐVVC
                      </button>
                    )}
                    {Number(order.TrangThai) === 2 && (
                      <button onClick={() => handleUpdateStatus(order.ID_DonHang, 3)} style={{ padding: '6px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', color: '#111827', cursor: 'pointer', transition: 'all 0.2s', width: '110px' }}>
                        Theo dõi
                      </button>
                    )}
                    {/* Nút Chi tiết */}
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: '6px 16px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', color: '#2563EB', cursor: 'pointer', transition: 'all 0.2s', width: '110px' }}
                    >
                      Chi tiết
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      {filteredOrders.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
          <div style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500' }}>
            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} trong số {filteredOrders.length} đơn hàng
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', color: currentPage === 1 ? '#9CA3AF' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Trang trước
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: '36px', height: '36px',
                  background: currentPage === page ? '#111827' : '#FFF',
                  border: currentPage === page ? '1px solid #111827' : '1px solid transparent',
                  borderRadius: '8px',
                  fontWeight: '600',
                  color: currentPage === page ? '#FFF' : '#374151',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 16px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: '600', color: currentPage === totalPages ? '#9CA3AF' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG DÀNH CHO SELLER */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header Modal */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky', top: 0, background: '#FFF', zIndex: 10
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827', fontWeight: 800 }}>
                  Chi tiết đơn hàng #{selectedOrder.MaDonHangCon || selectedOrder.ID_DonHang}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#6B7280' }}>
                  Ngày đặt: {selectedOrder.NgayTao || selectedOrder.created_at || 'Mới đặt'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Thông tin giao hàng */}
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#111827', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📌 Thông tin người nhận
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Họ tên:</strong> {selectedOrder.don_hang_tong?.NguoiNhan || selectedOrder.nguoi_mua?.HoTen || selectedOrder.nguoi_mua?.name || 'Khách hàng'}</div>
                  <div><strong>Số điện thoại:</strong> {selectedOrder.don_hang_tong?.SDTNhan || selectedOrder.nguoi_mua?.sdt || selectedOrder.nguoi_mua?.phone || 'Chưa có'}</div>
                  <div><strong>Địa chỉ giao:</strong> {selectedOrder.don_hang_tong?.DiaChiNhan || selectedOrder.nguoi_mua?.diachi || selectedOrder.nguoi_mua?.address || 'Chưa có'}</div>
                  <div><strong>Ghi chú:</strong> {selectedOrder.GhiChu || 'Không có ghi chú'}</div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>
                  📦 Danh sách sản phẩm
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.chi_tiet?.map((ct) => (
                    <div key={ct.ID_ChiTiet} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px dashed #E5E7EB' }}>
                      <img 
                        src={getProductImage(ct.san_pham)} 
                        alt={ct.san_pham?.TenSanPham} 
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E7EB' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{ct.san_pham?.TenSanPham}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                          Số lượng: x{ct.SoLuong} | Đơn giá: {formatPrice(ct.DonGia || (ct.TongGia / ct.SoLuong))}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                        {formatPrice(ct.TongGia)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng thanh toán */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                  <span>Phương thức thanh toán:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.don_hang_tong?.PhuongThucThanhToan || 'COD'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                  <span>Phí vận chuyển:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{formatPrice(selectedOrder.PhiVanChuyen || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', marginTop: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>Tổng thanh toán:</span>
                  <strong style={{ color: '#2563EB', fontSize: '1.15rem' }}>{formatPrice(selectedOrder.TongGia + (selectedOrder.PhiVanChuyen || 0))}</strong>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', background: '#FAFAFA', borderRadius: '0 0 16px 16px' }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '8px 20px', background: '#374151', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
