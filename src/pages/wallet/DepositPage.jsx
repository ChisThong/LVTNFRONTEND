import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';
import { Wallet, CreditCard, ChevronLeft, Shield, Zap } from 'lucide-react';
import '../../styles/wallet.css';

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
    <div className="page-container wallet-page-container wallet-deposit-container">
      <div className="page-header wallet-page-header">
        <h2 className="wallet-title">
          <Wallet color="var(--shopee-orange)" /> Nạp Tiền Vào Ví
        </h2>
        <button onClick={() => navigate('/wallet')} className="shopee-btn-outline wallet-refresh-btn">
          <ChevronLeft size={16} /> Quay lại
        </button>
      </div>

      <div className="shopee-card wallet-utilities-card">
        <form onSubmit={handleDeposit}>
          {/* Amount input */}
          <div className="form-group wallet-form-group">
            <label className="wallet-form-label" style={{ fontSize: '1.1rem' }}>
              Số tiền cần nạp (VNĐ)
            </label>
            <div className="wallet-deposit-amount-wrapper">
              <span className="wallet-deposit-currency-symbol">₫</span>
              <input
                type="number"
                className="admin-form-control wallet-deposit-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                min="10000"
                max="50000000"
              />
            </div>
            {amount && parseInt(amount) >= 10000 && (
              <p className="wallet-deposit-success-hint">
                ✓ Bạn sẽ nạp: <strong>{formatVND(parseInt(amount))}₫</strong>
              </p>
            )}
          </div>

          {/* Quick amount buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="wallet-quick-amounts-label">Hoặc chọn mệnh giá nhanh:</p>
            <div className="wallet-quick-amounts-grid">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`wallet-quick-amount-btn ${amount === amt.toString() ? 'active' : ''}`}
                >
                  {formatVND(amt)}₫
                </button>
              ))}
            </div>
          </div>

          {/* VNPay branding */}
          <div className="wallet-vnpay-branding-box">
            <img
              src="https://vnpay.vn/s1/statics/img/logo2.png"
              alt="VNPay"
              className="wallet-vnpay-logo"
              onError={(e) => {
                // Fallback text logo nếu ảnh không load
                e.target.style.display = 'none';
                e.target.nextSibling.querySelector('.vnpay-fallback').style.display = 'flex';
              }}
            />
            <div>
              <div className="wallet-vnpay-title">
                Thanh toán qua VNPay
              </div>
              <div className="wallet-vnpay-subtitle">
                Hỗ trợ ATM nội địa, Visa, MasterCard, QR Code
              </div>
            </div>
            <div className="wallet-vnpay-badges">
              <span className="wallet-vnpay-badge-ssl">
                <Shield size={12} /> Bảo mật SSL
              </span>
              <span className="wallet-vnpay-badge-instant">
                <Zap size={12} /> Xử lý tức thì
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`shopee-btn wallet-deposit-submit-btn ${loading || !amount ? 'disabled' : 'active'}`}
            disabled={loading || !amount}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="spinner wallet-deposit-submit-spinner" />
                Đang xử lý...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CreditCard size={20} /> Thanh Toán Qua VNPay
              </span>
            )}
          </button>

          <p className="wallet-deposit-footer-tip">
            Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch.
          </p>
        </form>
      </div>
    </div>
  );
}

export default DepositPage;
