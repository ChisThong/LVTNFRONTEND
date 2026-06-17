import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { Search, Edit2, Lock, Unlock, X, Save, Mail, Phone, Users, Shield, UserCheck, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../styles/navbar-admin.css';

function NguoiDungControl() {
    const queryClient = useQueryClient();
    
    // State filters & pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);

    // Edit state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formRole, setFormRole] = useState('2'); // ID_role

    // 1. Fetch Users using React Query
    const { data, isLoading } = useQuery({
        queryKey: ['users', searchQuery, filterRole, filterStatus, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterRole) params.append('ID_role', filterRole);
            if (filterStatus) params.append('TrangThai', filterStatus);
            params.append('page', page);

            const response = await axiosClient.get(`/admin/Nguoidung?${params.toString()}`);
            return response.data;
        },
        keepPreviousData: true,
        staleTime: 5000,
    });

    const userList = data?.data?.data || [];
    const pagination = data?.data || {};
    
    // Statistics from API response
    const totalUsers = data?.tong || 0;
    const adminCount = data?.demadmin || 0;
    const sellerCount = data?.demseller || 0;
    const lockedCount = data?.demblock || 0;

    // 2. Lock/Unlock mutation
    const changeClockMutation = useMutation({
        mutationFn: async (id) => {
            const response = await axiosClient.put(`/admin/Nguoidung/${id}/ChangeClock`);
            return response.data;
        },
        onSuccess: (res) => {
            Swal.fire('Thành công', res.message || 'Thay đổi trạng thái tài khoản thành công!', 'success');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
            Swal.fire('Lỗi hệ thống', error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản!', 'error');
        }
    });

    // 3. Update User Role mutation
    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, ID_role }) => {
            const response = await axiosClient.put(`/admin/Nguoidung/${id}`, { ID_role });
            return response.data;
        },
        onSuccess: (res) => {
            Swal.fire('Thành công', res.message || 'Cập nhật vai trò thành công!', 'success');
            setEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Lỗi khi cập nhật vai trò:', error);
            Swal.fire('Lỗi hệ thống', error.response?.data?.message || 'Không thể cập nhật vai trò!', 'error');
        }
    });

    // Event Handlers
    const handleToggleStatus = (user) => {
        const id = user.ID_User || user.id;
        const isLocked = Number(user.TrangThai) === 2;
        const actionText = isLocked ? 'mở khóa' : 'khóa';

        Swal.fire({
            title: `Xác nhận ${actionText}?`,
            text: `Bạn có chắc muốn ${actionText} tài khoản "${user.HoTen}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: isLocked ? '#10B981' : '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                changeClockMutation.mutate(id);
            }
        });
    };

    const openEditForm = (user) => {
        setSelectedUser(user);
        setFormRole(String(user.ID_role || '2'));
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const id = selectedUser.ID_User || selectedUser.id;
        updateRoleMutation.mutate({ id, ID_role: Number(formRole) });
    };

    const getRoleBadge = (roleId) => {
        switch (Number(roleId)) {
            case 1:
                return <span className="badge" style={{ background: '#FEE2E2', color: '#EF4444', fontWeight: 'bold' }}>Quản Trị Viên</span>;
            case 3:
                return <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', fontWeight: 'bold' }}>Nhà Bán Hàng</span>;
            case 2:
            default:
                return <span className="badge" style={{ background: '#DBEAFE', color: '#2563EB', fontWeight: 'bold' }}>Khách Hàng</span>;
        }
    };

    const getStatusBadge = (status) => {
        if (Number(status) === 1) {
            return <span className="badge badge-success">HOẠT ĐỘNG</span>;
        }
        return <span className="badge" style={{ background: '#F3F4F6', color: '#4B5563' }}>ĐÃ KHÓA</span>;
    };

    return (
        <>
            <div className="view-section">
                {/* Header top bar */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="admin-title" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#3A2E26' }}>Quản lý người dùng</h2>
                    <p style={{ color: '#8C7B6D', marginTop: '0.5rem', fontSize: '1rem' }}>Cấp quyền và thay đổi trạng thái hoạt động của tài khoản người dùng.</p>
                </div>

                {/* Stat Grid */}
                <div className="stat-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Tổng thành viên</h3>
                            <div className="value">
                                <span>{totalUsers}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                            <UserCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Nhà bán hàng</h3>
                            <div className="value">
                                <span>{sellerCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                            <Shield size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Ban quản trị</h3>
                            <div className="value">
                                <span>{adminCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>Tài khoản khóa</h3>
                            <div className="value">
                                <span>{lockedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="admin-filters">
                    <div className="search-box">
                        <Search size={18} color="#6B7280" />
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên, email, SĐT..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        />
                    </div>

                    <div className="filter-select-group">
                        <select 
                            value={filterRole} 
                            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                            className="admin-form-control"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="1">Quản Trị Viên</option>
                            <option value="3">Nhà Bán Hàng</option>
                            <option value="2">Khách Hàng</option>
                        </select>

                        <select 
                            value={filterStatus} 
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className="admin-form-control"
                            style={{ width: 'auto', minWidth: '150px' }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="1">Đang hoạt động</option>
                            <option value="2">Đã khóa</option>
                        </select>
                    </div>
                </div>

                {/* Table Users */}
                <div className="admin-card">
                    <div className="admin-table-wrapper">
                        {isLoading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>Đang tải danh sách người dùng...</div>
                        ) : (
                            <>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Thành viên</th>
                                            <th>Thông tin liên hệ</th>
                                            <th>Vai trò</th>
                                            <th>Trạng thái</th>
                                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userList.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Không tìm thấy người dùng nào.</td>
                                            </tr>
                                        ) : (
                                            userList.map((user) => (
                                                <tr key={user.ID_User || user.id}>
                                                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img 
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.HoTen)}&background=EAE3DA&color=4A3B32`} 
                                                            alt={user.HoTen} 
                                                            style={{ width: '42px', height: '42px', borderRadius: '50%' }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: 650, color: 'var(--text-main)' }}>{user.HoTen}</div>
                                                            <small style={{ color: '#6B7280' }}>ID: {user.ID_User || user.id}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                                <Mail size={14} color="#6B7280" /> {user.email}
                                                            </span>
                                                            {user.sdt && (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6B7280' }}>
                                                                    <Phone size={14} color="#6B7280" /> {user.sdt}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {getRoleBadge(user.ID_role)}
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(user.TrangThai)}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                            <button 
                                                                className="icon-btn"
                                                                onClick={() => handleToggleStatus(user)}
                                                                title={Number(user.TrangThai) === 1 ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                            >
                                                                {Number(user.TrangThai) === 1 ? <Lock size={16} /> : <Unlock size={16} />}
                                                            </button>
                                                            <button 
                                                                className="icon-btn"
                                                                onClick={() => openEditForm(user)}
                                                                title="Sửa quyền truy cập"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Pagination Controls */}
                                {pagination.last_page > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                                            Trang {pagination.current_page} / {pagination.last_page} (Hiển thị {pagination.from} - {pagination.to} trong tổng số {pagination.total} người dùng)
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                                style={{
                                                    background: page === 1 ? '#E5E7EB' : '#F3F4F6',
                                                    color: '#374151', border: '1px solid #D1D5DB', padding: '0.5rem 1rem',
                                                    borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                                                }}
                                            >
                                                <ChevronLeft size={16} /> Trước
                                            </button>
                                            <button 
                                                disabled={page === pagination.last_page}
                                                onClick={() => setPage(p => Math.min(p + 1, pagination.last_page))}
                                                style={{
                                                    background: page === pagination.last_page ? '#E5E7EB' : '#F3F4F6',
                                                    color: '#374151', border: '1px solid #D1D5DB', padding: '0.5rem 1rem',
                                                    borderRadius: '8px', cursor: page === pagination.last_page ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
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
            </div>

            {/* 2. MÀN HÌNH FORM CHỈNH SỬA CẤP QUYỀN (DÙNG CLASS NAM - Đặt ngoài view-section để không bị dính Stacking Context) */}
            {editModalOpen && selectedUser && (
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content">
                        <div className="nam-modal-header">
                            <h3>Cấp quyền tài khoản</h3>
                            <button className="nam-modal-close" onClick={() => setEditModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="admin-form-group">
                                <label>Họ và tên thành viên</label>
                                <input 
                                    type="text" 
                                    value={selectedUser.HoTen} 
                                    className="admin-form-control"
                                    disabled 
                                    style={{ background: '#F3F4F6', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Địa chỉ Email</label>
                                    <input 
                                        type="email" 
                                        value={selectedUser.email} 
                                        className="admin-form-control"
                                        disabled 
                                        style={{ background: '#F3F4F6', cursor: 'not-allowed' }}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        value={selectedUser.sdt || 'Chưa cập nhật'} 
                                        className="admin-form-control"
                                        disabled 
                                        style={{ background: '#F3F4F6', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Vai trò hệ thống <span style={{ color: '#EF4444' }}>*</span></label>
                                <select 
                                    value={formRole} 
                                    onChange={(e) => setFormRole(e.target.value)}
                                    className="admin-form-control"
                                    required
                                >
                                    <option value="2">Khách Hàng (Buyer)</option>
                                    <option value="3">Nhà Bán Hàng (Seller)</option>
                                    <option value="1">Quản Trị Viên (Admin)</option>
                                </select>
                            </div>

                            <div className="nam-modal-footer">
                                <button 
                                    type="button" 
                                    className="filter-btn" 
                                    onClick={() => setEditModalOpen(false)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <X size={16} /> Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-action btn-primary" 
                                    disabled={updateRoleMutation.isLoading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Save size={16} /> {updateRoleMutation.isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default NguoiDungControl;
