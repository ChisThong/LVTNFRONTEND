import { 
    DollarSign, 
    Users, 
    ShoppingBag, 
    Store, 
    ArrowUpRight, 
    Activity, 
    PlusCircle,
    FileText,
    Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div id="dashboard" className="view-section">
            {/* Stat Grid */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng doanh thu</h3>
                        <div className="value">
                            <span>128.4M VNĐ</span>
                            <span className="trend up">+12%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Người dùng mới</h3>
                        <div className="value">
                            <span>1,240</span>
                            <span className="trend up" style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' }}>+18%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Đơn hàng chờ</h3>
                        <div className="value">
                            <span>45</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                        <Store size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Gian hàng chờ duyệt</h3>
                        <div className="value">
                            <span>12</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Link & Recent Activities */}
            <div className="dashboard-content-grid">
                
                {/* Quick Actions Card */}
                <div className="admin-card">
                    <div className="card-header">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <PlusCircle size={20} color="var(--sidebar-active)" /> Lối tắt quản trị
                        </h2>
                    </div>
                    <div className="dashboard-shortcuts-grid">
                        <button className="filter-btn" onClick={() => navigate('/admin/posts')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem' }}>
                            <FileText size={16} /> Viết bài mới
                        </button>
                        <button className="filter-btn" onClick={() => navigate('/admin/regions')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem' }}>
                            <Map size={16} /> Quản lý vùng
                        </button>
                        <button className="filter-btn" onClick={() => navigate('/admin/stores')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem' }}>
                            <Store size={16} /> Duyệt gian hàng
                        </button>
                        <button className="filter-btn" onClick={() => navigate('/admin/orders')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '1rem' }}>
                            <ShoppingBag size={16} /> Đơn hàng mới
                        </button>
                    </div>
                </div>

                {/* Recent Activities Card */}
                <div className="admin-card">
                    <div className="card-header">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="var(--sidebar-active)" /> Hoạt động gần đây
                        </h2>
                        <ArrowUpRight size={18} color="var(--text-muted)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Cửa hàng Bến Tre Mới gửi yêu cầu duyệt</p>
                                <small style={{ color: 'var(--text-muted)' }}>10 phút trước</small>
                            </div>
                            <span className="badge badge-pending">Chờ duyệt</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Hóa đơn #ORD-8823 đã hoàn tất</p>
                                <small style={{ color: 'var(--text-muted)' }}>32 phút trước</small>
                            </div>
                            <span className="badge badge-success">Thành công</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Người dùng Nguyễn Văn A đã đăng ký</p>
                                <small style={{ color: 'var(--text-muted)' }}>1 giờ trước</small>
                            </div>
                            <span className="badge badge-success">Mới</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;