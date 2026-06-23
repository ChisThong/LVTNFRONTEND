import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import walletApi from '../../api/walletApi';
import '../../styles/wallet.css';

function WithdrawPage() {
  const [formData, setFormData] = useState({ amount: '', bank_name: '', bank_account: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (formData.amount < 10000) {
      setError('Số tiền rút tối thiểu là 10.000 VNĐ');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await walletApi.withdraw(formData);
      setSuccess('Yêu cầu rút tiền thành công! Vui lòng chờ Admin duyệt.');
      setFormData({ amount: '', bank_name: '', bank_account: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container wallet-page-container">
      <div className="page-header wallet-page-header">
        <h2 className="wallet-title">Rút Tiền Từ Ví</h2>
        <button onClick={() => navigate('/wallet')} className="btn btn-outline wallet-refresh-btn">Quay lại ví</button>
      </div>

      <div className="form-card wallet-form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleWithdraw}>
          <div className="form-group wallet-form-group">
            <label className="wallet-form-label">Số tiền rút (VNĐ) <span className="required">*</span></label>
            <input 
              type="number" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: e.target.value})} 
              placeholder="Ví dụ: 500000"
              min="10000"
              className="wallet-form-input"
              required 
            />
          </div>

          <div className="form-group wallet-form-group">
            <label className="wallet-form-label">Tên Ngân Hàng <span className="required">*</span></label>
            <input 
              type="text" 
              value={formData.bank_name} 
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})} 
              placeholder="Ví dụ: Vietcombank"
              className="wallet-form-input"
              required 
            />
          </div>

          <div className="form-group wallet-form-group wallet-form-group--last">
            <label className="wallet-form-label">Số Tài Khoản <span className="required">*</span></label>
            <input 
              type="text" 
              value={formData.bank_account} 
              onChange={(e) => setFormData({...formData, bank_account: e.target.value})} 
              placeholder="Ví dụ: 0123456789"
              className="wallet-form-input"
              required 
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary wallet-form-submit-btn" 
              style={{ background: loading ? '#ccc' : 'var(--green-primary)', borderColor: loading ? '#ccc' : 'var(--green-primary)' }} 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo Yêu Cầu Rút Tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WithdrawPage;
