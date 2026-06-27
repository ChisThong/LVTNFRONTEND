import { useQuery } from "@tanstack/react-query";
import { getSellerThongKeDoanhThu } from "../../api/baocaoAPI";
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
    Award, 
    Filter,
    ChevronDown,
    Download,
    FileText,
    Star,
    AlertCircle
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
    PieChart,
    Pie,
    Cell
} from "recharts";

export default function SellerBaoCaoThongKe() {
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

    const { data: responseData } = useQuery({
        queryKey: ['sellerDT', tungay, denngay, loai], 
        queryFn: async () => {
            const params = {
                tungay: tungay || undefined,
                denngay: denngay || undefined,
                Loai: loai 
            };
            const response = await getSellerThongKeDoanhThu(params);
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

    const ratingAvg = responseData?.RatingAvg || 5.0;
    const ratingCount = responseData?.RatingCount || 0;
    const phantramRating = responseData?.phantramRating || 0;

    const topProducts = responseData?.Topsp || [];
    const orderStatusBreakdown = responseData?.OrderStatusBreakdown || [];
    const sellerChoXuLy = responseData?.SellerChoXuLy || null;

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
        csvContent += `BÁO CÁO THỐNG KÊ DOANH THU GIAN HÀNG,,,\n`;
        csvContent += `Khoảng thời gian:,${formatDateVN(tungay)} - ${formatDateVN(denngay)},,\n`;
        csvContent += `Loại báo cáo:,${loai === 'date' ? 'Ngày' : loai === 'month' ? 'Tháng' : loai === 'quarter' ? 'Quý' : 'Năm'},,\n\n`;

        // 2. Summary Stats
        csvContent += `TỔNG QUAN GIAN HÀNG,,,\n`;
        csvContent += `Chỉ số,Giá trị,Tăng trưởng so với tháng trước\n`;
        csvContent += `Doanh thu tháng này,${tongDoanhThu} VND,${phantramDoanhThu}%\n`;
        csvContent += `Đơn hàng tháng này,${tongDonHang} Đơn,${phantramDonHang}%\n`;
        csvContent += `Sản phẩm mới,${tongSanPham},${phantramSanPham}%\n`;
        csvContent += `Đánh giá trung bình,${ratingAvg}/5.0 (Lượt đánh giá: ${ratingCount}),${phantramRating}%\n\n`;

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

        // 5. Order Status Breakdown
        csvContent += `TRẠNG THÁI ĐƠN HÀNG,,,\n`;
        csvContent += `Trạng thái,Số lượng\n`;
        orderStatusBreakdown.forEach(item => {
            csvContent += `"${item.name}",${item.value}\n`;
        });

        // Trigger Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BaoCaoThongKe_Seller_${tungay}_to_${denngay}.csv`);
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

    const PIE_COLORS = ["#eab308", "#3b82f6", "#f97316", "#10b981", "#ef4444"];

    return (
        <div className="reports-container" style={{ padding: "24px" }}>
            <style>{printStyle}</style>
            
            {/* Header */}
            <div className="reports-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div className="reports-title-area">
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px 0" }}>Báo cáo & Thống kê doanh thu</h1>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Theo dõi chi tiết hiệu quả kinh doanh của gian hàng</p>
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
            {sellerChoXuLy && (sellerChoXuLy.sp_cho_duyet > 0 || sellerChoXuLy.don_hang_cho_xac_nhan > 0) && (
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
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: "0 0 4px 0", color: "#92400e", fontSize: "14px", fontWeight: "700" }}>Thông báo cần xử lý</h4>
                        <p style={{ margin: 0, color: "#b45309", fontSize: "13px" }}>
                            Bạn có <strong>{sellerChoXuLy.don_hang_cho_xac_nhan}</strong> đơn hàng đang chờ xác nhận và <strong>{sellerChoXuLy.sp_cho_duyet}</strong> sản phẩm đang chờ kiểm duyệt.
                        </p>
                    </div>
                </div>
            )}

            {/* Khối hiển thị số liệu Tổng quan */}
            <div className="overview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "24px" }}>
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
                    <h3 className="stat-card-value">{formatNumber(tongDonHang)} đơn</h3>
                    {renderGrowthInfo(phantramDonHang)}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Sản phẩm mới thêm</span>
                        <div className="stat-icon-wrapper products">
                            <Package size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{formatNumber(tongSanPham)} SP</h3>
                    {renderGrowthInfo(phantramSanPham)}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Đánh giá trung bình</span>
                        <div className="stat-icon-wrapper shops" style={{ backgroundColor: "#fef3c7", color: "#eab308" }}>
                            <Star size={20} />
                        </div>
                    </div>
                    <h3 className="stat-card-value">{ratingAvg}/5.0</h3>
                    <div className="stat-card-desc" style={{ color: "#64748b" }}>
                        <span>Lượt đánh giá: {ratingCount}</span>
                    </div>
                </div>
            </div>

            {/* Bộ lọc và Biểu đồ Doanh thu */}
            <div className="chart-section-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginBottom: "24px" }}>
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
                            <p className="card-subtitle" style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 16px 0" }}>Chọn khoảng thời gian và chế độ gom nhóm để phân tích doanh thu.</p>
                            
                            <div className="filter-group" style={{ marginBottom: "16px" }}>
                                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px" }}>Xem tăng trưởng theo</label>
                                <div className="pill-group" style={{ display: "flex", gap: "8px" }}>
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
                                            style={{
                                                padding: "6px 12px",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "20px",
                                                backgroundColor: loai === item.val ? "#2C3A29" : "#ffffff",
                                                color: loai === item.val ? "#ffffff" : "#475569",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label" style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px" }}>Khoảng thời gian áp dụng</label>
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

                        <div className="summary-info-box" style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "16px" }}>
                            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between" }}>
                                <div className="summary-col" style={{ display: "flex", flexDirection: "column" }}>
                                    <span className="summary-label" style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Doanh số lọc</span>
                                    <span className="summary-value revenue" style={{ fontSize: "16px", fontWeight: "800", color: "#10b981" }}>{formatVND(TongDT_Loc)}</span>
                                </div>
                                <div className="summary-col" style={{ display: "flex", flexDirection: "column" }}>
                                    <span className="summary-label" style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Số đơn lọc</span>
                                    <span className="summary-value orders" style={{ fontSize: "16px", fontWeight: "800", color: "#3b82f6" }}>{TongDH_Loc} Đơn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ đường & diện tích */}
                <div className="card-container">
                    <div className="card-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h5 className="card-title">Biểu đồ tăng trưởng doanh thu & số đơn hàng</h5>
                        <span className="chart-badge" style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "12px", color: "#475569", fontWeight: "600" }}>Chỉ số thực tế</span>
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
                                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} tick={{ fill: '#64748b', fontSize: 11 }} />
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

            {/* Khối dưới: Top Sản phẩm và Trạng thái Đơn hàng */}
            <div className="bottom-sections-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Top Sản phẩm bán chạy */}
                <div className="card-container">
                    <div className="card-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h5 className="card-title">Top sản phẩm bán chạy</h5>
                        <Award size={18} className="text-warning" />
                    </div>
                    <div className="ranking-list" style={{ maxHeight: showAllProducts ? "400px" : "auto", overflowY: showAllProducts ? "auto" : "visible", paddingRight: "4px" }}>
                        {topProducts.length > 0 ? (
                            topProducts.slice(0, showAllProducts ? 50 : 10).map((p, idx) => {
                                const maxVal = topProducts[0]?.tong_ban || 1;
                                const percent = ((p.tong_ban || 0) / maxVal) * 100;
                                return (
                                    <div key={idx} className="ranking-item-col" style={{ marginBottom: "12px" }}>
                                        <div className="ranking-item-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                            <span className="ranking-item-name" style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{idx + 1}. {p.TenSanPham}</span>
                                            <span className="ranking-item-value" style={{ fontSize: "12px", color: "#64748b" }}>{p.tong_ban || 0} đã bán</span>
                                        </div>
                                        <div className="progress-track" style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px" }}>
                                            <div 
                                                className={`progress-bar-fill color-${idx % 3}`} 
                                                style={{ 
                                                    width: `${percent}%`, 
                                                    height: "100%", 
                                                    borderRadius: "3px",
                                                    backgroundColor: idx % 3 === 0 ? "#10b981" : idx % 3 === 1 ? "#3b82f6" : "#fb923c"
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: "center", color: "#64748b", padding: "24px" }}>Không có dữ liệu sản phẩm</div>
                        )}
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

                {/* Trạng thái đơn hàng */}
                <div className="card-container">
                    <div className="card-header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h5 className="card-title">Phân tích trạng thái đơn hàng</h5>
                        <ShoppingCart size={18} className="text-success" />
                    </div>
                    
                    <div style={{ width: "100%", height: 260, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {orderStatusBreakdown.length > 0 && orderStatusBreakdown.some(i => i.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderStatusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orderStatusBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                                Không có dữ liệu đơn hàng
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "12px" }}>
                        {orderStatusBreakdown.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                <span style={{ color: "#475569" }}>{item.name}:</span>
                                <strong style={{ color: "#1e293b" }}>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
