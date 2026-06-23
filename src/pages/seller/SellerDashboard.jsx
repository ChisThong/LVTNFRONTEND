import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, DollarSign, TrendingUp, Users, Star, ArrowRight } from 'lucide-react';
import '../../styles/seller.css';

const BASE_URL = 'http://127.0.0.1:8000/storage/';

/* ── MOCK DATA CHO BIỂU ĐỒ VÀ BẢNG THỐNG KÊ ── */
const mockRevenue7Days = [
  { name: 'T2', doanhThu: 1200000 },
  { name: 'T3', doanhThu: 1500000 },
  { name: 'T4', doanhThu: 800000 },
  { name: 'T5', doanhThu: 2200000 },
  { name: 'T6', doanhThu: 1800000 },
  { name: 'T7', doanhThu: 2500000 },
  { name: 'CN', doanhThu: 3100000 },
];

const mockTopProducts = [
  { name: 'Dừa Sáp Trà Vinh', daBan: 145 },
  { name: 'Mật Ong Rừng U Minh', daBan: 112 },
  { name: 'Kẹo Dừa Bến Tre', daBan: 89 },
  { name: 'Khô Cá Lóc Đồng', daBan: 76 },
  { name: 'Mắm Trí Tôn', daBan: 54 },
];

const mockRecentOrders = [
  { id: 'DH-001', customer: 'Nguyễn Văn A', product: 'Dừa Sáp Trà Vinh (x2)', total: '300.000₫', status: 'Chờ xác nhận' },
  { id: 'DH-002', customer: 'Lê Thị B', product: 'Mật Ong Rừng U Minh (x1)', total: '450.000₫', status: 'Đang giao' },
  { id: 'DH-003', customer: 'Trần Văn C', product: 'Kẹo Dừa Bến Tre (x5)', total: '150.000₫', status: 'Chờ lấy hàng' },
  { id: 'DH-004', customer: 'Phạm Thị D', product: 'Khô Cá Lóc Đồng (x1)', total: '200.000₫', status: 'Hoàn thành' },
  { id: 'DH-005', customer: 'Hoàng Văn E', product: 'Mắm Trí Tôn (x2)', total: '180.000₫', status: 'Chờ xác nhận' },
];

/* ── Trạng thái duyệt config ── */
const STATUS_CONFIG = {
  cho_duyet: {
    label:  'Đang chờ duyệt',
    desc:   'Gian hàng của bạn đang chờ quản trị viên xét duyệt. Thường trong 1-3 ngày làm việc.',
    icon:   '⏳',
    cls:    'cho_duyet',
  },
  da_duyet: {
    label:  'Đã được duyệt',
    desc:   'Chúc mừng! Gian hàng đã được duyệt. Bạn có thể bắt đầu đăng sản phẩm.',
    icon:   '✅',
    cls:    'da_duyet',
  },
  tu_choi: {
    label:  'Gian hàng bị từ chối',
    desc:   'Gian hàng của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin.',
    icon:   '❌',
    cls:    'tu_choi',
  },
};

// Formatter cho tiền tệ VNĐ
const formatCurrency = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'Tr';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
  return value;
};

export default function SellerDashboard() {
  const { shop, shopLoading: loading, shopError: error } = useOutletContext();

  const status = shop ? (STATUS_CONFIG[shop.TrangThaiDuyet] || STATUS_CONFIG.cho_duyet) : null;

  return (
    <div style={{ padding: '1.5rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8C7B6D' }}>
          Đang tải thông tin gian hàng...
        </div>
      )}

      {/* ── Lỗi / Chưa có Shop (Dành cho Role 2) ── */}
      {!loading && error && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏪</div>
          <h2 style={{ color: '#2D241E', marginBottom: '0.5rem' }}>{error}</h2>
          <p style={{ color: '#8C7B6D', marginBottom: '1.5rem' }}>Mở gian hàng ngay để bắt đầu bán đặc sản Miền Nam!</p>
          <Link to="/seller/register" style={{
            background: '#2C3A29', color: '#fff', padding: '0.75rem 1.5rem',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600
          }}>
            Đăng ký gian hàng ngay
          </Link>
        </div>
      )}

      {/* ── Khi đã có Shop ── */}
      {!loading && shop && (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2C3A29', margin: '0 0 0.5rem 0' }}>Tổng quan gian hàng</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8C7B6D', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600, color: '#4A5B45' }}>{shop.TenShop}</span>
                <span>•</span>
                <span>Loại hình kinh doanh: <strong style={{ color: '#D97706' }}>{shop.LoaiHinhKinhDoanh === 'doanh_nghiep' ? 'Doanh nghiệp' : 'Hộ kinh doanh cá thể'}</strong></span>
              </div>
            </div>
            
            {shop.TrangThaiDuyet === 'da_duyet' ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/seller/products" style={{
                  background: '#fff', color: '#4A5B45', padding: '0.6rem 1.2rem',
                  borderRadius: '6px', textDecoration: 'none', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                  border: '1.5px solid #4A5B45'
                }}>
                  <Package size={16} /> Quản lý sản phẩm
                </Link>
                <Link to="/seller/products/create" style={{
                  background: '#2C3A29', color: '#fff', padding: '0.6rem 1.2rem',
                  borderRadius: '6px', textDecoration: 'none', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                }}>
                  <Package size={16} /> Thêm sản phẩm
                </Link>
              </div>
            ) : (
              <span style={{ 
                background: shop.TrangThaiDuyet === 'cho_duyet' ? '#FEF3C7' : '#FEE2E2', 
                color: shop.TrangThaiDuyet === 'cho_duyet' ? '#B45309' : '#DC2626', 
                padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem',
                alignSelf: 'center'
              }}>
                {status.icon} {status.label}
              </span>
            )}
          </div>

          {/* Cảnh báo shop chưa duyệt */}
          {shop.TrangThaiDuyet !== 'da_duyet' && (
            <div style={{ 
              background: shop.TrangThaiDuyet === 'cho_duyet' ? '#FFFBEB' : '#FEF2F2', 
              borderLeft: `4px solid ${shop.TrangThaiDuyet === 'cho_duyet' ? '#F59E0B' : '#EF4444'}`,
              padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: shop.TrangThaiDuyet === 'cho_duyet' ? '#B45309' : '#991B1B' }}>{status.label}</h3>
              <p style={{ margin: 0, color: '#4A3B32' }}>{status.desc}</p>
              {shop.TrangThaiDuyet === 'tu_choi' && shop.LyDoTuChoi && (
                <div style={{ marginTop: '1rem', background: '#fff', padding: '1rem', borderRadius: '6px', border: '1px solid #FECACA' }}>
                  <strong style={{ color: '#DC2626' }}>Lý do từ chối:</strong> {shop.LyDoTuChoi}
                </div>
              )}
            </div>
          )}

          {/* NẾU ĐÃ DUYỆT THÌ HIỂN THỊ DASHBOARD FULL */}
          {shop.TrangThaiDuyet === 'da_duyet' && (
            <>
              {/* 1. Kpi Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                
                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>TỔNG SẢN PHẨM</div>
                    <div style={{ background: '#F4EFEA', padding: '6px', borderRadius: '8px', color: '#4A5B45' }}><Package size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>45</div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>CHỜ XỬ LÝ</div>
                    <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '8px', color: '#D97706' }}><ShoppingBag size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>12</div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>DOANH THU HÔM NAY</div>
                    <div style={{ background: '#D1FAE5', padding: '6px', borderRadius: '8px', color: '#059669' }}><DollarSign size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>3.2M</div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>DOANH THU THÁNG</div>
                    <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '8px', color: '#0284C7' }}><TrendingUp size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>45.5M</div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>LƯỢT TRUY CẬP</div>
                    <div style={{ background: '#F3E8FF', padding: '6px', borderRadius: '8px', color: '#7E22CE' }}><Users size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>1,204</div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>ĐÁNH GIÁ</div>
                    <div style={{ background: '#FEF08A', padding: '6px', borderRadius: '8px', color: '#CA8A04' }}><Star size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>4.8/5</div>
                </div>

              </div>

              {/* 2. Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Line Chart */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#2D241E' }}>Doanh thu 7 ngày gần nhất</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockRevenue7Days}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3DA" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8C7B6D', fontSize: 12 }} dy={10} />
                        <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fill: '#8C7B6D', fontSize: 12 }} dx={-10} />
                        <Tooltip 
                          formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="doanhThu" stroke="#4A5B45" strokeWidth={3} dot={{ r: 4, fill: '#4A5B45', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Doanh thu" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#2D241E' }}>Top 5 sản phẩm bán chạy</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockTopProducts} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EAE3DA" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4A3B32', fontSize: 12 }} width={120} />
                        <Tooltip 
                          cursor={{ fill: '#F8F5F1' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="daBan" fill="#D2B48C" radius={[0, 4, 4, 0]} barSize={20} name="Đã bán" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 3. Tables Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2D241E' }}>Đơn hàng mới nhất</h3>
                    <Link to="/seller/orders" style={{ color: '#4A5B45', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      Xem tất cả <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>MÃ ĐƠN</th>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>KHÁCH HÀNG</th>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>SẢN PHẨM</th>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>TỔNG TIỀN</th>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>TRẠNG THÁI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockRecentOrders.map((order, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F4EFEA' }}>
                            <td style={{ padding: '1rem', fontWeight: 600, color: '#4A5B45' }}>{order.id}</td>
                            <td style={{ padding: '1rem', color: '#2D241E' }}>{order.customer}</td>
                            <td style={{ padding: '1rem', color: '#4A3B32', fontSize: '0.9rem' }}>{order.product}</td>
                            <td style={{ padding: '1rem', fontWeight: 700, color: '#2D241E' }}>{order.total}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ 
                                background: order.status === 'Chờ xác nhận' ? '#FEF3C7' : order.status === 'Hoàn thành' ? '#D1FAE5' : '#E0F2FE',
                                color: order.status === 'Chờ xác nhận' ? '#D97706' : order.status === 'Hoàn thành' ? '#059669' : '#0284C7',
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                              }}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
