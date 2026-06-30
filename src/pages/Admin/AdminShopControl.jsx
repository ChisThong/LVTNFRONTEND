import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axiosClient from '../../api/axiosClient';
import { Search, Eye, Trash2, Check, X, Package, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import '../../styles/navbar-admin.css';

const BASE_URL = 'https://lvtnbackend.onrender.com/storage/';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

function AdminShopControl() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(''); // Rỗng = tất cả
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState(''); // For the input box

    // Modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState(null);
    const [lyDoTuChoi, setLyDoTuChoi] = useState('');

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewShopData, setViewShopData] = useState(null);

    // ── Modal xem sản phẩm ──
    const [productsModalOpen, setProductsModalOpen] = useState(false);
    const [productsShop, setProductsShop] = useState(null);      // {ID_Shop, TenShop}
    const [products, setProducts] = useState([]);
    const [productsMeta, setProductsMeta] = useState(null);      // pagination meta
    const [productsPage, setProductsPage] = useState(1);
    const [productsLoading, setProductsLoading] = useState(false);

    const fetchShops = async () => {
        setLoading(true);
        try {
            let endpoint = '/admin/shops?';
            const params = new URLSearchParams();
            if (filterStatus) params.append('trang_thai_duyet', filterStatus);
            if (searchQuery) params.append('search', searchQuery);

            const response = await axiosClient.get(endpoint + params.toString());
            if (response.data && response.data.success && response.data.data) {
                setShops(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách shop:', error);
            if (error.response?.status === 403) {
                alert('Bạn không có quyền truy cập trang này!');
                window.location.href = '/';
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchInput]);

    useEffect(() => {
        fetchShops();
    }, [filterStatus, searchQuery]);

    const handleApprove = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn DUYỆT gian hàng này?')) return;
        try {
            const res = await axiosClient.put(`/admin/shops/${id}/approve`);
            if (res.data && res.data.success) {
                fetchShops();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi duyệt');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const actionText = currentStatus === 1 ? 'KHÓA' : 'MỞ LẠI';
        if (!window.confirm(`Bạn có chắc muốn ${actionText} gian hàng này không?`)) return;
        try {
            const res = await axiosClient.patch(`/admin/shops/${id}/toggle-status`);
            if (res.data && res.data.success) {
                fetchShops();
                // Optionally show a toast or alert
                // alert(res.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const openRejectModal = (id) => {
        setSelectedShopId(id);
        setLyDoTuChoi('');
        setRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setRejectModalOpen(false);
        setSelectedShopId(null);
        setLyDoTuChoi('');
    };

    const openViewModal = (shop) => {
        setViewShopData(shop);
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewShopData(null);
    };

    // ── Mở modal sản phẩm ──
    const openProductsModal = async (shop, page = 1) => {
        setProductsShop({ ID_Shop: shop.ID_Shop, TenShop: shop.TenShop });
        setProductsPage(page);
        setProductsModalOpen(true);
        setProductsLoading(true);
        setProducts([]);
        setProductsMeta(null);
        try {
            const res = await axiosClient.get(`/admin/shops/${shop.ID_Shop}/products?per_page=12&page=${page}`);
            if (res.data?.success) {
                const paginatedData = res.data.data;
                setProducts(paginatedData.data || []);
                setProductsMeta({
                    current_page: paginatedData.current_page,
                    last_page: paginatedData.last_page,
                    total: paginatedData.total,
                    per_page: paginatedData.per_page,
                });
            }
        } catch (err) {
            console.error('Lỗi tải sản phẩm shop:', err);
        } finally {
            setProductsLoading(false);
        }
    };

    const closeProductsModal = () => {
        setProductsModalOpen(false);
        setProductsShop(null);
        setProducts([]);
        setProductsMeta(null);
        setProductsPage(1);
    };

    const handleProductsPageChange = (newPage) => {
        if (!productsShop) return;
        setProductsPage(newPage);
        openProductsModal(productsShop, newPage);
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!lyDoTuChoi.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        try {
            const res = await axiosClient.put(`/admin/shops/${selectedShopId}/reject`, {
                LyDoTuChoi: lyDoTuChoi
            });
            if (res.data && res.data.success) {
                closeRejectModal();
                fetchShops();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi từ chối');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'cho_duyet':
                return <span className="badge badge-pending">CHỜ DUYỆT</span>;
            case 'da_duyet':
                return <span className="badge badge-success">ĐÃ DUYỆT</span>;
            case 'tu_choi':
                return <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>TỪ CHỐI</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getProductStatusBadge = (p) => {
        if (p.TrangThaiDuyet === 'cho_duyet') {
            return (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
                    fontWeight: 700, background: '#FEF3C7', color: '#D97706'
                }}>
                    Chờ duyệt
                </span>
            );
        }
        if (p.TrangThaiDuyet === 'tu_choi') {
            return (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
                    fontWeight: 700, background: '#FEE2E2', color: '#DC2626'
                }}>
                    Từ chối
                </span>
            );
        }
        if (parseInt(p.TrangThai) === 1) {
            return (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
                    fontWeight: 700, background: '#D1FAE5', color: '#065F46'
                }}>
                    Đang bán
                </span>
            );
        }
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem',
                fontWeight: 700, background: '#F3F4F6', color: '#6B7280'
            }}>
                Đã ẩn
            </span>
        );
    };

    return (
        <div className="view-section" style={{ position: 'relative' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="admin-title" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#3A2E26' }}>Kiểm duyệt gian hàng</h2>
                <p style={{ color: '#8C7B6D', marginTop: '0.5rem', fontSize: '1rem' }}>Chào mừng trở lại, hôm nay hệ thống có gì mới?</p>
            </div>

            <div className="admin-filters" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
                <div className="search-box" style={{ background: '#F4EFEA', border: 'none', borderRadius: '8px', maxWidth: '400px' }}>
                    <Search size={20} color="#8C7B6D" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm gian hàng..." 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={{ color: '#4A3B32', fontWeight: 500 }}
                    />
                </div>

                <div className="filter-group">
                    {[
                        { value: '', label: 'Tất cả' },
                        { value: 'cho_duyet', label: 'Chờ duyệt' },
                        { value: 'da_duyet', label: 'Đã duyệt' },
                        { value: 'tu_choi', label: 'Từ chối' },
                    ].map(btn => (
                        <button
                            key={btn.value}
                            className={`filter-btn ${filterStatus === btn.value ? 'active' : ''}`}
                            onClick={() => setFilterStatus(btn.value)}
                            style={filterStatus === btn.value
                                ? { background: '#1C1917', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }
                                : { background: '#F4EFEA', color: '#4A3B32', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }
                            }
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-card" style={{ background: '#F8F5F1', border: 'none', padding: '1rem 2rem', borderRadius: '16px' }}>
                <div className="admin-table-wrapper" style={{ border: 'none', background: 'transparent' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#8C7B6D' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="admin-table" style={{ background: 'transparent', borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem' }}>TÊN GIAN HÀNG</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem' }}>ĐẠI DIỆN</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem' }}>THÔNG TIN LIÊN HỆ</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem', textAlign: 'center' }}>SẢN PHẨM</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem' }}>TRẠNG THÁI DUYỆT</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem' }}>HOẠT ĐỘNG</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem', textAlign: 'center' }}>THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', borderBottom: '1px solid #EAE3DA', color: '#8C7B6D' }}>Không tìm thấy gian hàng nào.</td>
                                    </tr>
                                ) : (
                                    shops.map((shop) => (
                                        <tr key={shop.ID_Shop}>
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem' }}>
                                                <p style={{ fontWeight: 800, margin: 0, color: '#2D241E', fontSize: '1.05rem' }}>{shop.TenShop}</p>
                                                {shop.LyDoTuChoi && shop.TrangThaiDuyet === 'tu_choi' && (
                                                    <p style={{ fontSize: '0.85rem', color: '#DC2626', margin: '6px 0 0 0', fontWeight: 600, background: '#FEE2E2', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Lý do: {shop.LyDoTuChoi}</p>
                                                )}
                                            </td>
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem' }}>
                                                <p style={{ fontWeight: 600, margin: 0, color: '#4A3B32' }}>{shop.user?.HoTen || 'N/A'}</p>
                                            </td>
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem' }}>
                                                <p style={{ margin: 0, color: '#4A3B32', fontSize: '0.9rem', fontWeight: 500 }}>{shop.DiaChi || 'N/A'}</p>
                                                <p style={{ margin: '4px 0 0 0', color: '#8C7B6D', fontSize: '0.85rem' }}>{shop.SoDienThoai || shop.user?.sdt || shop.user?.email}</p>
                                            </td>

                                            {/* ── Cột Sản phẩm ── */}
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => openProductsModal(shop)}
                                                    title={`Xem ${shop.products_count || 0} sản phẩm`}
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                        padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                                                        border: 'none', fontWeight: 700, fontSize: '0.85rem',
                                                        background: (shop.products_count || 0) > 0 ? '#EDF7ED' : '#F4EFEA',
                                                        color: (shop.products_count || 0) > 0 ? '#2E7D32' : '#8C7B6D',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                                                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    <Package size={13} />
                                                    {shop.products_count || 0} SP
                                                </button>
                                            </td>

                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem' }}>
                                                {getStatusBadge(shop.TrangThaiDuyet)}
                                            </td>
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem' }}>
                                                {shop.TrangThai === 1 ? (
                                                    <span className="badge badge-success">HOẠT ĐỘNG</span>
                                                ) : (
                                                    <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>ĐANG KHÓA</span>
                                                )}
                                            </td>
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem', textAlign: 'center' }}>
                                                <div className="action-btns" style={{ justifyItems: 'center', gap: '16px', display: 'flex', justifyContent: 'center' }}>
                                                    {shop.TrangThaiDuyet === 'cho_duyet' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(shop.ID_Shop)}
                                                                title="Duyệt"
                                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#10B981', padding: '4px', transition: 'all 0.2s' }}
                                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                            >
                                                                <Check size={22} strokeWidth={2.5} />
                                                            </button>
                                                            <button 
                                                                onClick={() => openRejectModal(shop.ID_Shop)}
                                                                title="Từ chối"
                                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px', transition: 'all 0.2s' }}
                                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                            >
                                                                <X size={22} strokeWidth={2.5} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Nút mắt: xem chi tiết shop */}
                                                    <button 
                                                        onClick={() => openViewModal(shop)}
                                                        title="Xem chi tiết gian hàng"
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4A3B32', padding: '4px', transition: 'all 0.2s' }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <Eye size={20} strokeWidth={2.5} />
                                                    </button>
                                                    
                                                    {/* Nút Khóa / Mở Khóa */}
                                                    <button 
                                                        onClick={() => handleToggleStatus(shop.ID_Shop, shop.TrangThai)}
                                                        title={shop.TrangThai === 1 ? "Khóa gian hàng" : "Mở lại gian hàng"}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: shop.TrangThai === 1 ? '#F59E0B' : '#10B981', padding: '4px', transition: 'all 0.2s' }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        {shop.TrangThai === 1 ? <Lock size={20} strokeWidth={2} /> : <Unlock size={20} strokeWidth={2} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                MODAL: Từ chối
            ───────────────────────────────────────────────────────────────── */}
            {rejectModalOpen && createPortal(
                <div className="nam-modal-overlay" onClick={closeRejectModal}>
                    <div className="nam-modal-content" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: '#1C1917', fontSize: '1.25rem', fontWeight: 800 }}>Từ chối gian hàng</h3>
                        <form onSubmit={handleRejectSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#4A3B32', fontSize: '0.9rem' }}>
                                    Vui lòng cung cấp lý do từ chối để người bán có thể sửa đổi: <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <textarea 
                                    value={lyDoTuChoi}
                                    onChange={(e) => setLyDoTuChoi(e.target.value)}
                                    rows="4"
                                    placeholder="Ví dụ: Hình ảnh CCCD bị mờ, địa chỉ không rõ ràng..."
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '8px',
                                        border: '1px solid #EAE3DA', outline: 'none',
                                        fontFamily: 'inherit', fontSize: '0.95rem',
                                        resize: 'vertical', background: '#F8F5F1',
                                        boxSizing: 'border-box'
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button 
                                    type="button" 
                                    onClick={closeRejectModal}
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '8px',
                                        background: '#F4EFEA', color: '#4A3B32', border: 'none',
                                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    Hủy thao tác
                                </button>
                                <button 
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '8px',
                                        background: '#EF4444', color: '#fff', border: 'none',
                                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)'
                                    }}
                                >
                                    Từ chối duyệt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ─────────────────────────────────────────────────────────────────
                MODAL: Chi tiết gian hàng
            ───────────────────────────────────────────────────────────────── */}
            {viewModalOpen && viewShopData && createPortal(
                <div className="nam-modal-overlay" onClick={closeViewModal}>
                    <div className="nam-modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #EAE3DA', paddingBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#1C1917', fontSize: '1.4rem', fontWeight: 800 }}>Chi tiết gian hàng</h3>
                            <button onClick={closeViewModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8C7B6D' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Tên gian hàng</p>
                                <p style={{ margin: 0, color: '#2D241E', fontWeight: 700, fontSize: '1.05rem' }}>{viewShopData.TenShop}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Trạng thái</p>
                                <div style={{ marginTop: '2px' }}>{getStatusBadge(viewShopData.TrangThaiDuyet)}</div>
                            </div>
                            
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Người đại diện</p>
                                <p style={{ margin: 0, color: '#4A3B32', fontWeight: 500 }}>{viewShopData.user?.HoTen || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Email</p>
                                <p style={{ margin: 0, color: '#4A3B32', fontWeight: 500 }}>{viewShopData.user?.email || 'N/A'}</p>
                            </div>

                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Số điện thoại</p>
                                <p style={{ margin: 0, color: '#4A3B32', fontWeight: 500 }}>{viewShopData.SoDienThoai || viewShopData.user?.sdt || 'N/A'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Số lượng sản phẩm</p>
                                <p style={{ margin: 0, color: '#4A3B32', fontWeight: 700, fontSize: '1.1rem' }}>{viewShopData.products_count || 0}</p>
                            </div>
                            
                            <div style={{ gridColumn: '1 / -1' }}>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Địa chỉ</p>
                                <p style={{ margin: 0, color: '#4A3B32', fontWeight: 500 }}>{viewShopData.DiaChi || 'N/A'}</p>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Loại hình kinh doanh</p>
                                <p style={{ margin: 0, color: '#4A3B32', fontWeight: 500 }}>{viewShopData.LoaiHinhKinhDoanh === 'doanh_nghiep' ? 'Doanh nghiệp' : 'Hộ kinh doanh cá thể'}</p>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <p style={{ fontSize: '0.85rem', color: '#8C7B6D', margin: '0 0 4px 0', fontWeight: 600 }}>Mô tả gian hàng</p>
                                <div style={{ 
                                    background: '#F8F5F1', padding: '1rem', borderRadius: '8px', 
                                    color: '#4A3B32', fontSize: '0.95rem', lineHeight: 1.5,
                                    border: '1px solid #EAE3DA'
                                }}>
                                    {viewShopData.GioiThieu || 'Chưa cập nhật mô tả'}
                                </div>
                            </div>

                            {viewShopData.TrangThaiDuyet === 'tu_choi' && viewShopData.LyDoTuChoi && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#DC2626', margin: '0 0 4px 0', fontWeight: 700 }}>Lý do từ chối duyệt</p>
                                    <div style={{ 
                                        background: '#FEF2F2', padding: '1rem', borderRadius: '8px', 
                                        color: '#991B1B', fontSize: '0.95rem', lineHeight: 1.5,
                                        border: '1px solid #FCA5A5'
                                    }}>
                                        {viewShopData.LyDoTuChoi}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #EAE3DA' }}>
                            <button
                                onClick={() => { closeViewModal(); openProductsModal(viewShopData); }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '0.65rem 1.25rem', borderRadius: '8px',
                                    background: '#2C3A29', color: '#fff', border: 'none',
                                    fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem'
                                }}
                            >
                                <Package size={15} /> Xem sản phẩm ({viewShopData.products_count || 0})
                            </button>
                            <button 
                                onClick={closeViewModal}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '8px',
                                    background: '#F4EFEA', color: '#4A3B32', border: 'none',
                                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ─────────────────────────────────────────────────────────────────
                MODAL: Danh sách sản phẩm của shop
            ───────────────────────────────────────────────────────────────── */}
            {productsModalOpen && createPortal(
                <div className="nam-modal-overlay" onClick={closeProductsModal}>
                    <div className="nam-modal-content" style={{ maxWidth: '860px', padding: 0 }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1.5rem 2rem', borderBottom: '1px solid #EAE3DA',
                            background: 'linear-gradient(135deg, #2C3A29 0%, #4A5B45 100%)',
                            borderRadius: '18px 18px 0 0', flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Package size={22} color="#D4A373" />
                                <div>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
                                        Sản phẩm của: {productsShop?.TenShop}
                                    </h3>
                                    {productsMeta && (
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: '2px' }}>
                                            {productsMeta.total} sản phẩm · Trang {productsMeta.current_page}/{productsMeta.last_page}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={closeProductsModal}
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem 2rem', flex: 1, overflowX: 'auto' }}>
                            {productsLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#8C7B6D' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                                    Đang tải sản phẩm...
                                </div>
                            ) : products.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                                    <p style={{ color: '#8C7B6D', fontWeight: 600, fontSize: '1rem' }}>
                                        Shop này chưa có sản phẩm nào
                                    </p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #EAE3DA' }}>
                                            <th style={{ padding: '0.75rem 0.6rem', textAlign: 'left', color: '#8C7B6D', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Sản phẩm</th>
                                            <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right', color: '#8C7B6D', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Giá</th>
                                            <th style={{ padding: '0.75rem 0.6rem', textAlign: 'center', color: '#8C7B6D', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Tồn kho</th>
                                            <th style={{ padding: '0.75rem 0.6rem', textAlign: 'left', color: '#8C7B6D', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Phân loại</th>
                                            <th style={{ padding: '0.75rem 0.6rem', textAlign: 'left', color: '#8C7B6D', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Tỉnh/Thành</th>
                                            <th style={{ padding: '0.75rem 0.6rem', textAlign: 'center', color: '#8C7B6D', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>TT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => {
                                            const firstImg = p.hinh_anh?.[0]?.HinhAnh;
                                            return (
                                                <tr key={p.ID_SanPham} style={{ borderBottom: '1px solid #F5F0EA' }}>
                                                    {/* Ảnh + tên */}
                                                    <td style={{ padding: '0.9rem 0.6rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                            {firstImg ? (
                                                                <img
                                                                    src={BASE_URL + firstImg}
                                                                    alt={p.TenSanPham}
                                                                    style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover', border: '1px solid #EAE3DA', flexShrink: 0 }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: 46, height: 46, borderRadius: 8, flexShrink: 0,
                                                                    background: 'linear-gradient(135deg, #f4eedf, #e8dcc8)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '1.3rem', border: '1px solid #EAE3DA'
                                                                }}>🌾</div>
                                                            )}
                                                            <div>
                                                                <p style={{ margin: 0, fontWeight: 700, color: '#2D241E', fontSize: '0.88rem', lineHeight: 1.3 }}>{p.TenSanPham}</p>
                                                                {p.NguonGoc && (
                                                                    <p style={{ margin: '2px 0 0 0', color: '#8C7B6D', fontSize: '0.75rem' }}>📍 {p.NguonGoc}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Giá */}
                                                    <td style={{ padding: '0.9rem 0.6rem', textAlign: 'right', fontWeight: 700, color: '#2E7D32', whiteSpace: 'nowrap' }}>
                                                        {formatPrice(p.Gia)}
                                                    </td>
                                                    {/* Tồn kho */}
                                                    <td style={{ padding: '0.9rem 0.6rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                                                            fontSize: '0.8rem', fontWeight: 700,
                                                            background: p.SoLuongTon === 0 ? '#FEE2E2' : p.SoLuongTon <= 10 ? '#FEF3C7' : '#D1FAE5',
                                                            color: p.SoLuongTon === 0 ? '#DC2626' : p.SoLuongTon <= 10 ? '#B45309' : '#065F46',
                                                        }}>
                                                            {p.SoLuongTon}
                                                        </span>
                                                    </td>
                                                    {/* Phân loại */}
                                                    <td style={{ padding: '0.9rem 0.6rem', color: '#4A3B32' }}>
                                                        {p.phan_loai?.TenLoai || '—'}
                                                    </td>
                                                    {/* Tỉnh/Thành */}
                                                    <td style={{ padding: '0.9rem 0.6rem', color: '#4A3B32' }}>
                                                        {p.tinh_thanh?.TenTinhThanh || p.tinhThanh?.TenTinhThanh || '—'}
                                                    </td>
                                                    {/* Trạng thái (TT) */}
                                                    <td style={{ padding: '0.9rem 0.6rem', textAlign: 'center' }}>
                                                        {getProductStatusBadge(p)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Modal Footer: Pagination */}
                        {productsMeta && productsMeta.last_page > 1 && (
                            <div style={{
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
                                padding: '1rem 2rem', borderTop: '1px solid #EAE3DA', flexShrink: 0,
                            }}>
                                <button
                                    onClick={() => handleProductsPageChange(productsPage - 1)}
                                    disabled={productsPage <= 1 || productsLoading}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #EAE3DA',
                                        background: '#fff', color: '#4A3B32', cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.85rem', opacity: productsPage <= 1 ? 0.4 : 1
                                    }}
                                >
                                    <ChevronLeft size={15} /> Trước
                                </button>
                                <span style={{ color: '#4A3B32', fontWeight: 600, fontSize: '0.88rem' }}>
                                    Trang {productsMeta.current_page} / {productsMeta.last_page}
                                </span>
                                <button
                                    onClick={() => handleProductsPageChange(productsPage + 1)}
                                    disabled={productsPage >= productsMeta.last_page || productsLoading}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #EAE3DA',
                                        background: '#fff', color: '#4A3B32', cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.85rem',
                                        opacity: productsPage >= productsMeta.last_page ? 0.4 : 1
                                    }}
                                >
                                    Sau <ChevronRight size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default AdminShopControl;
