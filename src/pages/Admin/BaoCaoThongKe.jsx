import { useQuery } from "@tanstack/react-query";
import { getThongKeDoanhThu } from "../../api/baocaoAPI";
import { useState } from "react";
import "../../styles/reports.css";
import { 
    Users, 
    Store, 
    Package, 
    ShoppingCart, 
    DollarSign, 
    Calendar, 
    TrendingUp, 
    MapPin, 
    Award, 
    Filter,
    ChevronDown,
    Download,
    FileText
} from "lucide-react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";

export default function BaoCaoThongKe() {
    const getInitialStartDate = () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}-01`;
    };
    
    const getInitialEndDate = () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const [tungay, settungay] = useState(getInitialStartDate());
    const [denngay, setdenngay] = useState(getInitialEndDate());
    const [loai, setloai] = useState("date"); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [showAllShops, setShowAllShops] = useState(false);

    const { data: responseData } = useQuery({
        queryKey: ['DT', tungay, denngay, loai], 
        queryFn: async () => {
            const params = {
                tungay: tungay || undefined,
                denngay: denngay || undefined,
                Loai: loai 
            };
            const response = await getThongKeDoanhThu(params);
            return response.data;
        }
    });

    const dataBiudo = responseData?.bieudoDT || [];
    const tongDoanhThu = responseData?.TongDTthangnay || 0;
    const phantramDoanhThu = responseData?.phantramDT || 0;

    const tongDonHang = responseData?.DHthangnay || 0;
    const phantramDonHang = responseData?.phantramDH || 0;

    const tongSanPham = responseData?.SLsp || 0;
    const phantramSanPham = responseData?.phantramSP || 0;

    const tongShop = responseData?.GHthangnay || 0;
    const phantramShop = responseData?.phantramGH || 0;

    const tongUser = responseData?.Sluser || 0;
    const phantramUser = responseData?.phamtramuser || 0;

    const topProducts = responseData?.Topsp || [];
    const topShops = responseData?.Topshop || [];
    const provinces = responseData?.TinhThanhTK || [];
    const danhMucTK = responseData?.DanhMucTK || [];
    const blogTinhThanhTK = responseData?.BlogTinhThanhTK || [];
    const adminChoXuLy = responseData?.AdminChoXuLy || null;

    // Tính doanh số lọc và số đơn lọc trực tiếp từ mảng biểu đồ được lọc
    const TongDT_Loc = dataBiudo.reduce((sum, item) => sum + (item.doanh_thu || 0), 0);
    const TongDH_Loc = dataBiudo.reduce((sum, item) => sum + (item.so_don || 0), 0);

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const formatDateVN = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
    };

    const handleExportExcel = () => {
        if (!dataBiudo || dataBiudo.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        let csvContent = "\uFEFF";
        
        // 1. Header Info
        csvContent += `BÁO CÁO THỐNG KÊ DOANH THU,,,\n`;
        csvContent += `Khoảng thời gian:,${formatDateVN(tungay)} - ${formatDateVN(denngay)},,\n`;
        csvContent += `Loại báo cáo:,${loai === 'date' ? 'Ngày' : loai === 'month' ? 'Tháng' : loai === 'quarter' ? 'Quý' : 'Năm'},,\n\n`;

        // 2. Summary Stats
        csvContent += `TỔNG QUAN HỆ THỐNG,,,\n`;
        csvContent += `Chỉ số,Giá trị,Tăng trưởng so với tháng trước\n`;
        csvContent += `Doanh thu tháng này,${tongDoanhThu} VND,${phantramDoanhThu}%\n`;
        csvContent += `Đơn hàng tháng này,${tongDonHang} Đơn,${phantramDonHang}%\n`;
        csvContent += `Sản phẩm mới,${tongSanPham},${phantramSanPham}%\n`;
        csvContent += `Gian hàng mới,${tongShop},${phantramShop}%\n`;
        csvContent += `Thành viên mới,${tongUser},${phantramUser}%\n\n`;

        // 3. Chart Data table
        csvContent += `CHI TIẾT DOANH THU THEO THỜI GIAN,,,\n`;
        csvContent += `Thời gian,Doanh thu (VND),Số đơn hàng\n`;
        dataBiudo.forEach(row => {
            csvContent += `"${row.tg}",${row.doanh_thu},${row.so_don}\n`;
        });
        csvContent += `\n`;

        // 4. Top Products
        csvContent += `TOP SẢN PHẨM BÁN CHẠY,,,\n`;
        csvContent += `Hạng,Tên sản phẩm,Số lượng đã bán\n`;
        topProducts.forEach((p, idx) => {
            csvContent += `${idx + 1},"${p.TenSanPham}",${p.tong_ban || 0}\n`;
        });
        csvContent += `\n`;

        // 5. Top Shops
        csvContent += `TOP SHOP DOANH THU CAO,,,\n`;
        csvContent += `Hạng,Tên shop,Doanh thu (VND)\n`;
        topShops.forEach((s, idx) => {
            csvContent += `${idx + 1},"${s.TenShop}",${s.doanh_thu || 0}\n`;
        });
        csvContent += `\n`;

        // 6. Products by Province
        csvContent += `SẢN PHẨM THEO TỈNH THÀNH,,,\n`;
        csvContent += `Hạng,Tỉnh thành,Số lượng sản phẩm\n`;
        provinces.forEach((pr, idx) => {
            csvContent += `${idx + 1},"${pr.tinh_thanh}",${pr.so_luong}\n`;
        });
        csvContent += `\n`;

        // 7. Products by Category
        csvContent += `SẢN PHẨM THEO DANH MỤC,,,\n`;
        csvContent += `Hạng,Danh mục,Số lượng sản phẩm\n`;
        danhMucTK.forEach((cat, idx) => {
            csvContent += `${idx + 1},"${cat.ten_loai}",${cat.so_luong}\n`;
        });
        csvContent += `\n`;

        // 8. Blogs by Province
        csvContent += `BÀI VIẾT THEO TỈNH THÀNH,,,\n`;
        csvContent += `Hạng,Tỉnh thành,Số lượng bài viết\n`;
        blogTinhThanhTK.forEach((blog, idx) => {
            csvContent += `${idx + 1},"${blog.tinh_thanh}",${blog.so_luong_blog}\n`;
        });

        // Trigger Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BaoCaoThongKe_ToanDien_${tungay}_to_${denngay}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const printStyle = `
        @media print {
            body * {
                visibility: hidden;
            }
            .reports-container, .reports-container * {
                visibility: visible;
            }
            .reports-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
                padding: 0 !important;
            }
            .date-picker-trigger, .btn-view-more, .popover-buttons, .export-buttons-group, .date-picker-popover {
                display: none !important;
            }
            .card-container {
                box-shadow: none !important;
                border: 1px solid #cbd5e1 !important;
                page-break-inside: avoid;
            }
        }
    `;

    const renderGrowthInfo = (percent) => {
        const val = parseFloat(percent) || 0;
        if (val > 0) {
            return (
                <div className="stat-card-desc" style={{ color: "#10b981", gap: "4px" }}>
                    <TrendingUp size={14} />
                    <span>+{val}% so với tháng trước</span>
                </div>
            );
        } else if (val < 0) {
            return (
                <div className="stat-card-desc" style={{ color: "#ef4444", gap: "4px" }}>
                    <TrendingUp size={14} style={{ transform: "rotate(180deg)" }} />
                    <span>{val}% so với tháng trước</span>
                </div>
            );
        }
        return (
            <div className="stat-card-desc" style={{ color: "#64748b", gap: "4px" }}>
                <span>0% so với tháng trước</span>
            </div>
        );
    };

    return (
        <div className="reports-container">
            <style>{printStyle}</style>
            {/* Header */}
            <div className="reports-header">
                <div className="reports-title-area">
                    <h1>Báo cáo & Thống kê</h1>
                    <p>Theo dõi hoạt động kinh doanh toàn diện trên hệ thống đặc sản</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="export-buttons-group">
                    <button 
                        onClick={handleExportExcel}
                        className="date-picker-trigger"
                        style={{ border: "1px solid #10b981", color: "#10b981", backgroundColor: "#f0fdf4" }}
                        title="Xuất Excel"
                    >
                        <Download size={16} />
                        <span>Xuất Excel</span>
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        className="date-picker-trigger"
                        style={{ border: "1px solid #3b82f6", color: "#3b82f6", backgroundColor: "#eff6ff" }}
                        title="Xuất PDF"
                    >
                        <FileText size={16} />
                        <span>Xuất PDF</span>
                    </button>

                    <div style={{ position: "relative" }}>
                        <button 
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="date-picker-trigger"
                        >
                            <Calendar size={16} className="text-secondary" />
                            <span>{formatDateVN(tungay)} - {formatDateVN(denngay)}</span>
                            <ChevronDown size={14} className="text-secondary" />
                        </button>

                        {showDatePicker && (
                            <div className="date-picker-popover">
                                <h6>Chọn khoảng ngày</h6>
                                <div className="form-group">
                                    <label>Từ ngày</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={tungay} 
                                        max={getInitialEndDate()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const todayStr = getInitialEndDate();
                                            if (val > todayStr) {
                                                settungay(todayStr);
                                            } else {
                                                settungay(val);
                                            }
                                        }} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Đến ngày</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={denngay} 
                                        max={getInitialEndDate()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const todayStr = getInitialEndDate();
                                            if (val > todayStr) {
                                                setdenngay(todayStr);
                                            } else {
                                                setdenngay(val);
                                            }
                                        }} 
                                    />
                                </div>
                                <div className="popover-buttons">
                                    <button 
                                        onClick={() => {
                                            settungay(getInitialStartDate());
                                            setdenngay(getInitialEndDate());
                                            setShowDatePicker(false);
                                        }}
                                        className="btn-reset"
                                    >
                                        Đặt lại
                                    </button>
                                    <button 
                                        onClick={() => setShowDatePicker(false)}
                                        className="btn-apply"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Banner việc cần xử lý */}
            {adminChoXuLy && (adminChoXuLy.shop_cho_duyet > 0 || adminChoXuLy.sp_cho_duyet > 0) && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "24px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#f59e0b",
                        color: "#ffffff"
                    }}>
                        <Award size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: "0 0 4px 0", color: "#92400e", fontSize: "14px", fontWeight: "700" }}>Thông báo duyệt hệ thống</h4>
                        <p style={{ margin: 0, color: "#b45309", fontSize: "13px" }}>
                            Hiện đang có <strong>{adminChoXuLy.shop_cho_duyet}</strong> gian hàng và <strong>{adminChoXuLy.sp_cho_duyet}</strong> sản phẩm đang chờ bạn phê duyệt.
                        </p>
                    </div>
                </div>
            )}

            {/* Khối hiển thị số liệu Tổng quan (Trong tháng này) */}
            <div className="overview-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Doanh thu tháng này</span>
                        <div className="stat-icon-wrapper revenue">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatVND(tongDoanhThu)}</h3>
                    {renderGrowthInfo(phantramDoanhThu)}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Đơn hàng tháng này</span>
                        <div className="stat-icon-wrapper orders">
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(tongDonHang)}</h3>
                    {renderGrowthInfo(phantramDonHang)}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Sản phẩm mới</span>
                        <div className="stat-icon-wrapper products">
                            <Package size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(tongSanPham)}</h3>
                    {renderGrowthInfo(phantramSanPham)}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Gian hàng mới</span>
                        <div className="stat-icon-wrapper shops">
                            <Store size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(tongShop)}</h3>
                    {renderGrowthInfo(phantramShop)}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Thành viên mới</span>
                        <div className="stat-icon-wrapper users">
                            <Users size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(tongUser)}</h3>
                    {renderGrowthInfo(phantramUser)}
                </div>

                <div className="stat-card" style={{ borderColor: (adminChoXuLy?.shop_cho_duyet > 0) ? "#f59e0b" : "#f1f5f9" }}>
                    <div className="stat-card-header">
                        <span className="stat-card-title">Shop chờ duyệt</span>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                            <Store size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(adminChoXuLy?.shop_cho_duyet || 0)}</h3>
                    <div className="stat-card-desc" style={{ color: "#f59e0b", fontWeight: "600" }}>
                        <span>Yêu cầu cần xử lý</span>
                    </div>
                </div>

                <div className="stat-card" style={{ borderColor: (adminChoXuLy?.sp_cho_duyet > 0) ? "#f59e0b" : "#f1f5f9" }}>
                    <div className="stat-card-header">
                        <span className="stat-card-title">Sản phẩm chờ duyệt</span>
                        <div className="stat-icon-wrapper" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                            <Package size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(adminChoXuLy?.sp_cho_duyet || 0)}</h3>
                    <div className="stat-card-desc" style={{ color: "#f59e0b", fontWeight: "600" }}>
                        <span>Yêu cầu cần xử lý</span>
                    </div>
                </div>
            </div>

            {/* Bộ lọc và Biểu đồ Doanh thu */}
            <div className="chart-section-grid">
                {/* Bộ lọc */}
                <div className="card-container">
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", gap: "20px" }}>
                        <div>
                            <div className="card-header-flex">
                                <h5 className="card-title">
                                    <Filter size={18} className="text-primary" />
                                    Bộ lọc thống kê
                                </h5>
                            </div>
                            <p className="card-subtitle">Chọn khoảng thời gian và chế độ gom nhóm để phân tích biểu đồ doanh thu chi tiết.</p>
                            
                            <div className="filter-group">
                                <label className="filter-label">Xem tăng trưởng theo</label>
                                <div className="pill-group">
                                    {[
                                        { val: "date", label: "Ngày" },
                                        { val: "month", label: "Tháng" },
                                        { val: "quarter", label: "Quý" },
                                        { val: "year", label: "Năm" }
                                    ].map((item) => (
                                        <button
                                            key={item.val}
                                            type="button"
                                            onClick={() => setloai(item.val)}
                                            className={`btn-pill ${loai === item.val ? "active" : ""}`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Khoảng thời gian áp dụng</label>
                                <div style={{ 
                                    padding: "10px 12px", 
                                    backgroundColor: "#f8fafc", 
                                    borderRadius: "8px", 
                                    fontSize: "13px", 
                                    color: "#475569", 
                                    fontWeight: "600",
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px" 
                                }}>
                                    <Calendar size={14} className="text-secondary" />
                                    <span>{formatDateVN(tungay)} - {formatDateVN(denngay)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="summary-info-box">
                            <div className="summary-row">
                                <div className="summary-col">
                                    <span className="summary-label">Doanh số lọc</span>
                                    <span className="summary-value revenue">{formatVND(TongDT_Loc)}</span>
                                </div>
                                <div className="summary-col">
                                    <span className="summary-label">Số đơn lọc</span>
                                    <span className="summary-value orders">{TongDH_Loc} Đơn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ đường & diện tích */}
                <div className="card-container">
                    <div className="card-header-flex">
                        <h5 className="card-title">Biểu đồ tăng trưởng doanh thu & số đơn hàng</h5>
                        <span className="chart-badge">Chỉ số thực tế</span>
                    </div>

                    <div style={{ width: "100%", height: 320 }}>
                        {dataBiudo.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={dataBiudo}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                                        </linearGradient>
                                        <linearGradient id="colorDonHang" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="tg" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
                                        formatter={(value, name) => {
                                            if (name === "Doanh thu") return [formatVND(value), name];
                                            return [value + " Đơn", name];
                                        }}
                                    />
                                    <Legend iconType="circle" />
                                    <Area 
                                        yAxisId="left"
                                        name="Doanh thu"
                                        type="monotone" 
                                        dataKey="doanh_thu" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorDoanhThu)" 
                                    />
                                    <Area 
                                        yAxisId="right"
                                        name="Số đơn hàng"
                                        type="monotone" 
                                        dataKey="so_don" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorDonHang)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                                <TrendingUp size={40} style={{ marginBottom: "8px", opacity: 0.5 }} />
                                <span>Không có dữ liệu trong khoảng thời gian này</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hàng 3: Top Sản phẩm, Top Shop và Tỉnh Thành */}
            <div className="bottom-sections-grid">
                {/* Top Sản phẩm bán chạy */}
                <div className="card-container">
                    <div className="card-header-flex">
                        <h5 className="card-title">Top sản phẩm bán chạy</h5>
                        <Award size={18} className="text-warning" />
                    </div>
                    <div className="ranking-list" style={{ maxHeight: showAllProducts ? "400px" : "auto", overflowY: showAllProducts ? "auto" : "visible", paddingRight: "4px" }}>
                        {topProducts.slice(0, showAllProducts ? 50 : 10).map((p, idx) => {
                            const maxVal = topProducts[0]?.tong_ban || 1;
                            const percent = ((p.tong_ban || 0) / maxVal) * 100;
                            return (
                                <div key={idx} className="ranking-item-col">
                                    <div className="ranking-item-header">
                                        <span className="ranking-item-name">{idx + 1}. {p.TenSanPham}</span>
                                        <span className="ranking-item-value">{p.tong_ban || 0} đã bán</span>
                                    </div>
                                    <div className="progress-track">
                                        <div 
                                            className={`progress-bar-fill color-${idx % 3}`} 
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {topProducts.length > 10 && (
                        <button 
                            onClick={() => setShowAllProducts(!showAllProducts)}
                            className="btn-view-more"
                            style={{
                                width: "100%",
                                padding: "8px",
                                marginTop: "12px",
                                border: "1px dashed #e2e8f0",
                                borderRadius: "8px",
                                backgroundColor: "#f8fafc",
                                color: "#475569",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {showAllProducts ? "Thu gọn" : "Xem thêm"}
                        </button>
                    )}
                </div>

                {/* Top Shop doanh thu cao */}
                <div className="card-container">
                    <div className="card-header-flex">
                        <h5 className="card-title">Top shop doanh thu cao</h5>
                        <Store size={18} className="text-success" />
                    </div>
                    <div className="ranking-list" style={{ maxHeight: showAllShops ? "400px" : "auto", overflowY: showAllShops ? "auto" : "visible", paddingRight: "4px" }}>
                        {topShops.slice(0, showAllShops ? 50 : 10).map((s, idx) => {
                            const emojis = ["🥇", "🥈", "🥉"];
                            return (
                                <div key={idx} className="shop-rank-item">
                                    <div className="shop-rank-left">
                                        <div className={`rank-badge rank-${idx + 1}`}>
                                            {emojis[idx] || (idx + 1)}
                                        </div>
                                        <div>
                                            <span className="shop-name-main">{s.TenShop}</span>
                                            <span className="shop-tag-sub">Gian hàng đối tác</span>
                                        </div>
                                    </div>
                                    <span className="shop-revenue-value">{formatVND(s.doanh_thu || 0)}</span>
                                </div>
                            );
                        })}
                    </div>
                    {topShops.length > 10 && (
                        <button 
                            onClick={() => setShowAllShops(!showAllShops)}
                            className="btn-view-more"
                            style={{
                                width: "100%",
                                padding: "8px",
                                marginTop: "12px",
                                border: "1px dashed #e2e8f0",
                                borderRadius: "8px",
                                backgroundColor: "#f8fafc",
                                color: "#475569",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {showAllShops ? "Thu gọn" : "Xem thêm"}
                        </button>
                    )}
                </div>

                {/* Sản phẩm theo tỉnh */}
                <div className="card-container">
                    <div className="card-header-flex">
                        <h5 className="card-title">Sản phẩm theo tỉnh thành</h5>
                        <MapPin size={18} className="text-danger" />
                    </div>
                    
                    <div style={{ width: "100%", height: 320 }}>
                        {provinces.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={provinces.slice(0, 10)}
                                    layout="vertical"
                                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="tinh_thanh" type="category" tickLine={false} axisLine={false} width={80} tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }} interval={0} />
                                    <Tooltip formatter={(value) => [value + " Sản phẩm", "Số lượng"]} />
                                    <Bar dataKey="so_luong" radius={[0, 8, 8, 0]} barSize={12}>
                                        {provinces.slice(0, 10).map((entry, index) => {
                                            const barColors = ["#f43f5e", "#fb7185", "#fecdd3", "#ffe4e6"];
                                            return <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                                Không có dữ liệu tỉnh thành
                            </div>
                        )}
                    </div>


                    <div className="province-indicator-list">
                        {provinces.slice(0, 10).map((pr, idx) => (
                            <div key={idx} className="province-indicator-item">
                                <div className="province-indicator-label">
                                    <span className="province-color-dot" style={{ backgroundColor: ["#f43f5e", "#fb7185", "#fecdd3", "#ffe4e6"][idx % 4] }} />
                                    <span>{pr.tinh_thanh}</span>
                                </div>
                                <span style={{ fontWeight: "700" }}>{pr.so_luong}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Hàng 4: Thống kê Danh mục và Bài viết */}
            <div className="bottom-sections-grid" style={{ marginTop: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                {/* Sản phẩm theo danh mục */}
                <div className="card-container">
                    <div className="card-header-flex">
                        <h5 className="card-title">Sản phẩm theo danh mục</h5>
                        <Package size={18} className="text-primary" />
                    </div>
                    <div className="ranking-list" style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
                        {danhMucTK.length > 0 ? (
                            danhMucTK.map((cat, idx) => {
                                const maxVal = danhMucTK[0]?.so_luong || 1;
                                const percent = ((cat.so_luong || 0) / maxVal) * 100;
                                return (
                                    <div key={idx} className="ranking-item-col" style={{ marginBottom: "12px" }}>
                                        <div className="ranking-item-header">
                                            <span className="ranking-item-name">{idx + 1}. {cat.ten_loai}</span>
                                            <span className="ranking-item-value">{cat.so_luong} sản phẩm</span>
                                        </div>
                                        <div className="progress-track">
                                            <div 
                                                className="progress-bar-fill" 
                                                style={{ width: `${percent}%`, backgroundColor: "#3b82f6" }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100px", color: "#94a3b8" }}>
                                Không có dữ liệu danh mục
                            </div>
                        )}
                    </div>
                </div>

                {/* Bài viết theo tỉnh thành */}
                <div className="card-container">
                    <div className="card-header-flex">
                        <h5 className="card-title">Bài viết theo tỉnh thành</h5>
                        <MapPin size={18} className="text-success" />
                    </div>
                    <div style={{ width: "100%", height: 320, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {blogTinhThanhTK.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={blogTinhThanhTK}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="so_luong_blog"
                                        nameKey="tinh_thanh"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {blogTinhThanhTK.map((entry, index) => {
                                            const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
                                            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                                        })}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value + " bài viết", "Số lượng"]} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100px", color: "#94a3b8" }}>
                                Không có dữ liệu bài viết
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}