import { useState } from 'react';
import '../../styles/navbar-admin.css';
import { Search, ChevronRight, ChevronLeft, Edit, Trash2, Plus, ArrowLeft, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import axiosClient from '../../api/axiosClient'; 

function BanDoControl() {
    const queryClient = useQueryClient(); 
    const [viewMode, setViewMode] = useState('list');
    const [selectedRegion, setSelectedRegion] = useState('Tất cả');

    // 1. Các state quản lý bộ lọc hành chính ở Sidebar bên trái
    const [tinhthanh, setTinhThanh] = useState('');
    const [xa, setXa] = useState('');
    const [ap, setAp] = useState('');
    const [searchMap, setSearchMap] = useState('');
    const [page, setPage] = useState(1);

    // 2. CÁC STATE QUẢN LÝ FORM (THÊM / SỬA)
    const [editingId, setEditingId] = useState(null); 
    const [formValues, setFormValues] = useState({
        TenDacSan: '',
        ViDo: '',
        KinhDo: '',
        MoTa: '',
        PhanLoai: 'Đặc sản',
        ID_TinhThanh: '',
        ID_Xa: '',
        ID_Ap: ''
    });
    const [hinhAnhFile, setHinhAnhFile] = useState(null); 

    // ==================== CÁC KHỐI HOOK GỌI API (DANH SÁCH) ====================
    const { data, isLoading } = useQuery({
        queryKey: ['maps', tinhthanh, xa, ap, searchMap, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (tinhthanh) params.append('ID_TinhThanh', tinhthanh);
            if (xa) params.append('ID_Xa', xa);
            if (ap) params.append('ID_Ap', ap);
            if (searchMap) params.append('search_map', searchMap);
            params.append('page', page);
            
            const api = `/admin/bandoControl?${params.toString()}`;
            const response = await axiosClient.get(api);
            return response?.data || {};
        },
        staleTime: 1000,
        keepPreviousData: true
    });

    const mapData = data?.data?.data || [];
    const pagination = data?.data || {};

    const { data: TinhThanh = [] } = useQuery({
        queryKey: ['tinhthanh'],
        queryFn: async () => {
            const response = await axiosClient.get('/tinh-thanh');
            return response.data?.data?.data || response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });

    const { data: Xa = [] } = useQuery({
        queryKey: ['Xa', tinhthanh], 
        queryFn: async () => {
            const response = await axiosClient.get(`/xa?ID_TinhThanh=${tinhthanh}`);
            return response.data?.data?.data || response.data?.data || [];
        },
        enabled: !!tinhthanh, 
        staleTime: 10000,
    });

    const { data: Ap = [] } = useQuery({
        queryKey: ['Ap', xa], 
        queryFn: async () => {
            const response = await axiosClient.get(`/ap?ID_Xa=${xa}`);
            return response.data?.data?.data || response.data?.data || [];
        },
        enabled: !!xa, 
        staleTime: 10000,
    });

    // Các bộ query riêng biệt để phục vụ dropdown động TRONG Form Thêm/Sửa
    const { data: FormXa = [] } = useQuery({
        queryKey: ['FormXa', formValues.ID_TinhThanh],
        queryFn: async () => {
            const response = await axiosClient.get(`/xa?ID_TinhThanh=${formValues.ID_TinhThanh}`);
            return response.data?.data?.data || response.data?.data || [];
        },
        enabled: !!formValues.ID_TinhThanh,
    });

    const { data: FormAp = [] } = useQuery({
        queryKey: ['FormAp', formValues.ID_Xa],
        queryFn: async () => {
            const response = await axiosClient.get(`/ap?ID_Xa=${formValues.ID_Xa}`);
            return response.data?.data?.data || response.data?.data || [];
        },
        enabled: !!formValues.ID_Xa,
    });


    // ==================== KHỐI XỬ LÝ MUTATION (THÊM, XÓA, SỬA) ====================
    // HÀM MUTATION: THÊM MỚI (STORE)
    const addMutation = useMutation({
        mutationFn: async (formData) => {
            return await axiosClient.post('/admin/bandoControl', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            Swal.fire('Thành công', 'Thêm điểm ghim mới thành công!', 'success');
            queryClient.invalidateQueries({ queryKey: ['maps'] }); 
            setTinhThanh(''); setXa(''); setAp(''); setSelectedRegion('Tất cả'); 
            setViewMode('list');
        },
        onError: (err) => Swal.fire('Lỗi hệ thống', err.response?.data?.message || err.message, 'error')
    });

    // HÀM MUTATION: CẬP NHẬT (UPDATE)
    const updateMutation = useMutation({
        mutationFn: async ({ id, formData }) => {
            formData.append('_method', 'PUT'); 
            return await axiosClient.post(`/admin/bandoControl/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            Swal.fire('Thành công', 'Cập nhật điểm ghim thành công!', 'success');
            queryClient.invalidateQueries({ queryKey: ['maps'] }); 
            
            setViewMode('list');
        },
        onError: (err) => Swal.fire('Lỗi hệ thống', err.response?.data?.message || err.message, 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axiosClient.delete(`/admin/bandoControl/${id}`);
        },
        onSuccess: () => {
            Swal.fire('Đã xóa!', 'Điểm ghim đã được gỡ bỏ khỏi hệ thống.', 'success');
            queryClient.invalidateQueries(['maps']);
        },
        onError: (err) => Swal.fire('Lỗi xóa file', err.response?.data?.message || err.message, 'error')
    });


    // ==================== CÁC SỰ KIỆN TƯƠNG TÁC GIAO DIỆN ====================
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormValues({
            TenDacSan: '', ViDo: '', KinhDo: '', MoTa: '', PhanLoai: 'Đặc sản',
            ID_TinhThanh: tinhthanh, ID_Xa: xa, ID_Ap: ap 
        });
        setHinhAnhFile(null);
        setViewMode('add');
    };

    const handleEditClick = (item) => {
        setEditingId(item.ID || item.id || item.ID_map); // 🌟 ĐÃ SỬA: Bỏ biến 'data' không tồn tại
        setFormValues({
            TenDacSan: item.TenDacSan || item.TenDiaDiem || '',
            ViDo: item.ViDo || '',
            KinhDo: item.KinhDo || '',
            MoTa: item.MoTa || '',
            PhanLoai: item.PhanLoai || 'Đặc sản',
            ID_TinhThanh: item.ID_TinhThanh || '',
            ID_Xa: item.ID_Xa || '',
            ID_Ap: item.ID_Ap || ''
        });
        setHinhAnhFile(null); 
        setViewMode('edit');
    };

    const handleDeleteClick = (item) => {
        const id = item.ID || item.id || item.ID_map;
        Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Bạn có chắc muốn xóa điểm ghim "${item.TenDacSan || item.TenDiaDiem}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Vâng, xóa ngay!',
            cancelButtonText: 'Hủy bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.keys(formValues).forEach(key => {
            fd.append(key, formValues[key]);
        });
        if (hinhAnhFile) {
            fd.append('HinhAnh', hinhAnhFile);
        }

        if (viewMode === 'add') {
            addMutation.mutate(fd);
        } else {
            updateMutation.mutate({ id: editingId, formData: fd });
        }
    };

    return (
        <>
            {/* THANH TIÊU ĐỀ TRÊN CÙNG */}
            <div className="admin-top-bar" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 className="admin-title" style={{ marginBottom: 0 }}>
                    Quản Lý Danh Mục Vùng Miền & Bản Đồ
                </h1>
            </div>

            {/* 1. MÀN HÌNH DANH SÁCH CHÍNH */}
            {viewMode === 'list' && (
                <div id="admin-regions" className="view-section">
                    <div className="admin-filters">
                        <div className="search-box">
                            <Search size={18} color="#6B7280" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm điểm ghim (đặc sản)..."
                                value={searchMap} 
                                onChange={(e) => { setSearchMap(e.target.value); setPage(1); }}
                            />
                        </div>
                        <button className="btn-action btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Thêm điểm ghim mới
                        </button>
                    </div>

                    <div className="map-config-layout">
                        {/* CỘT TRÁI: CÂY THƯ MỤC */}
                        <div className="province-list">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', textTransform: 'uppercase' }}>Khu vực hành chính</h2>
                                {(tinhthanh || xa || ap) && (
                                    <button onClick={() => { setTinhThanh(''); setXa(''); setAp(''); setSelectedRegion('Tất cả'); setPage(1); }} style={{ fontSize: '0.8rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Xóa lọc</button>
                                )}
                            </div>

                            {TinhThanh.map((tinh) => {
                                const isProvinceActive = tinhthanh === String(tinh.ID_TinhThanh);
                                return (
                                    <div className="tree-node-container" key={tinh.ID_TinhThanh} style={{ marginBottom: '0.4rem' }}>
                                        <div className={`province-item ${isProvinceActive ? 'active' : ''}`} onClick={() => { setTinhThanh(isProvinceActive ? '' : String(tinh.ID_TinhThanh)); setSelectedRegion(tinh.TenTinhThanh); setXa(''); setAp(''); setPage(1); }}>
                                            <span>{tinh.TenTinhThanh}</span>
                                            <ChevronRight size={16} style={{ transition: 'transform 0.25s', transform: isProvinceActive ? 'rotate(90deg)' : 'none' }} />
                                        </div>

                                        {isProvinceActive && Xa.length > 0 && (
                                            <div className="tree-children" style={{ paddingLeft: '15px', marginTop: '4px' }}>
                                                {Xa.map((xaxa) => {
                                                    const isXaActive = xa === String(xaxa.ID_Xa);
                                                    const tenXaSach = xaxa.Ten_xa || "Chưa có tên";
                                                    return (
                                                        <div className="tree-node-container" key={xaxa.ID_Xa}>
                                                            <div className={`tree-item ${isXaActive ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setXa(isXaActive ? '' : String(xaxa.ID_Xa)); setSelectedRegion(`${tinh.TenTinhThanh} - ${tenXaSach}`); setAp(''); setPage(1); }}>
                                                                <span>{tenXaSach}</span>
                                                                <ChevronRight size={14} style={{ transition: 'transform 0.25s', transform: isXaActive ? 'rotate(90deg)' : 'none' }} />
                                                            </div>

                                                            {isXaActive && Ap.length > 0 && (
                                                                <div className="tree-sub-children" style={{ paddingLeft: '15px', marginTop: '4px' }}>
                                                                    {Ap.map((apap) => {
                                                                        const isApActive = ap === String(apap.ID_Ap);
                                                                        const tenApSach = apap.Ten_ap || "Chưa có tên";
                                                                        return (
                                                                            <div key={apap.ID_Ap} className={`tree-sub-item ${isApActive ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setAp(isApActive ? '' : String(apap.ID_Ap)); setSelectedRegion(`${tinh.TenTinhThanh} - ${tenXaSach} - ${tenApSach}`); setPage(1); }}>
                                                                                {tenApSach}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* CỘT PHẢI: BẢNG DỮ LIỆU */}
                        <div className="map-pins-area">
                            <div className="admin-card" style={{ marginBottom: 0 }}>
                                <div className="card-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 750, margin: 0 }}>Điểm ghim tại: <span style={{ color: 'var(--sidebar-active)' }}>{selectedRegion}</span></h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{pagination.total || mapData.length} địa điểm</span>
                                </div>

                                <div className="admin-table-wrapper">
                                    {mapData.length > 0 ? (
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Ảnh & Đặc sản</th>
                                                    <th>Tọa độ (Lat, Lng)</th>
                                                    <th>Mô tả chi tiết</th>
                                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mapData.map((data, index) => (
                                                    <tr key={data.ID || data.id || data.ID_map || index}>
                                                        <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <img src={data.HinhAnh ? `http://127.0.0.1:8000/storage/${data.HinhAnh}` : "https://via.placeholder.com/80x60?text=No+Image"} alt={data.TenDacSan} style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                                            <div>
                                                                <div style={{ fontWeight: 650, color: 'var(--text-main)' }}>{data.TenDacSan || data.TenDiaDiem}</div>
                                                                <span style={{ fontSize: '0.72rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>{data.PhanLoai || 'Đặc sản'}</span>
                                                            </div>
                                                        </td>
                                                        <td><code style={{ backgroundColor: '#F3F4F6', padding: '3px 6px', borderRadius: '4px' }}>{data.ViDo || 0} , {data.KinhDo || 0}</code></td>
                                                        <td><div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={data.MoTa}>{data.MoTa || '---'}</div></td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button onClick={() => handleEditClick(data)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', marginRight: '0.75rem' }}><Edit size={18} /></button>
                                                            <button onClick={() => handleDeleteClick(data)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>Không có điểm ghim nào tại khu vực này.</div>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {pagination.last_page > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                            Trang {pagination.current_page} / {pagination.last_page} (Hiển thị {pagination.from} - {pagination.to} của {pagination.total})
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                                style={{
                                                    background: page === 1 ? '#E5E7EB' : '#F3F4F6',
                                                    color: '#374151', border: '1px solid #D1D5DB', padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontSize: '0.85rem'
                                                }}
                                            >
                                                <ChevronLeft size={14} /> Trước
                                            </button>
                                            <button 
                                                disabled={page === pagination.last_page}
                                                onClick={() => setPage(p => Math.min(p + 1, pagination.last_page))}
                                                style={{
                                                    background: page === pagination.last_page ? '#E5E7EB' : '#F3F4F6',
                                                    color: '#374151', border: '1px solid #D1D5DB', padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px', cursor: page === pagination.last_page ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontSize: '0.85rem'
                                                }}
                                            >
                                                Sau <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. MÀN HÌNH FORM THÊM MỚI / CHỈNH SỬA ĐIỂM GHIM */}
            {(viewMode === 'add' || viewMode === 'edit') && (
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content" style={{ maxWidth: '650px' }}>
                        <div className="nam-modal-header">
                            <h3>{viewMode === 'add' ? 'Thêm Điểm Ghim Mới' : 'Chỉnh Sửa Điểm Ghim'}</h3>
                            <button className="nam-modal-close" onClick={() => setViewMode('list')}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSubmit}>
                            <div className="admin-form-group">
                                <label>Tên đặc sản / Địa điểm ghim <span style={{ color: '#EF4444' }}>*</span></label>
                                <input type="text" name="TenDacSan" value={formValues.TenDacSan} onChange={handleInputChange} className="admin-form-control" placeholder="Nhập tên đặc sản..." required />
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Tọa độ Vĩ độ (Latitude) <span style={{ color: '#EF4444' }}>*</span></label>
                                    <input type="text" name="ViDo" value={formValues.ViDo} onChange={handleInputChange} className="admin-form-control" placeholder="Ví dụ: 10.2435" required />
                                </div>
                                <div className="admin-form-group">
                                    <label>Tọa độ Kinh độ (Longitude) <span style={{ color: '#EF4444' }}>*</span></label>
                                    <input type="text" name="KinhDo" value={formValues.KinhDo} onChange={handleInputChange} className="admin-form-control" placeholder="Ví dụ: 106.3752" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '1.25rem' }}>
                                <div className="admin-form-group">
                                    <label>Tỉnh Thành <span style={{ color: '#EF4444' }}>*</span></label>
                                    <select name="ID_TinhThanh" value={formValues.ID_TinhThanh} onChange={(e) => { handleInputChange(e); setFormValues(p => ({...p, ID_Xa: '', ID_Ap: ''})); }} className="admin-form-control" required>
                                        <option value="">-- Chọn Tỉnh --</option>
                                        {TinhThanh.map((t, index) => <option key={t.ID_TinhThanh || index} value={t.ID_TinhThanh}>{t.TenTinhThanh}</option>)}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Xã / Phường <span style={{ color: '#EF4444' }}>*</span></label>
                                    <select name="ID_Xa" value={formValues.ID_Xa} onChange={(e) => { handleInputChange(e); setFormValues(p => ({...p, ID_Ap: ''})); }} className="admin-form-control" disabled={!formValues.ID_TinhThanh} required>
                                        <option value="">-- Chọn Xã --</option>
                                        {FormXa.map((x, index) => <option key={x.ID_Xa || index} value={x.ID_Xa}>{x.Ten_xa}</option>)}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Ấp / Khu Phố</label>
                                    <select name="ID_Ap" value={formValues.ID_Ap} onChange={handleInputChange} className="admin-form-control" disabled={!formValues.ID_Xa}> 
                                        <option value="">-- Chọn Ấp (Không bắt buộc) --</option>
                                        {FormAp.map((a, index) => <option key={a.ID_Ap || index} value={a.ID_Ap}>{a.Ten_ap}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Phân loại</label>
                                <input type="text" name="PhanLoai" value={formValues.PhanLoai} onChange={handleInputChange} className="admin-form-control" placeholder="Ví dụ: Đặc sản, Địa danh..." />
                            </div>

                            <div className="admin-form-group">
                                <label>Mô tả chi tiết</label>
                                <textarea name="MoTa" value={formValues.MoTa} onChange={handleInputChange} className="admin-form-control" style={{ height: '80px', resize: 'vertical' }} placeholder="Nhập mô tả về điểm ghim này..."></textarea>
                            </div>

                            <div className="admin-form-group">
                                <label>Hình ảnh đặc sản</label>
                                <input type="file" accept="image/*" onChange={(e) => setHinhAnhFile(e.target.files[0])} className="admin-form-control" />
                            </div>

                            <div className="nam-modal-footer">
                                <button type="button" className="filter-btn" onClick={() => setViewMode('list')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><X size={16} /> Hủy bỏ</button>
                                <button type="submit" className="btn-action btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={16} /> Lưu thông tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default BanDoControl;