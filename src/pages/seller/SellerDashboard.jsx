import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, DollarSign, TrendingUp, Users, Star, ArrowRight, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import '../../styles/seller.css';

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

export default function SellerDashboard() {
  const { shop, shopLoading: loading, shopError: error } = useOutletContext();
  const [loaiBieuDo, setLoaiBieuDo] = useState('7_ngay');

  // Fetch statistics via useQuery
  const { data: responseData, isLoading: statsLoading } = useQuery({
    queryKey: ['sellerDashboard', loaiBieuDo],
    queryFn: async () => {
      const response = await axiosClient.get('/seller/dashboard', {
        params: { loai_bieu_do: loaiBieuDo }
      });
      return response.data?.data;
    },
    enabled: !!shop && shop.TrangThaiDuyet === 'da_duyet'
  });

  const stats = statsLoading ? null : (responseData?.stats || {
    tong_san_pham: 0,
    cho_xu_ly: 0,
    doanh_thu_hom_nay: 0,
    doanh_thu_thang: 0,
    tong_don_hang: 0,
    rating: 5.0
  });

  const chartData = responseData?.bieu_do_doanh_thu || [];
  const topProductsRaw = responseData?.TopSP || [];
  const recentOrders = responseData?.recent_orders || [];

  // Map top products for the bar chart
  const barChartData = topProductsRaw.map((p, idx) => ({
    name: p.TenSanPham,
    daBan: parseInt(p.tong_ban || 0)
  }));

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const statusInfo = shop ? (STATUS_CONFIG[shop.TrangThaiDuyet] || STATUS_CONFIG.cho_duyet) : null;

  return (
    <div style={{ padding: '1rem 0', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Loading thông tin shop ── */}
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '15px' }}>
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
                {statusInfo.icon} {statusInfo.label}
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
              <h3 style={{ margin: '0 0 0.5rem 0', color: shop.TrangThaiDuyet === 'cho_duyet' ? '#B45309' : '#991B1B' }}>{statusInfo.label}</h3>
              <p style={{ margin: 0, color: '#4A3B32' }}>{statusInfo.desc}</p>
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
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>
                    {statsLoading ? '...' : stats.tong_san_pham}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
                  <Link to="/seller/orders" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>ĐƠN CHỜ XÁC NHẬN</div>
                      <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '8px', color: '#D97706' }}><ShoppingBag size={18} /></div>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706' }}>
                      {statsLoading ? '...' : stats.cho_xu_ly}
                    </div>
                  </Link>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>DOANH THU HÔM NAY</div>
                    <div style={{ background: '#D1FAE5', padding: '6px', borderRadius: '8px', color: '#059669' }}><DollarSign size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {statsLoading ? '...' : formatVND(stats.doanh_thu_hom_nay)}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>DOANH THU THÁNG NÀY</div>
                    <div style={{ background: '#E0F2FE', padding: '6px', borderRadius: '8px', color: '#0284C7' }}><TrendingUp size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284C7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {statsLoading ? '...' : formatVND(stats.doanh_thu_thang)}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>TỔNG ĐƠN HÀNG</div>
                    <div style={{ background: '#F3E8FF', padding: '6px', borderRadius: '8px', color: '#7E22CE' }}><Users size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>
                    {statsLoading ? '...' : stats.tong_don_hang}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 600 }}>ĐÁNH GIÁ CỦA SHOP</div>
                    <div style={{ background: '#FEF08A', padding: '6px', borderRadius: '8px', color: '#CA8A04' }}><Star size={18} /></div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D241E' }}>
                    {statsLoading ? '...' : `${stats.rating}/5`}
                  </div>
                </div>

              </div>

              {/* 2. Charts Row */}
              <div className="charts-row-responsive">
                
                {/* Line Chart */}
                <div style={{ minWidth: 0, overflow: 'hidden', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2D241E', fontWeight: 700 }}>Biểu đồ tăng trưởng doanh thu & số đơn</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setLoaiBieuDo('7_ngay')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #4A5B45',
                          background: loaiBieuDo === '7_ngay' ? '#4A5B45' : '#fff',
                          color: loaiBieuDo === '7_ngay' ? '#fff' : '#4A5B45',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        7 ngày qua
                      </button>
                      <button 
                        onClick={() => setLoaiBieuDo('6_thang')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #4A5B45',
                          background: loaiBieuDo === '6_thang' ? '#4A5B45' : '#fff',
                          color: loaiBieuDo === '6_thang' ? '#fff' : '#4A5B45',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        6 tháng qua
                      </button>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 300 }}>
                    {!statsLoading && chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE3DA" />
                          <XAxis dataKey="nhan" axisLine={false} tickLine={false} tick={{ fill: '#8C7B6D', fontSize: 12 }} dy={10} />
                          <YAxis tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#8C7B6D', fontSize: 12 }} dx={-10} />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === "Doanh thu") return [formatVND(value), "Doanh thu"];
                              return [value + " Đơn", "Số đơn"];
                            }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Legend iconType="circle" />
                          <Line type="monotone" dataKey="doanh_thu" stroke="#4A5B45" strokeWidth={3} dot={{ r: 4, fill: '#4A5B45', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Doanh thu" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8c7b6d', fontSize: '0.9rem' }}>
                        Đang tải biểu đồ hoặc chưa có dữ liệu giao dịch hoàn tất...
                      </div>
                    )}
                  </div>
                </div>

                {/* Bar Chart */}
                <div style={{ minWidth: 0, overflow: 'hidden', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#2D241E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} color="#D2B48C" /> Top 10 bán chạy tháng này
                  </h3>
                  <div style={{ 
                    flexGrow: 1, 
                    maxHeight: '260px', 
                    overflowY: 'auto', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    paddingRight: '6px'
                  }}>
                    {!statsLoading && barChartData.length > 0 ? (
                      barChartData.map((p, idx) => {
                        const maxVal = barChartData[0]?.daBan || 1;
                        const percent = ((p.daBan || 0) / maxVal) * 100;
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                                {idx + 1}. {p.name}
                              </span>
                              <span style={{ color: '#8c7b6d' }}>{p.daBan} bán</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                              <div style={{ height: '100%', backgroundColor: idx % 2 === 0 ? '#4A5B45' : '#D2B48C', borderRadius: '999px', width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', color: '#8c7b6d', fontSize: '0.85rem', padding: '2rem 0' }}>
                        Chưa có sản phẩm bán ra tháng này
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 3. Tables Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #EAE3DA', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2D241E', fontWeight: 700 }}>Đơn hàng mới nhất</h3>
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
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>SẢN PHẨM CHỌN</th>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>TỔNG TIỀN</th>
                          <th style={{ padding: '1rem', borderBottom: '2px solid #F4EFEA', color: '#8C7B6D', fontSize: '0.85rem', fontWeight: 700 }}>TRẠNG THÁI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!statsLoading && recentOrders.length > 0 ? (
                          recentOrders.map((order, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #F4EFEA' }}>
                              <td style={{ padding: '1rem', fontWeight: 600, color: '#4A5B45' }}>{order.id}</td>
                              <td style={{ padding: '1rem', color: '#2D241E' }}>{order.customer}</td>
                              <td style={{ padding: '1rem', color: '#4A3B32', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.product}>
                                {order.product}
                              </td>
                              <td style={{ padding: '1rem', fontWeight: 700, color: '#2D241E' }}>{formatVND(order.total)}</td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{ 
                                  background: order.status === 'Chờ xác nhận' ? '#FEF3C7' : order.status === 'Hoàn thành' ? '#D1FAE5' : '#E0F2FE',
                                  color: order.status === 'Chờ xác nhận' ? '#B45309' : order.status === 'Hoàn thành' ? '#059669' : '#0284C7',
                                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#8c7b6d', fontSize: '0.9rem' }}>
                              Chưa có đơn hàng nào
                            </td>
                          </tr>
                        )}
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
