import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { 
    Search, 
    Eye, 
    X, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    ShoppingBag, 
    Truck, 
    CheckCircle2, 
    AlertCircle, 
    Filter,
    User,
    Store,
    DollarSign,
    Package
} from 'lucide-react';
import Swal from 'sweetalert2';
import '../../styles/navbar-admin.css';

function DonHangControl() {
    // Các bộ lọc & Phân trang
    const [maDonCon, setMaDonCon] = useState('');
    const [tenKhach, setTenKhach] = useState('');
    const [tenShop, setTenShop] = useState('');
    const [trangThai, setTrangThai] = useState('');
    const [tuNgay, setTuNgay] = useState('');
    const [denNgay, setDenNgay] = useState('');
    const [page, setPage] = useState(1);

    // Lưu trữ tạm thời các giá trị lọc trước khi bấm "Lọc" (hoặc tự động debounce)
    // Để nâng cao UX, chúng ta sẽ cho lọc tự động khi nhập có debounce nhẹ hoặc lọc ngay lập tức
    const [filterParams, setFilterParams] = useState({
        MaDonHangCon: '',
        TenKhachHang: '',
        TenShop: '',
        TrangThai: '',
        TuNgay: '',
        DenNgay: ''
    });

    // Xem chi tiết đơn hàng
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    // 1. Fetch danh sách đơn hàng & các số liệu thống kê bằng React Query
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['adminOrders', filterParams, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filterParams.MaDonHangCon) params.append('MaDonHangCon', filterParams.MaDonHangCon);
            if (filterParams.TenKhachHang) params.append('TenKhachHang', filterParams.TenKhachHang);
            if (filterParams.TenShop) params.append('TenShop', filterParams.TenShop);
            if (filterParams.TrangThai !== '') params.append('TrangThai', filterParams.TrangThai);
            if (filterParams.TuNgay) params.append('TuNgay', filterParams.TuNgay);
            if (filterParams.DenNgay) params.append('DenNgay', filterParams.DenNgay);
            params.append('page', page);

            const response = await axiosClient.get(`/admin/DonHang?${params.toString()}`);
            return response.data;
        },
        keepPreviousData: true,
        staleTime: 5000,
    });

    // 2. Fetch chi tiết đơn hàng
    const { data: orderDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['adminOrderDetail', selectedOrderId],
        queryFn: async () => {
            if (!selectedOrderId) return null;
            const response = await axiosClient.get(`/admin/DonHang/${selectedOrderId}`);
            return response.data?.data || null;
        },
        enabled: !!selectedOrderId,
        onError: (err) => {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
            Swal.fire('Lỗi hệ thống', 'Không thể lấy thông tin chi tiết đơn hàng.', 'error');
        }
    });

    // Các biến dữ liệu
    const orders = data?.data?.data || [];
    const pagination = data?.data || {};
    const stats = {
        tongdon: data?.tongdon || 0,
        demdanggiao: data?.demdanggiao || 0,
        demhoantat: data?.demhoantat || 0,
        demhuy: data?.demhuy || 0
    };

    // Áp dụng bộ lọc
    const handleApplyFilters = (e) => {
        if (e) e.preventDefault();
        setFilterParams({
            MaDonHangCon: maDonCon,
            TenKhachHang: tenKhach,
            TenShop: tenShop,
            TrangThai: trangThai,
            TuNgay: tuNgay,
            DenNgay: denNgay
        });
        setPage(1); // Reset về trang 1 khi lọc
    };

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setMaDonCon('');
        setTenKhach('');
        setTenShop('');
        setTrangThai('');
        setTuNgay('');
        setDenNgay('');
        setFilterParams({
            MaDonHangCon: '',
            TenKhachHang: '',
            TenShop: '',
            TrangThai: '',
            TuNgay: '',
            DenNgay: ''
        });
        setPage(1);
    };

    // Xem chi tiết đơn
    const handleOpenDetail = (id) => {
        setSelectedOrderId(id);
        setDetailModalOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setSelectedOrderId(null);
    };

    // Định dạng tiền tệ
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Ánh xạ trạng thái đơn hàng (TrangThai TINYINT: 0, 1, 2, 3, 4)
    const getOrderStatus = (status) => {
        const statusNum = Number(status);
        switch (statusNum) {
            case 0:
                return {
                    label: 'Chờ xác nhận',
                    color: '#D97706',
                    bg: '#FEF3C7',
                    className: 'badge-pending'
                };
            case 1:
                return {
                    label: 'Đang chuẩn bị',
                    color: '#2563EB',
                    bg: '#DBEAFE',
                    className: 'badge-info'
                };
            case 2:
                return {
                    label: 'Đang giao hàng',
                    color: '#6366F1',
                    bg: '#EEF2FF',
                    className: 'badge-shipping'
                };
            case 3:
                return {
                    label: 'Đã giao/Hoàn tất',
                    color: '#059669',
                    bg: '#D1FAE5',
                    className: 'badge-success'
                };
            case 4:
                return {
                    label: 'Đã hủy',
                    color: '#DC2626',
                    bg: '#FEE2E2',
                    className: 'badge-danger'
                };
            default:
                return {
                    label: 'Không xác định',
                    color: '#4B5563',
                    bg: '#F3F4F6',
                    className: 'badge-unknown'
                };
        }
    };

    return (
        <div className="view-section" style={{ position: 'relative' }}>
            {/* Tiêu đề trang */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="admin-title" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#3A2E26' }}>
                    Quản lý đơn hàng toàn hệ thống
                </h2>
                <p style={{ color: '#8C7B6D', marginTop: '0.5rem', fontSize: '1rem' }}>
                    Theo dõi, kiểm tra thông tin giao dịch giữa các Shop bán hàng và Khách hàng.
                </p>
            </div>

            {/* Khối thống kê (Stat Grid) */}
            <div className="stat-grid" style={{ marginBottom: '2rem' }}>
                {/* Tổng đơn hàng */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(74, 59, 50, 0.1)', color: '#4A3B32' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng đơn hàng</h3>
                        <div className="value">
                            <span>{stats.tongdon}</span>
                        </div>
                    </div>
                </div>

                {/* Đang giao hàng */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                        <Truck size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đang giao hàng</h3>
                        <div className="value">
                            <span>{stats.demdanggiao}</span>
                        </div>
                    </div>
                </div>

                {/* Đã hoàn tất */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đã hoàn tất</h3>
                        <div className="value">
                            <span>{stats.demhoantat}</span>
                        </div>
                    </div>
                </div>

                {/* Đã hủy */}
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đơn hàng đã hủy</h3>
                        <div className="value">
                            <span>{stats.demhuy}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bộ lọc tinh tế, chuyên nghiệp */}
            <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sidebar-active)', fontWeight: 750, fontSize: '1.05rem' }}>
                        <Filter size={18} />
                        <span>Bộ lọc tìm kiếm đơn hàng</span>
                    </div>
                    {(maDonCon || tenKhach || tenShop || trangThai || tuNgay || denNgay) && (
                        <button 
                            type="button" 
                            onClick={handleClearFilters}
                            style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'var(--transition)' }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <X size={14} /> Xóa tất cả bộ lọc
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleApplyFilters}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        
                        {/* Tìm theo mã đơn hàng con */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã đơn hàng con</label>
                            <div className="search-box" style={{ maxWidth: '100%', padding: '0.5rem 1rem' }}>
                                <Search size={16} color="var(--text-muted)" />
                                <input 
                                    type="text"
                                    placeholder="Nhập mã đơn (DH-...)"
                                    value={maDonCon}
                                    onChange={(e) => setMaDonCon(e.target.value)}
                                    style={{ margin: 0, fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Tìm theo tên khách hàng */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tên khách hàng</label>
                            <div className="search-box" style={{ maxWidth: '100%', padding: '0.5rem 1rem' }}>
                                <Search size={16} color="var(--text-muted)" />
                                <input 
                                    type="text"
                                    placeholder="Họ tên người mua..."
                                    value={tenKhach}
                                    onChange={(e) => setTenKhach(e.target.value)}
                                    style={{ margin: 0, fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Tìm theo tên shop */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gian hàng (Shop)</label>
                            <div className="search-box" style={{ maxWidth: '100%', padding: '0.5rem 1rem' }}>
                                <Search size={16} color="var(--text-muted)" />
                                <input 
                                    type="text"
                                    placeholder="Tên gian hàng..."
                                    value={tenShop}
                                    onChange={(e) => setTenShop(e.target.value)}
                                    style={{ margin: 0, fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Tìm theo trạng thái */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trạng thái đơn hàng</label>
                            <select
                                className="admin-form-control"
                                value={trangThai}
                                onChange={(e) => setTrangThai(e.target.value)}
                                style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', height: '42px' }}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="0">Chờ xác nhận</option>
                                <option value="1">Đang chuẩn bị</option>
                                <option value="2">Đang giao hàng</option>
                                <option value="3">Đã giao/Hoàn tất</option>
                                <option value="4">Đã hủy</option>
                            </select>
                        </div>

                        {/* Từ ngày */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Từ ngày</label>
                            <input 
                                type="date"
                                className="admin-form-control"
                                value={tuNgay}
                                onChange={(e) => setTuNgay(e.target.value)}
                                style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', height: '42px' }}
                            />
                        </div>

                        {/* Đến ngày */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đến ngày</label>
                            <input 
                                type="date"
                                className="admin-form-control"
                                value={denNgay}
                                onChange={(e) => setDenNgay(e.target.value)}
                                style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', height: '42px' }}
                            />
                        </div>
                    </div>

                    {/* Dòng nút hành động gọn gàng ở góc dưới bên phải */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '1.25rem' }}>
                        <button 
                            type="button" 
                            className="filter-btn"
                            onClick={handleClearFilters}
                            style={{ height: '38px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                        >
                            Thiết lập lại
                        </button>
                        <button 
                            type="submit" 
                            className="btn-action btn-primary"
                            style={{ height: '38px', padding: '0 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                        >
                            <Search size={14} /> Áp dụng bộ lọc
                        </button>
                    </div>
                </form>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="admin-card">
                <div className="admin-table-wrapper">
                    {isLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải danh sách đơn hàng...</div>
                    ) : isError ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#EF4444' }}>Đã xảy ra lỗi hệ thống khi tải đơn hàng. Vui lòng tải lại trang.</div>
                    ) : (
                        <>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn con</th>
                                        <th>Khách hàng</th>
                                        <th>Gian hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => {
                                            const statusInfo = getOrderStatus(order.TrangThai);
                                            return (
                                                <tr key={order.ID_DonHang}>
                                                    <td>
                                                        <p style={{ fontWeight: 800, margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>
                                                            {order.MaDonHangCon}
                                                        </p>
                                                        <small style={{ color: 'var(--text-muted)' }}>ID: {order.ID_DonHang}</small>
                                                    </td>
                                                    <td>
                                                        <p style={{ fontWeight: 600, margin: 0 }}>
                                                            {order.don_hang_tong?.user?.HoTen || 'Không rõ'}
                                                        </p>
                                                        <small style={{ color: 'var(--text-muted)' }}>{order.don_hang_tong?.user?.email}</small>
                                                    </td>
                                                    <td>
                                                        <p style={{ fontWeight: 600, margin: 0 }}>
                                                            {order.shop?.TenShop || 'N/A'}
                                                        </p>
                                                        <small style={{ color: 'var(--text-muted)' }}>ĐT: {order.shop?.SoDienThoai}</small>
                                                    </td>
                                                    <td>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                                                            {order.date ? new Date(order.date).toLocaleDateString('vi-VN') : '—'}
                                                        </p>
                                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                            {order.date ? new Date(order.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <span 
                                                            className={`badge ${statusInfo.className}`}
                                                            style={{
                                                                background: statusInfo.bg,
                                                                color: statusInfo.color,
                                                                fontWeight: 'bold',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.8rem',
                                                                display: 'inline-block'
                                                            }}
                                                        >
                                                            {statusInfo.label}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button 
                                                            onClick={() => handleOpenDetail(order.ID_DonHang)}
                                                            title="Xem chi tiết đơn hàng"
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '6px', transition: 'var(--transition)' }}
                                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        >
                                                            <Eye size={20} strokeWidth={2.5} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>

                            {/* Phân trang */}
                            {pagination.last_page > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        Trang {pagination.current_page} / {pagination.last_page} (Hiển thị {pagination.from} - {pagination.to} trong tổng số {pagination.total} đơn hàng)
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                                            style={{
                                                background: page === 1 ? '#E5E7EB' : 'var(--admin-bg)',
                                                color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem',
                                                borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600,
                                                transition: 'var(--transition)'
                                            }}
                                        >
                                            <ChevronLeft size={16} /> Trước
                                        </button>
                                        <button 
                                            disabled={page === pagination.last_page}
                                            onClick={() => setPage(p => Math.min(p + 1, pagination.last_page))}
                                            style={{
                                                background: page === pagination.last_page ? '#E5E7EB' : 'var(--admin-bg)',
                                                color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem',
                                                borderRadius: '8px', cursor: page === pagination.last_page ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600,
                                                transition: 'var(--transition)'
                                            }}
                                        >
                                            Sau <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal Chi tiết đơn hàng */}
            {detailModalOpen && (
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content" style={{ maxWidth: '850px' }}>
                        <div className="nam-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={24} color="var(--sidebar-active)" />
                                <h3>
                                    Chi tiết đơn hàng {orderDetail?.MaDonHangCon || ''}
                                </h3>
                            </div>
                            <button className="nam-modal-close" onClick={handleCloseDetail}>
                                <X size={24} />
                            </button>
                        </div>

                        {isLoadingDetail ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Đang lấy thông tin đơn hàng...</div>
                        ) : orderDetail ? (
                            <div>
                                {/* Hàng thông tin chung đơn hàng */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', background: 'var(--admin-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 600 }}>MÃ ĐƠN HÀNG CON</p>
                                        <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 700 }}>{orderDetail.MaDonHangCon}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 600 }}>NGÀY ĐẶT HÀNG</p>
                                        <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>
                                            {orderDetail.date ? new Date(orderDetail.date).toLocaleString('vi-VN') : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 600 }}>TRẠNG THÁI HIỆN TẠI</p>
                                        <span 
                                            className={`badge ${getOrderStatus(orderDetail.TrangThai).className}`}
                                            style={{
                                                background: getOrderStatus(orderDetail.TrangThai).bg,
                                                color: getOrderStatus(orderDetail.TrangThai).color,
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                display: 'inline-block',
                                                marginTop: '2px'
                                            }}
                                        >
                                            {getOrderStatus(orderDetail.TrangThai).label}
                                        </span>
                                    </div>
                                </div>

                                {/* Thông tin Người mua & Người bán */}
                                <div className="order-info-grid">
                                    {/* Thông tin Khách hàng */}
                                    <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'var(--white)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                            <User size={18} color="var(--sidebar-active)" />
                                            <span>Thông tin Khách hàng</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', width: '100px', display: 'inline-block' }}>Họ và tên:</span>
                                                <strong style={{ color: 'var(--text-main)' }}>{orderDetail.don_hang_tong?.user?.HoTen || 'N/A'}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', width: '100px', display: 'inline-block' }}>Địa chỉ Email:</span>
                                                <span style={{ color: 'var(--text-main)' }}>{orderDetail.don_hang_tong?.user?.email || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', width: '100px', display: 'inline-block' }}>Điện thoại:</span>
                                                <span style={{ color: 'var(--text-main)' }}>{orderDetail.don_hang_tong?.user?.sdt || 'Chưa cập nhật'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin Shop */}
                                    <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px', background: 'var(--white)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                            <Store size={18} color="var(--sidebar-active)" />
                                            <span>Thông tin Gian hàng</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', width: '100px', display: 'inline-block' }}>Tên Shop:</span>
                                                <strong style={{ color: 'var(--text-main)' }}>{orderDetail.shop?.TenShop || 'N/A'}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', width: '100px', display: 'inline-block' }}>Số điện thoại:</span>
                                                <span style={{ color: 'var(--text-main)' }}>{orderDetail.shop?.SoDienThoai || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)', width: '100px', display: 'inline-block' }}>Địa chỉ Shop:</span>
                                                <span style={{ color: 'var(--text-main)' }}>{orderDetail.shop?.DiaChi || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chi tiết sản phẩm trong đơn */}
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflowX: 'auto', marginBottom: '1.5rem', background: 'var(--white)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem 1.25rem', background: 'var(--card-header-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                        <Package size={18} color="var(--sidebar-active)" />
                                        <span>Danh sách sản phẩm</span>
                                    </div>
                                    
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--card-header-bg)', borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ảnh</th>
                                                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tên sản phẩm</th>
                                                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>Đơn giá</th>
                                                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Số lượng</th>
                                                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetail.chi_tiet && orderDetail.chi_tiet.length > 0 ? (
                                                orderDetail.chi_tiet.map((item, index) => {
                                                    const sanPham = item.san_pham || {};
                                                    const price = Number(item.Gia) || 0;
                                                    const quantity = Number(item.SoLuong) || 0;
                                                    const total = price * quantity;
                                                    
                                                    return (
                                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <img 
                                                                    src={sanPham.HinhAnh ? `http://127.0.0.1:8000/storage/${sanPham.HinhAnh}` : 'https://via.placeholder.com/60x60?text=SP'} 
                                                                    alt={sanPham.TenSanPham} 
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/60x60?text=Lỗi+Ảnh"; }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                                                                {sanPham.TenSanPham || 'Sản phẩm không tồn tại'}
                                                                {sanPham.DonViTinh && <small style={{ display: 'block', color: 'var(--text-muted)', fontWeight: 'normal' }}>ĐVT: {sanPham.DonViTinh}</small>}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-main)' }}>
                                                                {formatPrice(price)}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600 }}>
                                                                {quantity}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                                                                {formatPrice(total)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        Không có sản phẩm nào trong chi tiết đơn hàng này.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Tổng thanh toán */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.25rem 1.5rem', background: 'var(--card-header-bg)', borderTop: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Tổng tiền đơn hàng:</span>
                                            <strong style={{ color: 'var(--gold)', fontSize: '1.4rem', fontWeight: 800 }}>
                                                {formatPrice(
                                                    orderDetail.chi_tiet?.reduce((acc, curr) => acc + (Number(curr.Gia) * Number(curr.SoLuong)), 0) || 0
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#EF4444' }}>Không tìm thấy thông tin đơn hàng này.</div>
                        )}

                        <div className="nam-modal-footer">
                            <button 
                                onClick={handleCloseDetail}
                                className="filter-btn"
                                style={{ height: '38px', padding: '0 1.5rem' }}
                            >
                                Đóng thông tin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DonHangControl;
