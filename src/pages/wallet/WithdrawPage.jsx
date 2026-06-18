import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import walletApi from '../../api/walletApi';

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
    <div className="page-container">
      <div className="page-header">
        <h2>Rút Tiền Từ Ví</h2>
        <button onClick={() => navigate('/wallet')} className="btn btn-outline">Quay lại ví</button>
      </div>

      <div className="form-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleWithdraw}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Số tiền rút (VNĐ) <span className="required">*</span></label>
            <input 
              type="number" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: e.target.value})} 
              placeholder="Ví dụ: 500000"
              min="10000"
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Tên Ngân Hàng <span className="required">*</span></label>
            <input 
              type="text" 
              value={formData.bank_name} 
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})} 
              placeholder="Ví dụ: Vietcombank"
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Số Tài Khoản <span className="required">*</span></label>
            <input 
              type="text" 
              value={formData.bank_account} 
              onChange={(e) => setFormData({...formData, bank_account: e.target.value})} 
              placeholder="Ví dụ: 0123456789"
              required 
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem', background: loading ? '#ccc' : 'var(--green-primary)', borderColor: loading ? '#ccc' : 'var(--green-primary)' }} 
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
