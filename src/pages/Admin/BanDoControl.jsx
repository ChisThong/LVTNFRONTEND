import { useState } from 'react';
import '../../styles/navbar-admin.css';
import { Search, ChevronRight, Edit, Trash2, Plus, ArrowLeft, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useQuery } from '@tanstack/react-query';

function BanDoControl() {
    const [isHcmOpen, setIsHcmOpen] = useState(true);
    const [isQuan1Open, setIsQuan1Open] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState('Phường Bến Nghé');
    const [viewMode, setViewMode] = useState('list');

    const [tinhthanh, setTinhThanh] = useState('');
    const [xa, setXa] = useState('');
    const [ap, setAp] = useState('');
    const [searchMap, setSearchMap] = useState('');

    const { data: mapData = [], isLoading, refetch } = useQuery(
        {
            queryKey: ['maps', tinhthanh, xa, ap, searchMap],
            queryFn: async () => {
                const params = new URLSearchParams();
                if (tinhthanh) params.append('ID_TinhThanh', tinhthanh);
                if (xa) params.append('ID_Xa', xa);
                if (ap) params.append('ID_Ap', ap);
                if (searchMap) params.append('search_map', searchMap);
                const api = `/admin/MapControl${params.toString() ? `?${params.toString()}` : ''}`;
                const response = await axiosClient.get(api);
                return response.data?.data?.data || response.data?.data || [];
            },
            staleTime: 2000,
        }
    );

    const { data: TinhThanh = [] } = useQuery({
        queryKey: ['tinhthanh'],
        queryFn: async () => {
            const api = '/tinh-thanh';
            const response = await axiosClient.get(api);
            return response.data?.data?.data || response.data?.data || response.data || [];

        },
        staleTime: 3000,
    })
    const { data: Xa = [] } = useQuery({
        queryKey: ['Xa', 'tinhthanh'],
        queryFn: async () => {
            const api = '/xa';
            const response = await axiosClient.get(api);
            return response.data?.data?.data || response.data?.data || response.data || [];
        },
        staleTime: 3000,
    })
    const { data: Ap = [] } = useQuery({
        queryKey: ['Ap', 'xa'],
        queryFn: async () => {
            const api = '/ap';
            const response = await axiosClient.get(api);
            return response.data?.data?.data || response.data?.data || response.data || [];
        },
        staleTime: 3000,
    })

    const handleOpenAdd = () => {
        setViewMode('add');
    };

    const handleSaveSubmit = (e) => {
        e.preventDefault();
        Swal.fire('Thành công', 'Thông tin điểm ghim đã được ghi nhận!', 'success');
        setViewMode('list');
    };

    return (
        <>
            <div className="admin-top-bar" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                    {viewMode === 'list' && 'Quản Lý Danh Mục Vùng Miền & Bản Đồ'}
                    {viewMode === 'add' && 'Thêm Điểm Ghim Mới'}
                    {viewMode === 'edit' && 'Chỉnh Sửa Điểm Ghim'}
                </h1>
            </div>

            {/* 1. MÀN HÌNH DANH SÁCH & CÂY THƯ MỤC */}
            <div className="province-list">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Khu vực hành chính
                </h2>

                {/* TẦNG 1: LẶP DANH SÁCH TỈNH THÀNH (Ví dụ: TP. Hồ Chí Minh, Tây Ninh...) */}
                {TinhThanh && TinhThanh.map((tinh) => {
                    // Kiểm tra xem Tỉnh này có đang được chọn hay không
                    const isProvinceActive = tinhthanh === String(tinh.ID_TinhThanh);

                    return (
                        <div className="tree-node-container" key={tinh.ID_TinhThanh} style={{ marginBottom: '0.4rem' }}>
                            <div
                                // Nếu đang active thì tự động nhận class 'active' để đổi màu nền đen như ảnh
                                className={`province-item ${isProvinceActive ? 'active' : ''}`}
                                onClick={() => {
                                    setTinhThanh(isProvinceActive ? '' : String(tinh.ID_TinhThanh));
                                    setSelectedRegion(tinh.TenTinhThanh); // Cập nhật chữ ở tiêu đề bảng bên phải
                                    setXa(''); // Đổi tỉnh thì xoá xã cũ
                                    setAp(''); // Đổi tỉnh thì xoá ấp cũ
                                }}
                            >
                                <span>{tinh.TenTinhThanh}</span>
                                <ChevronRight
                                    size={16}
                                    // Tự động xoay mũi tên chúi xuống 90 độ khi mở ra giống ảnh
                                    style={{
                                        transition: 'transform 0.25s',
                                        transform: isProvinceActive ? 'rotate(90deg)' : 'none'
                                    }}
                                />
                            </div>

                            {/* TẦNG 2: LẶP DANH SÁCH XÃ/QUẬN (Chỉ hiển thị khi Tỉnh cha đang được mở) */}
                            {isProvinceActive && Xa && Xa.length > 0 && (
                                <div className="tree-children">
                                    {Xa.map((xaxa) => {
                                        // Kiểm tra xem Xã/Quận này có đang được chọn hay không
                                        const isXaActive = xa === String(xaxa.ID_Xa);

                                        return (
                                            <div className="tree-node-container" key={xaxa.ID_Xa}>
                                                <div
                                                    className={`tree-item ${isXaActive ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ngăn sự kiện click bị lan lên thẻ Tỉnh cha
                                                        setXa(isXaActive ? '' : String(xaxa.ID_Xa));
                                                        setSelectedRegion(`${tinh.TenTinhThanh} - ${xaxa.TenXa}`);
                                                        setAp(''); // Đổi xã thì xoá ấp cũ
                                                    }}
                                                >
                                                    <span>{xaxa.TenXa}</span>
                                                    <ChevronRight
                                                        size={14}
                                                        style={{
                                                            transition: 'transform 0.25s',
                                                            transform: isXaActive ? 'rotate(90deg)' : 'none'
                                                        }}
                                                    />
                                                </div>

                                                {/* TẦNG 3: LẶP DANH SÁCH ẤP/PHƯỜNG (Chỉ hiển thị khi Xã/Quận cha đang được mở) */}
                                                {isXaActive && Ap && Ap.length > 0 && (
                                                    <div className="tree-sub-children">
                                                        {Ap.map((apap) => {
                                                            // Kiểm tra xem Ấp/Phường này có đang được chọn hay không
                                                            const isApActive = ap === String(apap.ID_Ap);

                                                            return (
                                                                <div
                                                                    key={apap.ID_Ap}
                                                                    className={`tree-sub-item ${isApActive ? 'active' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Ngăn sự kiện click lan lên cấp trên
                                                                        setAp(isApActive ? '' : String(apap.ID_Ap));
                                                                        setSelectedRegion(`${tinh.TenTinhThanh} - ${xaxa.TenXa} - ${apap.TenAp}`);
                                                                    }}
                                                                >
                                                                    {apap.TenAp}
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

            {/* 2. MÀN HÌNH FORM THÊM MỚI / CHỈNH SỬA ĐIỂM GHIM
            {(viewMode === 'add' || viewMode === 'edit') && (
                <div className="admin-card view-section">
                    <form onSubmit={handleSaveSubmit}>
                        <div className="admin-form-group">
                            <label>Tên đặc sản / Địa điểm ghim <span style={{ color: '#EF4444' }}>*</span></label>
                            <input
                                type="text"
                                className="admin-form-control"
                                placeholder="Nhập tên đặc sản (ví dụ: Kẹo Dừa Bến Tre...)"
                                required
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Tọa độ Vĩ độ (Latitude) <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="admin-form-control"
                                    placeholder="Ví dụ: 10.2435"
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Tọa độ Kinh độ (Longitude) <span style={{ color: '#EF4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="admin-form-control"
                                    placeholder="Ví dụ: 106.3752"
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Thuộc khu vực hành chính</label>
                                <input
                                    type="text"
                                    className="admin-form-control"
                                    placeholder="Nhập phường/quận/tỉnh..."
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Ảnh đại diện đặc sản (URL)</label>
                                <input
                                    type="text"
                                    className="admin-form-control"
                                    placeholder="Dán link ảnh đại diện..."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button
                                type="button"
                                className="filter-btn"
                                onClick={() => setViewMode('list')}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <X size={16} /> Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="btn-action btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Save size={16} /> Lưu thông tin
                            </button>
                        </div>
                    </form>
                </div>
            )} */}
        </>
    );
}

export default BanDoControl;