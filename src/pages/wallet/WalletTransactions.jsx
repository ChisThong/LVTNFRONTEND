import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import walletApi from '../../api/walletApi';
import { ChevronLeft, Filter } from 'lucide-react';

function WalletTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await walletApi.getTransactions();
        setTransactions(response.data.data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'deposit': return <span style={{ color: '#26aa99', fontWeight: 500 }}>Nạp tiền</span>;
      case 'payment': return <span style={{ color: 'var(--shopee-orange)', fontWeight: 500 }}>Thanh toán đơn hàng</span>;
      case 'release': return <span style={{ color: '#1890ff', fontWeight: 500 }}>Tiền hàng về ví</span>;
      case 'commission': return <span style={{ color: '#f57f17', fontWeight: 500 }}>Phí hoa hồng</span>;
      case 'withdraw': return <span style={{ color: '#6a1b9a', fontWeight: 500 }}>Rút tiền</span>;
      default: return <span>{type}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
  };

  const filteredData = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'in') return t.amount > 0;
    if (filter === 'out') return t.amount < 0;
    return true;
  });

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          Lịch sử giao dịch
        </h2>
        <button onClick={() => navigate('/wallet')} className="shopee-btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
          <ChevronLeft size={16} /> Quay lại ví
        </button>
      </div>

      <div className="shopee-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Filter size={18} color="#888" />
          <span style={{ fontWeight: 500, color: '#555' }}>Lọc theo:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: filter === 'all' ? '1px solid var(--shopee-orange)' : '1px solid #ddd', background: filter === 'all' ? 'var(--shopee-orange)' : '#fff', color: filter === 'all' ? '#fff' : '#555', cursor: 'pointer' }}
            >Tất cả</button>
            <button 
              onClick={() => setFilter('in')}
              style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: filter === 'in' ? '1px solid var(--shopee-orange)' : '1px solid #ddd', background: filter === 'in' ? 'var(--shopee-orange)' : '#fff', color: filter === 'in' ? '#fff' : '#555', cursor: 'pointer' }}
            >Tiền vào</button>
            <button 
              onClick={() => setFilter('out')}
              style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: filter === 'out' ? '1px solid var(--shopee-orange)' : '1px solid #ddd', background: filter === 'out' ? 'var(--shopee-orange)' : '#fff', color: filter === 'out' ? '#fff' : '#555', cursor: 'pointer' }}
            >Tiền ra</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '30vh' }}>
            <div className="spinner" style={{ borderColor: 'var(--shopee-orange)', borderTopColor: 'transparent' }}></div>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', color: '#888', borderBottom: '1px solid #eaeaea' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, background: 'transparent' }}>Thời gian</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, background: 'transparent' }}>Loại giao dịch</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, background: 'transparent' }}>Mã tham chiếu</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, background: 'transparent' }}>Số tiền</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, background: 'transparent' }}>Số dư ví</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '1rem', color: '#555', fontSize: '0.9rem' }}>{formatDate(t.created_at)}</td>
                      <td style={{ padding: '1rem' }}>{getTypeLabel(t.type)}</td>
                      <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
                        {t.reference_type ? `${t.reference_type}_${t.reference_id}` : `#${t.id}`}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: t.amount > 0 ? '#26aa99' : 'var(--shopee-orange)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#555', fontWeight: 500 }}>
                        {formatCurrency(t.balance_after)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state" style={{ padding: '4rem', color: '#aaa' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                      Chưa có giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletTransactions;
