import { useState } from 'react';
import '../../styles/navbar-admin.css';
import { Search, Eye, Edit, Trash2, Plus, ArrowLeft, Save, X, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';

const initialFormState = {
    tittel: "",
    tomtat: "",
    noidung: "",
    hinhanh: null,
    ID_TinhThanh: ""
};
function BaiVietControler() {
    const [viewMode, setViewMode] = useState('list');
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [addFormData, setAddFormData] = useState({
        tittel: "",
        tomtat: "",
        noidung: "",
        hinhanh: null,
        ID_TinhThanh: "",
    });
    const [editFormData, setEditFormData] = useState({
        ID_Blog: "",
        tittel: "",
        tomtat: "",
        noidung: "",
        hinhanh: null,
        current_hinhanh: "",
        ID_TinhThanh: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const { data: blogs = [], refetch } = useQuery({
        queryKey: ['blogs', searchTerm],
        queryFn: async () => {
            const api = searchTerm
                ? `/admin/BlogControl?search=${encodeURIComponent(searchTerm)}`
                : '/admin/BlogControl';

            const response = await axiosClient.get(api);
            return response.data?.data?.data || response.data?.data || [];
        },
        staleTime: 100,
    });
    const { data: TinhThanh = [] } = useQuery({
        queryKey: ['tinhthanh'],
        queryFn: async () => {
            const api = '/tinh-thanh';
            const response = await axiosClient.get(api);
            return response.data?.data?.data || response.data?.data || response.data || [];
        },
        staleTime: 30000,
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (viewMode === 'edit') {
            setEditFormData({ ...editFormData, [name]: value });
        } else {
            setAddFormData({ ...addFormData, [name]: value });
        }
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            if (viewMode === 'edit') {
                setEditFormData({ ...editFormData, hinhanh: e.target.files[0] });
            } else {
                setAddFormData({ ...addFormData, hinhanh: e.target.files[0] });
            }
        }
    };

    const handleEditClick = (blog) => {
        setFormErrors({}); 
        setEditFormData({
            ID_Blog: blog.ID_Blog,
            tittel: blog.tittel || "",
            tomtat: blog.tomtat || "",
            noidung: blog.noidung || "",
            hinhanh: null,
            current_hinhanh: blog.hinhanh || "", 
            ID_TinhThanh: blog.ID_TinhThanh || ""
        });
        setViewMode('edit');
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});

        const isEdit = viewMode === 'edit';
        const currentData = isEdit ? editFormData : addFormData;

        const dataPayload = new FormData();
        dataPayload.append('tittel', currentData.tittel);
        dataPayload.append('tomtat', currentData.tomtat || '');
        dataPayload.append('noidung', currentData.noidung);
        dataPayload.append('ID_TinhThanh', currentData.ID_TinhThanh ? Number(currentData.ID_TinhThanh) : '');

        if (currentData.hinhanh) {
            dataPayload.append('hinhanh', currentData.hinhanh);
        }
        if (isEdit) {
            dataPayload.append('_method', 'PUT');
        }

        try {
            const apiPath = isEdit ? `/admin/BlogControl/${editFormData.ID_Blog}` : '/admin/BlogControl';

            const response = await axiosClient.post(apiPath, dataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success' || response.data.success) {
                Swal.fire('Thành công', isEdit ? 'Cập nhật bài viết thành công!' : 'Thêm mới bài viết thành công!', 'success');
                if (isEdit) {
                    setEditFormData({ ID_Blog: "", tittel: "", tomtat: "", noidung: "", hinhanh: null, current_hinhanh: "", ID_TinhThanh: "" });
                } else {
                    setAddFormData(initialFormState);
                }

                setViewMode('list');
                refetch();
            } else {
                Swal.fire('Thất bại', response.data.message || 'Không thể lưu bài viết', 'error');
            }
        } catch (error) {
            console.error("--- PHÁT HIỆN LỖI XỬ LÝ FORM ---");
            if (error.response) {
                console.log("👉 CHI TIẾT LỖI TỪ SERVER:", error.response.data);
                if (error.response.status === 422) {
                    setFormErrors(error.response.data.errors || {});
                    return;
                }
            }
            Swal.fire('Lỗi hệ thống', 'Không thể kết nối đến máy chủ!', 'error');
        }
    };
    const handleDeleteClick = (blog) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa?',
            text: `Bài viết "${blog.tittel}" sẽ bị xóa vĩnh viễn và không thể khôi phục!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444', 
            cancelButtonColor: '#6B7280', 
            confirmButtonText: 'Vâng, xóa ngay!',
            cancelButtonText: 'Hủy bỏ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({
                        title: 'Đang xóa...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });
                    const response = await axiosClient.delete(`/admin/BlogControl/${blog.ID_Blog}`);

                    if (response.data.status === 'success' || response.data.success) {
                        Swal.fire('Đã xóa!', 'Bài viết đã được xóa khỏi hệ thống.', 'success');
                        refetch();
                    } else {
                        Swal.fire('Thất bại', response.data.message || 'Không thể xóa bài viết này', 'error');
                    }
                } catch (error) {
                    console.error("--- LỖI KHI XÓA BÀI VIẾT ---", error);
                    const serverMsg = error.response?.data?.message || "Không thể kết nối đến máy chủ!";
                    Swal.fire('Lỗi hệ thống', serverMsg, 'error');
                }
            }
        });
    };
    return (
        <>
            <div className="admin-top-bar" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {viewMode !== 'list' && (
                        <button
                            className="icon-btn"
                            onClick={() => setViewMode('list')}
                            style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <h1 className="admin-title" style={{ marginBottom: 0 }}>
                        {viewMode === 'list' && 'Quản Lý Bài Viết'}
                        {viewMode === 'view' && 'Chi Tiết Bài Viết'}
                        {viewMode === 'add' && 'Tạo Bài Viết Mới'}
                        {viewMode === 'edit' && 'Chỉnh Sửa Bài Viết'}
                    </h1>
                </div>
            </div>

            {/* 1. MÀN HÌNH DANH SÁCH BÀI VIẾT */}
            {viewMode === 'list' && (
                <div id="posts" className="view-section">
                    <div className="admin-filters">
                        <div className="search-box">
                            <Search size={18} color="#6B7280" />
                            <input
                                type="text"
                                placeholder="Tìm tiêu đề, tác giả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div>
                            <button className="btn-action btn-primary" onClick={() => setViewMode('add')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Plus size={16} /> Viết bài mới
                            </button>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-table-wrapper">
                            {blogs.length > 0 ? (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Ảnh</th>
                                            <th>Tiêu đề</th>
                                            <th>Tác giả</th>
                                            <th>Ngày đăng</th>
                                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blogs.map((blog) => (
                                            <tr key={blog.ID_Blog}>
                                                <td>
                                                    <img
                                                        src={blog.hinhanh ? `http://127.0.0.1:8000/storage/${blog.hinhanh}` : "https://via.placeholder.com/80x60?text=No+Image"}
                                                        alt={blog.title || blog.tittel}
                                                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                        onError={(e) => { e.target.src = "https://via.placeholder.com/80x60?text=Error+Image"; }}
                                                    />
                                                </td>
                                                <td>{blog.tittel}</td>
                                                <td>{blog.user?.HoTen}</td>
                                                <td>{blog.ngaydang}</td>
                                                <td style={{ textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button className="icon-btn" onClick={() => handleEditClick(blog)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn danger"
                                                        onClick={() => handleDeleteClick(blog)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button className="icon-btn" onClick={() => { setSelectedBlog(blog); setViewMode('view'); }}>
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{
                                    padding: '3rem 1rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6B7280'
                                }}>
                                    <Search size={48} style={{ marginBottom: '1rem', color: '#9CA3AF' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Danh sách bài viết trống'}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: 0 }}>
                                        {searchTerm
                                            ? `Không tìm thấy bài viết nào khớp với từ khóa "${searchTerm}". Vui lòng thử lại bằng từ khóa khác!`
                                            : 'Hệ thống hiện tại chưa có bài viết nào. Hãy bấm nút "Viết bài mới" để tạo bài viết đầu tiên nhé.'
                                        }
                                    </p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            style={{
                                                marginTop: '1rem',
                                                padding: '6px 12px',
                                                fontSize: '0.85rem',
                                                backgroundColor: '#F3F4F6',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Xóa bộ lọc tìm kiếm
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. MÀN HÌNH FORM THÊM MỚI / CHỈNH SỬA BIẾN THIÊN */}
            {(viewMode === 'add' || viewMode === 'edit') && (() => {
                const formData = viewMode === 'edit' ? editFormData : addFormData;

                return (
                    <div className="admin-card view-section">
                        <form onSubmit={handleFormSubmit}>

                            {/* 1. Ô TIÊU ĐỀ */}
                            <div className="admin-form-group">
                                <label>Tiêu đề bài viết <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    type="text"
                                    name='tittel'
                                    className="admin-form-control"
                                    value={formData.tittel}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tiêu đề sinh động..."
                                />
                                {formErrors.tittel && (
                                    <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                        {formErrors.tittel[0]}
                                    </span>
                                )}
                            </div>

                            {/* 2. Ô TÓM TẮT */}
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Tóm tắt</label>
                                    <input
                                        type="text"
                                        name='tomtat'
                                        value={formData.tomtat}
                                        onChange={handleInputChange}
                                        className="admin-form-control"
                                        placeholder="Tóm tắt nội dung "
                                    />
                                    {formErrors.tomtat && (
                                        <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                            {formErrors.tomtat[0]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 3. Ô KHU VỰC TỈNH THÀNH */}
                            <div className="admin-form-group">
                                <label>Khu vực tỉnh thành <span style={{ color: '#EF4444' }}>*</span></label>
                                <select
                                    name="ID_TinhThanh"
                                    value={formData.ID_TinhThanh}
                                    onChange={handleInputChange}
                                    className="admin-form-control"
                                >
                                    <option value="">-- Chọn tỉnh thành liên quan --</option>
                                    {TinhThanh && TinhThanh.map((tinh) => (
                                        <option key={tinh.ID_TinhThanh} value={tinh.ID_TinhThanh}>
                                            {tinh.TenTinhThanh}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.ID_TinhThanh && (
                                    <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                        {formErrors.ID_TinhThanh[0]}
                                    </span>
                                )}
                            </div>

                            {/* 4. Ô HÌNH ẢNH BÌA (CÓ CHỨC NĂNG PREVIEW ẢNH CŨ) */}
                            <div className="admin-form-group">
                                <label>Hình ảnh bìa {viewMode === 'edit' && '(Để trống nếu giữ nguyên ảnh cũ)'}</label>
                                <input
                                    type="file"
                                    name='hinhanh'
                                    accept='image/*'
                                    onChange={handleFileChange}
                                    className="admin-form-control"
                                />
                                {formData.hinhanh && <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: '500' }}>File đã chọn: {formData.hinhanh.name}</span>}

                                {/* Hiện ảnh cũ nếu đang ở chế độ EDIT */}
                                {viewMode === 'edit' && editFormData.current_hinhanh && !editFormData.hinhanh && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '4px' }}>Ảnh hiện tại trong database:</p>
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${editFormData.current_hinhanh}`}
                                            alt="Current asset"
                                            style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }}
                                        />
                                    </div>
                                )}

                                {formErrors.hinhanh && (
                                    <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                        {formErrors.hinhanh[0]}
                                    </span>
                                )}
                            </div>

                            {/* 5. Ô NỘI DUNG */}
                            <div className="admin-form-group">
                                <label>Nội dung bài viết <span style={{ color: '#EF4444' }}>*</span></label>
                                <textarea
                                    className="admin-form-control"
                                    rows="10"
                                    placeholder="Viết nội dung bài viết vào đây..."
                                    style={{ resize: 'vertical', minHeight: '200px' }}
                                    name='noidung'
                                    value={formData.noidung}
                                    onChange={handleInputChange}
                                ></textarea>
                                {formErrors.noidung && (
                                    <span style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                        {formErrors.noidung[0]}
                                    </span>
                                )}
                            </div>

                            {/* CỤM NÚT BẤM */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="filter-btn"
                                    onClick={() => { setFormErrors({}); setViewMode('list') }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <X size={16} /> Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="btn-action btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Save size={16} /> {viewMode === 'edit' ? 'Cập nhật thay đổi' : 'Lưu bài viết'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            })()}
            {/* 3. MÀN HÌNH XEM CHI TIẾT BÀI VIẾT */}
            {viewMode === 'view' && selectedBlog && (
                <div className="admin-card view-section">
                    <div className="post-detail-layout">
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-muted)' }}>
                            {selectedBlog.tittel}
                        </h2>

                        <div className="post-meta-info">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={16} /> Tác giả: {selectedBlog.user?.HoTen || '--'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} /> Đăng ngày: {selectedBlog.ngaydang || '--'}
                            </span>
                            <span>
                                Trạng thái: &nbsp;
                                <span className="badge badge-pending">Chưa phát hành</span>
                            </span>
                        </div>

                        {selectedBlog.hinhanh && (
                            <div style={{ margin: '1.5rem 0' }}>
                                <img 
                                    src={`http://127.0.0.1:8000/storage/${selectedBlog.hinhanh}`} 
                                    alt={selectedBlog.tittel} 
                                    style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} 
                                />
                            </div>
                        )}
                        <div className="post-body-content" style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            <b>Tóm tắt :</b>
                            {selectedBlog.tomtat || 'Không có nội dung cho bài viết này.'}
                        </div>
                        <div className="post-body-content" style={{ marginTop: '1.5rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            <b>Nội dung :</b>
                            {selectedBlog.noidung || 'Không có nội dung cho bài viết này.'}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button
                                type="button"
                                className="filter-btn"
                                onClick={() => setViewMode('list')}
                            >
                                Quay lại danh sách
                            </button>
                            <button
                                type="button"
                                className="btn-action btn-primary"
                                onClick={() => handleEditClick(selectedBlog)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Edit size={16} /> Chỉnh sửa bài viết
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BaiVietControler;