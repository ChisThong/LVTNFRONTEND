import { useQuery } from '@tanstack/react-query';
import {
    Search,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Truck,
    CheckCircle2,
    AlertCircle,
    User,
    Store,
    Package
} from 'lucide-react';
import { useState } from 'react';
import { getAllDH } from '../../api/adminDHAPI';

export default function DonHangControl() {
    const [page, setpage] = useState(1);
    const [search, setsearch] = useState("");
    const [trangthai, settrangthai] = useState("");
    const [TuNgay, setTuNgay] = useState("");
    const [DenNgay, setDenNgay] = useState("");

    // Gọi API lấy danh sách đơn hàng
    const { data: responseData, isFetching } = useQuery({
        queryKey: ['donhang', page, search, trangthai, TuNgay, DenNgay],
        queryFn: async () => {
            const params = {
                page: page,
                limit: 10,
                search: search
            };
            if (trangthai !== "") {
                params.TrangThai = trangthai;
            }
            if (TuNgay !== "") {
                params.TuNgay = TuNgay;
            }
            if (DenNgay !== "") {
                params.DenNgay = DenNgay;
            }
            const response = await getAllDH(params);
            return response.data
        }
    })

    const dh = responseData?.data?.data || [];
    const Tongpage = responseData?.data?.last_page || 1;
    const TongDH = responseData?.tongdon || 0;
    const DangGiao = responseData?.demdanggiao || 0;
    const DHHT = responseData?.demhoantat || 0;
    const DHhuy = responseData?.demhuy || 0;

    // Render badge trạng thái đơn hàng
    const renderTrangThai = (status) => {
        switch (Number(status)) {
            case 0: return <span className="badge badge-pending">Chờ xác nhận</span>;
            case 1: return <span className="badge badge-role-seller">Đã xác nhận</span>;
            case 2: return <span className="badge badge-role-admin">Đang giao</span>;
            case 3: return <span className="badge badge-success">Hoàn tất</span>;
            case 4: return <span className="badge badge-role-buyer">Đã hủy</span>;
            default: return <span className="badge badge-role-buyer">Không xác định</span>;
        }
    };

    // Tìm kiếm đơn hàng
    const [inputText, setinputText] = useState("");
    const handleSearch = () => {
        setsearch(inputText);
        setpage(1);
    }

    const handlechangeSearch = (e) => {
        const value = e.target.value;
        setinputText(value);
        if (value.trim() === "") {
            setsearch("");
            setpage(1);
        }
    }

    // Lọc theo trạng thái
    const handleLocTT = (value) => {
        settrangthai(value);
        setpage(1);
    }

    // Lọc từ ngày
    const handleTuNgay = (value) => {
        setTuNgay(value);
        setpage(1);
    }

    // Lọc đến ngày
    const handleDenNgay = (value) => {
        setDenNgay(value);
        setpage(1);
    }

    // Xóa bộ lọc ngày
    const handleXoaloc = () => {
        setTuNgay("");
        setDenNgay("");
        setpage(1);
    }

    // Xem chi tiết đơn hàng
    const [chonDH, setchonDH] = useState(null);
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleOpenCT = (d) => {
        setchonDH(d);
    }
    const handleCloseCT = () => {
        setchonDH(null);
    }

    return (
        <div className="view-section">
            <h1 className="admin-title">Quản lý đơn hàng toàn sàn</h1>

            {/* Thống kê đơn hàng */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-member">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng đơn hàng</h3>
                        <div className="value">{TongDH}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-purple">
                        <Truck size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đang giao</h3>
                        <div className="value">{DangGiao}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-admin">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Hoàn tất</h3>
                        <div className="value">{DHHT}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-locked">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đơn đã hủy</h3>
                        <div className="value">{DHhuy}</div>
                    </div>
                </div>
            </div>

            {/* Khu vực tìm kiếm và bộ lọc */}
            <div className="admin-filters">
                <div className="search-box">
                    <input
                        type="text"
                        value={inputText}
                        onChange={handlechangeSearch}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder='Tìm kiếm theo mã đơn,..'
                    />
                    <button type='button' className="icon-btn" onClick={() => handleSearch()}><Search size={18} /></button>
                </div>
                
                <div className="filter-group">
                    <select name="trangthai" id="trangthai" className="admin-form-control" value={trangthai} onChange={(e) => handleLocTT(e.target.value)}>
                        <option value="">Tất cả đơn hàng</option>
                        <option value="0">Chờ xác nhận</option>
                        <option value="1">Đã xác nhận</option>
                        <option value="2">Đang giao</option>
                        <option value="3">Hoàn tất</option>
                        <option value="4">Đã hủy</option>
                    </select>

                    <div className="flex-align-center-gap-6">
                        <label className="text-semibold text-muted-small">Từ:</label>
                        <input type="date" className="admin-form-control" value={TuNgay} onChange={(e) => handleTuNgay(e.target.value)} />
                    </div>

                    <div className="flex-align-center-gap-6">
                        <label className="text-semibold text-muted-small">Đến:</label>
                        <input type="date" className="admin-form-control" value={DenNgay} onChange={(e) => handleDenNgay(e.target.value)} />
                    </div>

                    {(TuNgay || DenNgay) && (
                        <button type='button' className="filter-btn active" onClick={() => handleXoaloc()}>Xóa lọc ngày</button>
                    )}
                </div>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>MÃ ĐƠN HÀNG</th>
                            <th>KHÁCH HÀNG</th>
                            <th>GIAN HÀNG</th>
                            <th>NGÀY ĐẶT</th>
                            <th>TRẠNG THÁI</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isFetching ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted-small">
                                    Đang tải dữ liệu đơn hàng....
                                </td>
                            </tr>
                        ) : dh.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted-small">
                                    Không tìm thấy đơn hàng phù hợp
                                </td>
                            </tr>
                        ) : (
                            dh.map((d) => (
                                <tr key={d.ID_DonHang}>
                                    <td className="text-bold">{d.MaDonHangCon}</td>
                                    <td className="text-semibold">{d.don_hang_tong?.user?.HoTen}</td>
                                    <td>{d.shop?.TenShop}</td>
                                    <td>
                                        <div className="flex-column-gap-4">
                                            <span>{d.date ? new Date(d.date).toLocaleDateString('vi-VN') : '—'}</span>
                                            <span className="text-muted-small">
                                                {d.date ? new Date(d.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{renderTrangThai(d.TrangThai)}</td>
                                    <td>
                                        <button type='button' className="icon-btn" title="Xem chi tiết đơn hàng" onClick={() => handleOpenCT(d)}>
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="admin-pagination">
                <button className="filter-btn" disabled={page === 1} onClick={() => setpage(prev => Math.max(prev - 1, 1))}><ChevronLeft size={16} /></button>
                <span>Trang: <strong>{page}</strong> / {Tongpage}</span>
                <button className="filter-btn" disabled={page >= Tongpage} onClick={() => setpage(prev => prev + 1)}><ChevronRight size={16} /></button>
            </div>

            {/* Modal xem chi tiết đơn hàng */}
            {chonDH && (
                <div className="nam-modal-overlay">
                    <div className="nam-modal-content order-modal-content">
                        <div className="nam-modal-header">
                            <h3 className="flex-align-center-gap-6">
                                <ShoppingBag size={20} />
                                Chi tiết đơn hàng {chonDH.MaDonHangCon}
                            </h3>
                            <button className="nam-modal-close" onClick={handleCloseCT}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="post-detail-layout">
                            {/* Thông tin cơ bản đơn hàng */}
                            <div className="admin-card order-detail-header-info">
                                <div>
                                    <span className="order-detail-header-label">MÃ ĐƠN HÀNG</span>
                                    <strong className="order-detail-header-val">{chonDH.MaDonHangCon}</strong>
                                </div>
                                <div>
                                    <span className="order-detail-header-label">NGÀY ĐẶT HÀNG</span>
                                    <strong className="order-detail-header-val">
                                        {chonDH.date ? new Date(chonDH.date).toLocaleString('vi-VN') : '—'}
                                    </strong>
                                </div>
                                <div>
                                    <span className="order-detail-header-label">TRẠNG THÁI</span>
                                    <span>{renderTrangThai(chonDH.TrangThai)}</span>
                                </div>
                            </div>

                            {/* Thông tin Người mua & Người bán */}
                            <div className="order-detail-user-shop-grid">
                                {/* Thông tin Khách hàng */}
                                <div className="admin-card">
                                    <h4 className="order-detail-card-title">
                                        <User size={16} /> Thông tin Khách hàng
                                    </h4>
                                    <div className="flex-column-gap-4">
                                        <div className="order-detail-card-row">
                                            <span className="text-muted-small">Họ và tên:</span>
                                            <strong>{chonDH.don_hang_tong?.user?.HoTen || 'N/A'}</strong>
                                        </div>
                                        <div className="order-detail-card-row">
                                            <span className="text-muted-small">Email:</span>
                                            <span>{chonDH.don_hang_tong?.user?.email || 'N/A'}</span>
                                        </div>
                                        <div className="order-detail-card-row">
                                            <span className="text-muted-small">Điện thoại:</span>
                                            <span>{chonDH.don_hang_tong?.user?.sdt || 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin Shop */}
                                <div className="admin-card">
                                    <h4 className="order-detail-card-title">
                                        <Store size={16} /> Thông tin Gian hàng
                                    </h4>
                                    <div className="flex-column-gap-4">
                                        <div className="order-detail-card-row">
                                            <span className="text-muted-small">Tên Shop:</span>
                                            <strong>{chonDH.shop?.TenShop || 'N/A'}</strong>
                                        </div>
                                        <div className="order-detail-card-row">
                                            <span className="text-muted-small">Điện thoại:</span>
                                            <span>{chonDH.shop?.SoDienThoai || 'N/A'}</span>
                                        </div>
                                        <div className="order-detail-card-row-col">
                                            <span className="text-muted-small">Địa chỉ Shop:</span>
                                            <span>{chonDH.shop?.DiaChi || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chi tiết sản phẩm trong đơn */}
                            <div className="admin-card">
                                <h4 className="flex-align-center-gap-6 text-semibold">
                                    <Package size={16} /> Danh sách sản phẩm
                                </h4>

                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Ảnh</th>
                                                <th>Tên sản phẩm</th>
                                                <th>Đơn giá</th>
                                                <th>Số lượng</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chonDH.chi_tiet && chonDH.chi_tiet.length > 0 ? (
                                                chonDH.chi_tiet.map((item, index) => {
                                                    const sanPham = item.san_pham || {};
                                                    const quantity = Number(item.SoLuong) || 1;
                                                    const total = Number(item.TongGia) || 0;
                                                    const price = total / quantity;

                                                    return (
                                                        <tr key={index}>
                                                            <td>
                                                                <img
                                                                    src={sanPham.HinhAnh ? `http://127.0.0.1:8000/storage/products/${sanPham.HinhAnh}` : 'https://via.placeholder.com/50x50?text=SP'}
                                                                    alt={sanPham.TenSanPham}
                                                                    className="product-thumbnail"
                                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/50x50?text=Lỗi+Ảnh"; }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div className="text-semibold">{sanPham.TenSanPham || 'Sản phẩm không tồn tại'}</div>
                                                                {sanPham.DonViTinh && <small className="text-muted-small">ĐVT: {sanPham.DonViTinh}</small>}
                                                            </td>
                                                            <td>{formatPrice(price)}</td>
                                                            <td className="text-center">{quantity}</td>
                                                            <td className="text-bold">{formatPrice(total)}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        Không có sản phẩm nào trong chi tiết đơn hàng này.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Khối Tổng thanh toán */}
                                <div className="order-payment-summary">
                                    <div className="order-payment-row">
                                        <span className="text-muted-small">Tổng tiền sản phẩm:</span>
                                        <span>{formatPrice(Number(chonDH.TongGia) || 0)}</span>
                                    </div>
                                    <div className="order-payment-row">
                                        <span className="text-muted-small">Phí vận chuyển:</span>
                                        <span>{formatPrice(Number(chonDH.PhiVanChuyen) || 0)}</span>
                                    </div>
                                    <div className="order-payment-row">
                                        <strong>Tổng thanh toán:</strong>
                                        <strong className="status-text-orange">{formatPrice((Number(chonDH.TongGia) || 0) + (Number(chonDH.PhiVanChuyen) || 0))}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="nam-modal-footer">
                            <button type='button' className="btn-action btn-primary" onClick={handleCloseCT}>Đóng chi tiết</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}