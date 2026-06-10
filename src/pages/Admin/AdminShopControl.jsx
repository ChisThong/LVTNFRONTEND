import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Search, Eye, Trash2, Check, X } from 'lucide-react';
import '../../styles/navbar-admin.css';

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
                    <button 
                        className={`filter-btn ${filterStatus === '' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('')}
                        style={filterStatus === '' ? { background: '#1C1917', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' } : { background: '#F4EFEA', color: '#4A3B32', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`filter-btn ${filterStatus === 'cho_duyet' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('cho_duyet')}
                        style={filterStatus === 'cho_duyet' ? { background: '#1C1917', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' } : { background: '#F4EFEA', color: '#4A3B32', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                    >
                        Chờ duyệt
                    </button>
                    <button 
                        className={`filter-btn ${filterStatus === 'da_duyet' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('da_duyet')}
                        style={filterStatus === 'da_duyet' ? { background: '#1C1917', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' } : { background: '#F4EFEA', color: '#4A3B32', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                    >
                        Đã duyệt
                    </button>
                    <button 
                        className={`filter-btn ${filterStatus === 'tu_choi' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('tu_choi')}
                        style={filterStatus === 'tu_choi' ? { background: '#1C1917', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' } : { background: '#F4EFEA', color: '#4A3B32', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                    >
                        Từ chối
                    </button>
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
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem' }}>TRẠNG THÁI</th>
                                    <th style={{ background: '#F8F5F1', color: '#8C7B6D', padding: '1.5rem 1rem', borderBottom: '2px solid #EAE3DA', fontSize: '0.85rem', textAlign: 'center' }}>THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', borderBottom: '1px solid #EAE3DA', color: '#8C7B6D' }}>Không tìm thấy gian hàng nào.</td>
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
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem', textAlign: 'center' }}>
                                                <p style={{ fontWeight: 700, margin: 0, color: '#2D241E', fontSize: '1.1rem' }}>{shop.products_count || 0}</p>
                                            </td>
                                            <td style={{ borderBottom: '1px solid #EAE3DA', padding: '1.5rem 1rem' }}>
                                                {getStatusBadge(shop.TrangThaiDuyet)}
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
                                                    <button 
                                                        onClick={() => openViewModal(shop)}
                                                        title="Xem chi tiết"
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4A3B32', padding: '4px', transition: 'all 0.2s' }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <Eye size={20} strokeWidth={2.5} />
                                                    </button>
                                                    <button 
                                                        title="Xóa (Chưa hỗ trợ)"
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px', transition: 'all 0.2s' }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <Trash2 size={20} strokeWidth={2} />
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

            {/* Modal Từ chối */}
            {rejectModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', padding: '2rem', borderRadius: '16px',
                        width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
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
                </div>
            )}

            {/* Modal Xem chi tiết */}
            {viewModalOpen && viewShopData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', padding: '2rem', borderRadius: '16px',
                        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
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

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #EAE3DA' }}>
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
                </div>
            )}
        </div>
    );
}

export default AdminShopControl;
