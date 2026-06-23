import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import {
  Wallet, Lock, History, ArrowDownCircle, ArrowUpCircle, X
} from 'lucide-react';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';
import '../../styles/wallet.css';

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const BANK_OPTIONS = [
  'Vietcombank', 'Techcombank', 'MBBank', 'ACB',
  'BIDV', 'Agribank', 'VietinBank',
];

const ORANGE = 'var(--shopee-orange)';

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

// ─────────────────────────────────────────────────────────────────────────────
//  UserWallet — Ví dành cho Người mua (Buyer / role 1 & 2)
// ─────────────────────────────────────────────────────────────────────────────
function UserWallet() {
  const { wallet, walletLoading, fetchWallet } = useWallet();

  // ── Modal rút tiền ──
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──
  const openWithdrawModal = () => {
    setWithdrawForm({ amount: '', bankName: '', bankAccount: '' });
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => setShowWithdrawModal(false);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(withdrawForm.amount);
    if (amount < 10000) return toast.error('Số tiền rút tối thiểu là 10.000đ');
    if (amount > (wallet?.balance ?? 0)) return toast.error('Số dư không đủ');
    if (!withdrawForm.bankName) return toast.error('Vui lòng chọn ngân hàng');
    if (!withdrawForm.bankAccount.trim()) return toast.error('Vui lòng nhập số tài khoản');

    setProcessing(true);
    toast.loading('Đang xử lý...', { id: 'uw-withdraw' });
    try {
      await walletApi.withdraw({
        amount,
        bank_name: withdrawForm.bankName,
        bank_account: withdrawForm.bankAccount.trim(),
      });
      toast.success('Gửi yêu cầu rút tiền thành công! Đang chờ admin duyệt.', {
        id: 'uw-withdraw',
      });
      closeWithdrawModal();
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu rút tiền', {
        id: 'uw-withdraw',
      });
    } finally {
      setProcessing(false);
    }
  };

  // ── Loading state ──
  if (walletLoading && !wallet) {
    return (
      <div className="loading-screen wallet-loading-screen">
        <div
          className="spinner wallet-loading-spinner"
          style={{ borderColor: ORANGE }}
        />
        <p>Đang tải thông tin ví...</p>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="page-container wallet-page-container">

      {/* ── Header ── */}
      <div className="page-header wallet-page-header">
        <h2 className="wallet-title">
          <Wallet color={ORANGE} size={28} />
          Ví Mua Sắm
        </h2>
        <button
          id="uw-refresh-btn"
          onClick={fetchWallet}
          className="shopee-btn-outline wallet-refresh-btn"
        >
          Làm mới
        </button>
      </div>

      {/* ── Cards ── */}
      <div className="wallet-grid">
        {/* Card: Số dư khả dụng */}
        <div className="shopee-card wallet-card">
          <div className="wallet-card-bg-icon">
            <Wallet size={150} />
          </div>

          <h3 className="wallet-card-label">
            Số dư khả dụng
          </h3>
          <h1 className="wallet-card-value wallet-card-value--orange">
            {formatCurrency(wallet?.balance)}
          </h1>

          {/* Action buttons — Nạp tiền ưu tiên */}
          <div className="wallet-actions-row">
            <Link
              id="uw-deposit-btn"
              to="/wallet/deposit"
              className="shopee-btn wallet-btn-action"
            >
              <ArrowDownCircle size={18} style={{ marginRight: '6px' }} />
              Nạp Tiền
            </Link>
            <button
              id="uw-withdraw-btn"
              onClick={openWithdrawModal}
              className="shopee-btn-outline wallet-btn-action wallet-btn-action--history"
            >
              Rút Tiền
            </button>
          </div>
        </div>

        {/* Card: Số dư đóng băng + Lịch sử */}
        <div className="shopee-card wallet-pending-card">
          <div>
            <div className="wallet-pending-header">
              <Lock size={18} color="#f57f17" />
              <h3 className="wallet-pending-label">
                Số dư đóng băng
              </h3>
            </div>
            <h2 className="wallet-pending-value">
              {formatCurrency(wallet?.frozen_balance)}
            </h2>
            <p className="wallet-pending-desc">
              Số tiền đang được giữ cho các đơn hàng chưa hoàn tất.
            </p>
          </div>

          <div className="wallet-pending-action-box">
            <p>
              * Lịch sử: Nạp tiền (+), Thanh toán đơn hàng (−).
            </p>
            <Link
              id="uw-history-btn"
              to="/wallet/transactions"
              className="shopee-btn-outline wallet-btn-history"
            >
              <History size={18} style={{ marginRight: '6px' }} />
              Xem lịch sử giao dịch chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tiện ích Ví ── */}
      <div className="shopee-card wallet-utilities-card">
        <h3 className="wallet-utilities-title">Tiện ích Ví</h3>
        <div className="wallet-utilities-grid">

          {/* VNPay — nổi bật với Buyer */}
          <div
            id="uw-vnpay-widget"
            className="wallet-utility-item wallet-utility-item--vnpay"
            onClick={() => (window.location.href = '/wallet/deposit')}
          >
            <img
              src="https://vnpay.vn/s1/statics/img/logo2.png"
              alt="VNPay"
              className="wallet-utility-item-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="wallet-utility-item-logo-text">Nạp tiền VNPay</div>
          </div>

          <div className="wallet-utility-item">
            <div className="wallet-utility-item-icon">🏦</div>
            <div className="wallet-utility-item-text">Ngân hàng liên kết</div>
          </div>

          <div className="wallet-utility-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <div className="wallet-utility-item-icon">🎁</div>
            <div className="wallet-utility-item-text" style={{ color: '#888' }}>Mã giảm giá</div>
          </div>
        </div>
      </div>

      {/* ── Modal Rút Tiền ── */}
      {showWithdrawModal && (
        <div id="uw-withdraw-modal" className="wallet-modal-overlay">
          <div className="wallet-modal-content">
            {/* Close */}
            <button onClick={closeWithdrawModal} className="wallet-modal-close" style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
              <X size={20} />
            </button>

            <h3 className="wallet-modal-title">
              <ArrowUpCircle color={ORANGE} /> Yêu Cầu Rút Tiền
            </h3>

            <form onSubmit={handleWithdrawSubmit}>
              {/* Số tiền */}
              <div className="wallet-form-group">
                <label className="wallet-form-label">
                  Số tiền muốn rút (*)
                </label>
                <input
                  id="uw-withdraw-amount"
                  type="number"
                  required
                  min="10000"
                  max={wallet?.balance ?? 0}
                  placeholder="Ví dụ: 50000"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="wallet-form-input"
                />
                <div className="wallet-input-tip">
                  <span>Tối thiểu: 10.000đ</span>
                  <span>Tối đa: {formatCurrency(wallet?.balance)}</span>
                </div>
              </div>

              {/* Ngân hàng */}
              <div className="wallet-form-group">
                <label className="wallet-form-label">
                  Ngân hàng nhận (*)
                </label>
                <select
                  id="uw-withdraw-bank"
                  required
                  value={withdrawForm.bankName}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                  className="wallet-form-input"
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Số tài khoản */}
              <div className="wallet-form-group wallet-form-group--last">
                <label className="wallet-form-label">
                  Số tài khoản (*)
                </label>
                <input
                  id="uw-withdraw-account"
                  type="text"
                  required
                  placeholder="Nhập số tài khoản ngân hàng..."
                  value={withdrawForm.bankAccount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccount: e.target.value })}
                  className="wallet-form-input"
                />
              </div>

              <button
                id="uw-withdraw-submit"
                type="submit"
                disabled={processing}
                className="wallet-form-submit-btn"
                style={{
                  background: processing ? '#ccc' : ORANGE,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Đang gửi yêu cầu...' : 'Xác Nhận Rút Tiền'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserWallet;
