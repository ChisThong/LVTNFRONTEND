import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import walletApi from '../../api/walletApi';
import { ChevronLeft, Filter } from 'lucide-react';
import '../../styles/wallet.css';

function WalletTransactions({ backPath = '/wallet' }) {
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
      case 'deposit': return <span className="wallet-type-label wallet-type-label--deposit">Nạp tiền</span>;
      case 'payment': return <span className="wallet-type-label wallet-type-label--payment">Thanh toán đơn hàng</span>;
      case 'release': return <span className="wallet-type-label wallet-type-label--release">Tiền hàng về ví</span>;
      case 'commission': return <span className="wallet-type-label wallet-type-label--commission">Phí hoa hồng</span>;
      case 'withdraw': return <span className="wallet-type-label wallet-type-label--withdraw">Rút tiền</span>;
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
    <div className="page-container wallet-page-container wallet-page-container--large">
      <div className="page-header wallet-page-header">
        <h2 className="wallet-title">
          Lịch sử giao dịch
        </h2>
        <button onClick={() => navigate(backPath)} className="shopee-btn-outline wallet-refresh-btn">
          <ChevronLeft size={16} /> Quay lại ví
        </button>
      </div>

      <div className="shopee-card wallet-transactions-card">
        <div className="wallet-transactions-filter-row">
          <Filter size={18} color="#888" />
          <span className="wallet-transactions-filter-label">Lọc theo:</span>
          <div className="wallet-transactions-filter-group">
            <button
              onClick={() => setFilter('all')}
              className={`wallet-transactions-filter-btn ${filter === 'all' ? 'active' : ''}`}
            >Tất cả</button>
            <button
              onClick={() => setFilter('in')}
              className={`wallet-transactions-filter-btn ${filter === 'in' ? 'active' : ''}`}
            >Tiền vào</button>
            <button
              onClick={() => setFilter('out')}
              className={`wallet-transactions-filter-btn ${filter === 'out' ? 'active' : ''}`}
            >Tiền ra</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen wallet-transactions-loading">
            <div className="spinner wallet-loading-spinner" />
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            {/* Scroll ngang trên mobile */}
            <div className="wallet-table-wrapper">
              <table className="data-table wallet-table">
                <thead>
                  <tr className="wallet-table-header-row">
                    <th className="wallet-table-th">Thời gian</th>
                    <th className="wallet-table-th">Loại giao dịch</th>
                    <th className="wallet-table-th">Mã tham chiếu</th>
                    <th className="wallet-table-th wallet-table-th--right">Số tiền</th>
                    <th className="wallet-table-th wallet-table-th--right">Số dư ví</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((t) => (
                      <tr key={t.id} className="wallet-table-tr">
                        <td className="wallet-table-td">{formatDate(t.created_at)}</td>
                        <td className="wallet-table-td wallet-table-td--type">{getTypeLabel(t.type)}</td>
                        <td className="wallet-table-td wallet-table-td--ref">
                          {t.reference_type ? `${t.reference_type}_${t.reference_id}` : `#${t.id}`}
                        </td>
                        <td className={`wallet-table-td wallet-table-td--amount ${t.amount > 0 ? 'in' : 'out'}`}>
                          {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                        </td>
                        <td className="wallet-table-td wallet-table-td--balance">
                          {formatCurrency(t.balance_after)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="wallet-table-empty">
                        <div className="wallet-table-empty-icon">📄</div>
                        Chưa có giao dịch nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>{/* end scroll wrapper */}
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletTransactions;
