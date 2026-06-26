import { useState, useEffect, useRef } from 'react';
import { 
    DollarSign, 
    Users, 
    ShoppingBag, 
    Store, 
    Activity, 
    PlusCircle,
    FileText,
    Map,
    X,
    Sparkles,
    Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';

function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loaiBieuDo, setLoaiBieuDo] = useState('7_ngay'); // '7_ngay' or '6_thang'
    const [showAllProducts, setShowAllProducts] = useState(false);
    
    // Fetch stats using useQuery
    const { data: responseData, isLoading: loading } = useQuery({
        queryKey: ['adminDashboard', loaiBieuDo],
        queryFn: async () => {
            const response = await axiosClient.get('/admin/dashboard', {
                params: { loai_bieu_do: loaiBieuDo }
            });
            return response.data?.data;
        }
    });

    const stats = responseData?.stats || {
        doanh_thu_hom_nay: 0,
        doanh_thu_hom_nay_growth: 0,
        user_hom_nay: 0,
        user_hom_nay_growth: 0,
        don_hang_hom_nay: 0,
        don_hang_hom_nay_growth: 0,
        gian_hang_hom_nay: 0,
        gian_hang_hom_nay_growth: 0,
        shop_cho_duyet: 0,
    };

    const chartData = responseData?.bieu_do_doanh_thu || [];
    const topProducts = responseData?.TopSP || [];

    // Live Activities State loaded from database response and real-time events
    const [activities, setActivities] = useState([]);

    // Sync database activities when loaded
    useEffect(() => {
        if (responseData?.activities) {
            setActivities(responseData.activities);
        }
    }, [responseData]);

    // Format display time for activities
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return timeStr;
        }
    };

    useEffect(() => {
        const handleNewActivity = (e) => {
            const newAct = e.detail;
            
            setActivities(prev => {
                // Check if activity already exists in state
                if (prev.some(act => act.id === newAct.id)) return prev;
                return [newAct, ...prev].slice(0, 30);
            });

            // Update stats query cache dynamically depending on event content
            queryClient.setQueryData(['adminDashboard', loaiBieuDo], (prev) => {
                if (!prev) return prev;
                const nextStats = { ...prev.stats };
                const tieudeLower = (newAct.tieude || '').toLowerCase();
                
                if (tieudeLower.includes('người dùng') || tieudeLower.includes('user') || tieudeLower.includes('khách hàng')) {
                    nextStats.user_hom_nay += 1;
                } else if (tieudeLower.includes('cửa hàng') || tieudeLower.includes('shop') || tieudeLower.includes('gian hàng')) {
                    nextStats.gian_hang_hom_nay += 1;
                    nextStats.shop_cho_duyet += 1;
                }
                return {
                    ...prev,
                    stats: nextStats
                };
            });
        };

        window.addEventListener('new-admin-activity', handleNewActivity);
        return () => window.removeEventListener('new-admin-activity', handleNewActivity);
    }, [loaiBieuDo, queryClient]);

    const formatVND = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const renderTrendBadge = (growthValue) => {
        const val = parseFloat(growthValue) || 0;
        if (val === 0) return null;
        const isUp = val > 0;
        return (
            <span className={`trend ${isUp ? 'up' : 'down'}`} style={{
                color: isUp ? '#10B981' : '#EF4444',
                background: isUp ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '6px',
                marginLeft: '8px'
            }}>
                {isUp ? '+' : ''}{val}%
            </span>
        );
    };

    return (
        <div id="dashboard" className="view-section admin-dashboard-enhanced">
            <style>{`
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(212, 163, 115, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(212, 163, 115, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(212, 163, 115, 0); }
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes highlight-new {
                    0% { background-color: rgba(212, 163, 115, 0.15); }
                    100% { background-color: transparent; }
                }
                .pulse-new-activity {
                    animation: highlight-new 3s ease-out;
                }
                .dashboard-shortcuts-grid button {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .dashboard-shortcuts-grid button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(212, 163, 115, 0.12);
                }
                .stat-card-enhanced {
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(212, 163, 115, 0.15);
                    transition: all 0.3s ease;
                }
                .stat-card-enhanced:hover {
                    transform: translateY(-4px);
                    border-color: rgba(212, 163, 115, 0.4);
                    box-shadow: 0 12px 24px rgba(212, 163, 115, 0.08);
                }
                .activity-glow-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #d4a373;
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulse-glow 1.8s infinite;
                }
                .dashboard-chart-layout-grid {
                    display: grid;
                    grid-template-columns: 2.2fr 1fr;
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                .chart-section {
                    background: #ffffff;
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    border: 1px solid rgba(212, 163, 115, 0.15);
                }
                @media (max-width: 1024px) {
                    .dashboard-chart-layout-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .progress-track {
                    width: 100%;
                    height: 6px;
                    background-color: #f1f5f9;
                    border-radius: 9999px;
                    overflow: hidden;
                    margin-top: 4px;
                }
                .progress-bar-fill {
                    height: 100%;
                    border-radius: 9999px;
                }
                .progress-bar-fill.color-0 { background-color: #d4a373; }
                .progress-bar-fill.color-1 { background-color: #3b82f6; }
                .progress-bar-fill.color-2 { background-color: #10b981; }
            `}</style>

            {/* Stat Grid */}
            <div className="stat-grid" style={{ animation: 'fade-in-up 0.5s ease-out' }}>
                <div className="stat-card stat-card-enhanced">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Doanh thu hôm nay</h3>
                        <div className="value">
                            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{loading ? '---' : formatVND(stats.doanh_thu_hom_nay)}</span>
                            {!loading && renderTrendBadge(stats.doanh_thu_hom_nay_growth)}
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-enhanced">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Thành viên đăng ký hôm nay</h3>
                        <div className="value">
                            <span>{loading ? '---' : stats.user_hom_nay}</span>
                            {!loading && renderTrendBadge(stats.user_hom_nay_growth)}
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-enhanced">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đơn hàng hôm nay</h3>
                        <div className="value">
                            <span>{loading ? '---' : stats.don_hang_hom_nay}</span>
                            {!loading && renderTrendBadge(stats.don_hang_hom_nay_growth)}
                        </div>
                    </div>
                </div>

                <div className="stat-card stat-card-enhanced" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/shops')}>
                    <div className="stat-icon" style={{ background: 'rgba(212, 163, 115, 0.1)', color: '#d4a373' }}>
                        <Store size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Cửa hàng chờ duyệt</h3>
                        <div className="value">
                            <span>{loading ? '---' : stats.shop_cho_duyet}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Charts & Top Products Layout */}
            <div className="dashboard-chart-layout-grid" style={{ animation: 'fade-in-up 0.6s ease-out' }}>
                
                {/* Left Side: Chart Section */}
                <div className="chart-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Đồ thị tăng trưởng doanh thu & đơn hàng</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Theo dõi thống kê kinh doanh</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className={`filter-btn ${loaiBieuDo === '7_ngay' ? 'active' : ''}`}
                                onClick={() => setLoaiBieuDo('7_ngay')}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            >
                                7 Ngày qua
                            </button>
                            <button 
                                className={`filter-btn ${loaiBieuDo === '6_thang' ? 'active' : ''}`}
                                onClick={() => setLoaiBieuDo('6_thang')}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                            >
                                6 Tháng qua
                            </button>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 300 }}>
                        {!loading && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d4a373" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#d4a373" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="nhan" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
                                        formatter={(value, name) => {
                                            if (name === "Doanh thu") return [formatVND(value), name];
                                            return [value + " Đơn", name];
                                        }}
                                    />
                                    <Legend iconType="circle" />
                                    <Area 
                                        name="Doanh thu"
                                        type="monotone" 
                                        dataKey="doanh_thu" 
                                        stroke="#d4a373" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorDoanhThu)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                Đang tải sơ đồ dữ liệu hoặc không có thông tin...
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Top Selling Products Card */}
                <div className="chart-section" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Award size={20} color="#d4a373" /> Top bán chạy tháng này
                        </h2>
                    </div>
                    
                    <div style={{ 
                        flexGrow: 1, 
                        maxHeight: showAllProducts ? '360px' : '260px', 
                        overflowY: 'auto', 
                        paddingRight: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {!loading && topProducts.length > 0 ? (
                            topProducts.slice(0, showAllProducts ? 50 : 10).map((p, idx) => {
                                const maxVal = topProducts[0]?.tong_ban || 1;
                                const percent = ((p.tong_ban || 0) / maxVal) * 100;
                                return (
                                    <div key={p.ID_SanPham || idx} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                                                {idx + 1}. {p.TenSanPham}
                                            </span>
                                            <span style={{ color: 'var(--text-muted)' }}>{p.tong_ban || 0} bán</span>
                                        </div>
                                        <div className="progress-track">
                                            <div 
                                                className={`progress-bar-fill color-${idx % 3}`} 
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '2rem 0' }}>
                                Chưa có sản phẩm bán ra tháng này
                            </div>
                        )}
                    </div>

                    {!loading && topProducts.length > 10 && (
                        <button 
                            onClick={() => setShowAllProducts(!showAllProducts)}
                            className="filter-btn"
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginTop: '12px',
                                border: '1px dashed rgba(212, 163, 115, 0.4)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                backgroundColor: 'rgba(212, 163, 115, 0.05)',
                                color: '#d4a373',
                                cursor: 'pointer'
                            }}
                        >
                            {showAllProducts ? "Thu gọn" : `Xem thêm (+${topProducts.length - 10})`}
                        </button>
                    )}
                </div>

            </div>

            {/* Quick Link & Recent Activities */}
            <div className="dashboard-content-grid" style={{ animation: 'fade-in-up 0.8s ease-out', marginTop: '1.5rem' }}>
                
                {/* Quick Actions Card */}
                <div className="admin-card stat-card-enhanced" style={{ margin: 0 }}>
                    <div className="card-header">
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <PlusCircle size={20} color="var(--sidebar-active)" /> Lối tắt quản trị nhanh
                        </h2>
                    </div>
                    <div className="dashboard-shortcuts-grid">
                        <button className="filter-btn" onClick={() => navigate('/admin/posts')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', border: '1px solid rgba(212, 163, 115, 0.2)' }}>
                            <FileText size={16} /> Viết bài mới
                        </button>
                        <button className="filter-btn" onClick={() => navigate('/admin/regions')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', border: '1px solid rgba(212, 163, 115, 0.2)' }}>
                            <Map size={16} /> Quản lý vùng
                        </button>
                        <button className="filter-btn" onClick={() => navigate('/admin/shops')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', border: '1px solid rgba(212, 163, 115, 0.2)' }}>
                            <Store size={16} /> Duyệt gian hàng
                        </button>
                        <button className="filter-btn" onClick={() => navigate('/admin/orders')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem', border: '1px solid rgba(212, 163, 115, 0.2)' }}>
                            <ShoppingBag size={16} /> Đơn hàng mới
                        </button>
                    </div>
                </div>

                {/* Recent Activities Card */}
                <div className="admin-card stat-card-enhanced" style={{ margin: 0 }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="var(--sidebar-active)" /> Hoạt động mới
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                        {activities.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '2rem 0' }}>
                                Chưa có hoạt động mới nào hôm nay
                            </div>
                        ) : (
                            activities.map((act) => (
                                <div 
                                    key={act.id} 
                                    className={act.pulse ? 'pulse-new-activity' : ''}
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        borderBottom: '1px solid var(--border-color)', 
                                        paddingBottom: '12px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>{act.tieude}</p>
                                        <small style={{ color: 'var(--text-muted)' }}>{formatTime(act.thoigian)}</small>
                                    </div>
                                    <span className={`badge ${
                                        act.type === 'system' ? 'badge-success' : 'badge-pending'
                                    }`} style={{
                                        backgroundColor: act.type === 'system' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 163, 115, 0.15)',
                                        color: act.type === 'system' ? '#10B981' : '#d4a373',
                                        border: 'none',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontWeight: '600'
                                    }}>
                                        {act.trangthai}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;