import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';
import { Wallet, CreditCard, ChevronLeft, Shield, Zap } from 'lucide-react';

function DepositPage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(val);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount);
    if (!amount || parsedAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }
    if (parsedAmount > 50000000) {
      toast.error('Số tiền nạp tối đa là 50.000.000 VNĐ');
      return;
    }

    setLoading(true);
    toast.loading('Đang khởi tạo thanh toán VNPay...', { id: 'deposit' });

    try {
      const response = await walletApi.createVNPayPayment({ amount: parsedAmount });
      if (response.data && response.data.payUrl) {
        toast.success('Đang chuyển hướng đến VNPay...', { id: 'deposit' });
        window.location.href = response.data.payUrl;
      } else {
        toast.error('Không thể tạo thanh toán VNPay', { id: 'deposit' });
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch', { id: 'deposit' });
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div
        className="page-header"
        style={{ marginBottom: '1rem', borderBottom: '1px solid #eaeaea', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', margin: 0 }}>
          <Wallet color="var(--shopee-orange)" /> Nạp Tiền Vào Ví
        </h2>
        <button onClick={() => navigate('/wallet')} className="shopee-btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
          <ChevronLeft size={16} /> Quay lại
        </button>
      </div>

      <div className="shopee-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleDeposit}>
          {/* Amount input */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '1.1rem', color: '#555', marginBottom: '0.5rem', display: 'block' }}>
              Số tiền cần nạp (VNĐ)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '1rem', top: '50%',
                transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--shopee-orange)',
                fontSize: '1.3rem',
              }}>₫</span>
              <input
                type="number"
                className="admin-form-control"
                style={{
                  width: '100%', paddingLeft: '2.5rem', fontSize: '1.5rem',
                  fontWeight: 'bold', color: 'var(--shopee-orange)', height: '60px',
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                min="10000"
                max="50000000"
              />
            </div>
            {amount && parseInt(amount) >= 10000 && (
              <p style={{ marginTop: '0.5rem', color: '#26aa99', fontSize: '0.9rem' }}>
                ✓ Bạn sẽ nạp: <strong>{formatVND(parseInt(amount))}₫</strong>
              </p>
            )}
          </div>

          {/* Quick amount buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#888', marginBottom: '0.8rem', fontSize: '0.9rem' }}>Hoặc chọn mệnh giá nhanh:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '6px',
                    border: amount === amt.toString() ? '2px solid #0066cc' : '1px solid #ddd',
                    background: amount === amt.toString() ? '#e8f0ff' : '#fff',
                    color: amount === amt.toString() ? '#0066cc' : '#555',
                    fontWeight: amount === amt.toString() ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                  }}
                >
                  {formatVND(amt)}₫
                </button>
              ))}
            </div>
          </div>

          {/* VNPay branding */}
          <div style={{
            padding: '1rem 1.2rem',
            background: 'linear-gradient(135deg, #e8f0ff 0%, #f0f7ff 100%)',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #c5d8f5',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <img
              src="https://vnpay.vn/s1/statics/img/logo2.png"
              alt="VNPay"
              style={{ width: '60px', height: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                // Fallback text logo nếu ảnh không load
                e.target.style.display = 'none';
                e.target.nextSibling.querySelector('.vnpay-fallback').style.display = 'flex';
              }}
            />
            <div>
              <div style={{ fontWeight: 'bold', color: '#003087', fontSize: '1rem' }}>
                Thanh toán qua VNPay
              </div>
              <div style={{ fontSize: '0.82rem', color: '#555', marginTop: '2px' }}>
                Hỗ trợ ATM nội địa, Visa, MasterCard, QR Code
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#26aa99' }}>
                <Shield size={12} /> Bảo mật SSL
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#f59e0b' }}>
                <Zap size={12} /> Xử lý tức thì
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="shopee-btn"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              background: loading || !amount ? '#ccc' : 'linear-gradient(135deg, #0066cc 0%, #004999 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: loading || !amount ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            disabled={loading || !amount}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span
                  className="spinner"
                  style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: '#fff', borderTopColor: 'transparent' }}
                />
                Đang xử lý...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CreditCard size={20} /> Thanh Toán Qua VNPay
              </span>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: '#999' }}>
            Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.
          </p>
        </form>
      </div>
    </div>
  );
}

export default DepositPage;
