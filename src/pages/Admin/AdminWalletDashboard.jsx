import React, { useState, useEffect } from 'react';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';
import { DollarSign, ArrowDownRight, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';

function AdminWalletDashboard() {
  const [stats, setStats] = useState({ total_deposits: 0, total_commissions: 0, total_withdrawals: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, withRes] = await Promise.all([
        walletApi.getAdminStats(),
        walletApi.getAdminWithdrawals()
      ]);
      setStats(statsRes.data.data);
      setWithdrawals(withRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin wallet data', error);
      toast.error('Lỗi khi tải dữ liệu hệ thống ví');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcess = async (id, status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu rút tiền này?`)) return;
    
    toast.loading('Đang xử lý...', { id: 'process' });
    try {
      await walletApi.processAdminWithdrawal(id, status);
      toast.success('Xử lý thành công', { id: 'process' });
      fetchData(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra', { id: 'process' });
    }
  };

  const formatCurrency = (amount) => {
    const formattedNumber = new Intl.NumberFormat('vi-VN').format(amount || 0);
    return (
      <>
        {formattedNumber}
        <span style={{ fontSize: '1.2rem', fontWeight: 500, color: '#333', textDecoration: 'underline', marginLeft: '2px' }}>
          đ
        </span>
      </>
    );
  };

  if (loading && !withdrawals.length) {
    return (
      <div className="loading-screen" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'var(--shopee-orange)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#333' }}>Tổng quan Tài chính (NamBộSpecialties Backoffice)</h2>
        <button onClick={fetchData} className="shopee-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Làm mới dữ liệu</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="shopee-card" style={{ padding: '1.5rem', borderLeft: '4px solid #26aa99' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', marginBottom: '0.5rem' }}>
            <ArrowDownRight size={18} color="#26aa99" /> Tổng tiền nạp (VNPay)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
            {formatCurrency(stats.total_deposits)}
          </div>
        </div>

        <div className="shopee-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--shopee-orange)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', marginBottom: '0.5rem' }}>
            <DollarSign size={18} color="var(--shopee-orange)" /> Doanh thu Hoa hồng
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--shopee-orange)' }}>
            {formatCurrency(stats.total_commissions)}
          </div>
        </div>

        <div className="shopee-card" style={{ padding: '1.5rem', borderLeft: '4px solid #1890ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', marginBottom: '0.5rem' }}>
            <ArrowUpRight size={18} color="#1890ff" /> Tổng tiền User rút
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
            {formatCurrency(stats.total_withdrawals)}
          </div>
        </div>

        <div className="shopee-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f57f17' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', marginBottom: '0.5rem' }}>
            <Clock size={18} color="#f57f17" /> Yêu cầu rút chờ duyệt
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
            {withdrawals.filter(w => w.status === 'pending').length}
          </div>
        </div>
      </div>

      <div className="shopee-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Yêu Cầu Rút Tiền Gần Đây</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', color: '#888', borderBottom: '1px solid #eaeaea', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Mã YC</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Người Dùng</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Số Tiền Rút</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Ngân Hàng Nhận</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Trạng Thái</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '1rem', color: '#555' }}>#{w.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: '#333' }}>{w.user?.HoTen}</div>
                      <div style={{ fontSize: '0.85rem', color: '#888' }}>{w.user?.email}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--shopee-orange)', fontWeight: 'bold' }}>
                      {formatCurrency(w.amount)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: '#1890ff' }}>{w.bank_name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#555' }}>{w.bank_account}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {w.status === 'pending' && <span style={{ background: '#fff3e0', color: '#e65100', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>Chờ duyệt</span>}
                      {w.status === 'approved' && <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>Đã chuyển tiền</span>}
                      {w.status === 'rejected' && <span style={{ background: '#ffebee', color: '#c62828', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>Đã từ chối</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {w.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleProcess(w.id, 'approved')} 
                            style={{ background: '#26aa99', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <CheckCircle size={14} /> Duyệt
                          </button>
                          <button 
                            onClick={() => handleProcess(w.id, 'rejected')} 
                            style={{ background: '#fff', color: 'var(--shopee-orange)', border: '1px solid var(--shopee-orange)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <XCircle size={14} /> Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
                    Không có yêu cầu rút tiền nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminWalletDashboard;
