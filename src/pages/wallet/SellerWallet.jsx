import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet, Lock, History, ArrowUpCircle, ArrowDownCircle, X, Store,
  RefreshCw, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';
import '../../styles/wallet.css';

// ─── Hằng số ─────────────────────────────────────────────────────────────────
const BANK_OPTIONS = [
  'Vietcombank', 'Techcombank', 'MBBank', 'ACB',
  'BIDV', 'Agribank', 'VietinBank',
];

const TEAL = '#26aa99';

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

// ─────────────────────────────────────────────────────────────────────────────
//  SellerWallet — Ví doanh thu dành cho Người bán (Seller / role 3)
//  API: GET /api/seller/wallet  (không dùng WalletContext của buyer)
// ─────────────────────────────────────────────────────────────────────────────
function SellerWallet() {
  const navigate = useNavigate();

  // ── State ví riêng của Seller (tách biệt với WalletContext của buyer) ──────
  const [sellerWallet, setSellerWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  // ── Thông tin shop (để điền sẵn tài khoản ngân hàng mặc định) ─────────────
  const [shop, setShop] = useState(null);

  // ── Modal rút tiền ──
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
  });
  const [processing, setProcessing] = useState(false);

  // ── Fetch ví Seller từ đúng endpoint /seller/wallet ──────────────────────
  const fetchSellerWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const res = await axiosClient.get('/seller/wallet');
      if (res.data?.data) {
        setSellerWallet(res.data.data);
      } else {
        // Fallback nếu backend trả trực tiếp object
        setSellerWallet(res.data || null);
      }
    } catch (err) {
      console.error('SellerWallet: failed to fetch /seller/wallet', err);
      toast.error('Không thể tải thông tin ví. Vui lòng thử lại.');
      setSellerWallet(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ── Lịch sử rút tiền ──
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchWithdrawalHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await walletApi.getWithdrawalHistory();
      setWithdrawalHistory(res.data?.data || []);
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellerWallet();
    fetchWithdrawalHistory();

    // Lấy thông tin shop để hiển thị ngân hàng mặc định
    axiosClient
      .get('/me')
      .then((res) => {
        if (res.data?.data?.shop) setShop(res.data.data.shop);
      })
      .catch((err) => console.error('SellerWallet: failed to fetch /me', err));
  }, [fetchSellerWallet, fetchWithdrawalHistory]);

  // ── Helpers ──
  const openWithdrawModal = () => {
    setWithdrawForm({ amount: '', bankName: '', bankAccount: '' });
    setIsCustomBank(false);
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => setShowWithdrawModal(false);

  const hasDefaultBank = Boolean(shop?.TenNganHang && shop?.SoTaiKhoang);

  // ── Submit rút tiền ──
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(withdrawForm.amount);
    if (amount < 10000) return toast.error('Số tiền rút tối thiểu là 10.000đ');
    if (amount > (sellerWallet?.balance ?? 0))
      return toast.error('Số dư không đủ để rút số tiền này');

    let finalBankName, finalBankAccount;

    if (!isCustomBank) {
      if (!hasDefaultBank) {
        return toast.error(
          'Bạn chưa cấu hình ngân hàng mặc định. Vui lòng cập nhật hồ sơ gian hàng hoặc chọn tài khoản khác.'
        );
      }
      finalBankName    = shop.TenNganHang;
      finalBankAccount = shop.SoTaiKhoang;
    } else {
      if (!withdrawForm.bankName) return toast.error('Vui lòng chọn ngân hàng');
      if (!withdrawForm.bankAccount.trim()) return toast.error('Vui lòng nhập số tài khoản');
      finalBankName    = withdrawForm.bankName;
      finalBankAccount = withdrawForm.bankAccount.trim();
    }

    setProcessing(true);
    toast.loading('Đang xử lý...', { id: 'sw-withdraw' });
    try {
      await walletApi.withdraw({
        amount,
        bank_name:    finalBankName,
        bank_account: finalBankAccount,
      });
      toast.success('Gửi yêu cầu rút tiền thành công! Đang chờ admin duyệt.', {
        id: 'sw-withdraw',
      });
      closeWithdrawModal();
      fetchSellerWallet(); // Reload số dư sau khi gửi yêu cầu
      fetchWithdrawalHistory(); // Reload lịch sử rút tiền
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu rút tiền',
        { id: 'sw-withdraw' }
      );
    } finally {
      setProcessing(false);
    }
  };

  // ── Loading state ──
  if (walletLoading && !sellerWallet) {
    return (
      <div className="loading-screen wallet-loading-screen">
        <div
          className="spinner wallet-loading-spinner"
          style={{ borderColor: TEAL }}
        />
        <p>Đang tải thông tin ví doanh thu...</p>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="page-container wallet-page-container">

      {/* ── Header ── */}
      <div className="page-header wallet-page-header">
        <h2 className="wallet-title">
          <Wallet color={TEAL} size={28} />
          Ví Doanh Thu
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: TEAL,
              background: '#e8f7f5',
              padding: '2px 10px',
              borderRadius: '99px',
              border: `1px solid ${TEAL}`,
              marginLeft: '6px'
            }}
          >
            Seller
          </span>
        </h2>
        <button
          id="sw-refresh-btn"
          onClick={fetchSellerWallet}
          className="shopee-btn-outline wallet-refresh-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={15} />
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
          <h1 className="wallet-card-value wallet-card-value--teal">
            {formatCurrency(sellerWallet?.balance)}
          </h1>

          {/* Action buttons — Rút tiền ưu tiên cho Seller */}
          <div className="wallet-actions-row">
            <button
              id="sw-withdraw-btn"
              onClick={openWithdrawModal}
              className="shopee-btn wallet-btn-action"
              style={{ background: TEAL }}
            >
              <ArrowUpCircle size={18} style={{ marginRight: '6px' }} />
              Yêu Cầu Rút Tiền
            </button>
            <Link
              id="sw-deposit-btn"
              to="/wallet/deposit"
              className="shopee-btn-outline wallet-btn-action wallet-btn-action--history"
              style={{ fontSize: '0.85rem' }}
            >
              <ArrowDownCircle size={16} style={{ marginRight: '4px' }} />
              Nạp thêm
            </Link>
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
              {formatCurrency(sellerWallet?.frozen_balance)}
            </h2>
            <p className="wallet-pending-desc">
              Số tiền đang chờ xác nhận hoàn tất đơn hàng hoặc yêu cầu rút tiền đang duyệt.
            </p>
          </div>

          <div className="wallet-pending-action-box">
            <p>
              * Lịch sử: Nhận doanh thu đơn hàng (+), Trừ tiền rút về (−), Phí hoa hồng (−).
            </p>
            <Link
              id="sw-history-btn"
              to="/seller/wallet/transactions"
              className="shopee-btn-outline wallet-btn-history"
            >
              <History size={18} style={{ marginRight: '6px' }} />
              Xem lịch sử giao dịch chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* ── Thông tin gian hàng ── */}
      <div className="shopee-card wallet-utilities-card">
        <h3 className="wallet-utilities-title">
          <Store size={20} color={TEAL} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Thông tin thanh toán gian hàng
        </h3>

        <div className="wallet-utilities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {/* Tài khoản ngân hàng mặc định */}
          <div
            style={{
              padding: '1rem',
              border: `1px solid ${hasDefaultBank ? '#b2dfdb' : '#eee'}`,
              borderRadius: '8px',
              background: hasDefaultBank ? '#e8f5e9' : '#fafafa',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>Ngân hàng mặc định</div>
            <div style={{ fontWeight: 600, color: hasDefaultBank ? '#2e7d32' : '#bbb', fontSize: '0.95rem' }}>
              {hasDefaultBank ? shop.TenNganHang : 'Chưa cấu hình'}
            </div>
            {hasDefaultBank && (
              <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px' }}>
                STK: {shop.SoTaiKhoang}
              </div>
            )}
          </div>

          {/* Cập nhật hồ sơ */}
          <div
            className="wallet-utility-item"
            onClick={() => navigate('/seller/settings/profile')}
          >
            <div className="wallet-utility-item-icon">⚙️</div>
            <div className="wallet-utility-item-text">Cập nhật hồ sơ</div>
            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Ngân hàng, địa chỉ...</div>
          </div>

          {/* Thống kê doanh thu */}
          <div
            className="wallet-utility-item"
            style={{ cursor: 'not-allowed', opacity: 0.5 }}
          >
            <div className="wallet-utility-item-icon">📊</div>
            <div className="wallet-utility-item-text">Thống kê doanh thu</div>
            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>Sắp ra mắt</div>
          </div>
        </div>
      </div>

      {/* ── Lịch sử yêu cầu rút tiền ── */}
      <SellerWithdrawalHistorySection
        history={withdrawalHistory}
        loading={historyLoading}
        onRefresh={fetchWithdrawalHistory}
      />

      {/* ── Modal Yêu cầu rút tiền ── */}
      {showWithdrawModal && (
        <div id="sw-withdraw-modal" className="wallet-modal-overlay">
          <div className="wallet-modal-content" style={{ maxWidth: '420px' }}>
            {/* Close */}
            <button
              onClick={closeWithdrawModal}
              className="wallet-modal-close"
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
            >
              <X size={20} />
            </button>

            <h3 className="wallet-modal-title">
              <ArrowUpCircle color={TEAL} /> Yêu Cầu Rút Tiền
            </h3>

            <form onSubmit={handleWithdrawSubmit}>
              {/* Số tiền */}
              <div className="wallet-form-group">
                <label className="wallet-form-label">
                  Số tiền muốn rút (*)
                </label>
                <input
                  id="sw-withdraw-amount"
                  type="number"
                  required
                  min="10000"
                  max={sellerWallet?.balance ?? 0}
                  placeholder="Ví dụ: 500.000"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="wallet-form-input"
                />
                <div className="wallet-input-tip">
                  <span>Tối thiểu: 10.000đ</span>
                  <span>Tối đa: {formatCurrency(sellerWallet?.balance)}</span>
                </div>
              </div>

              {/* Chọn tài khoản ngân hàng */}
              <div className="wallet-form-group">
                {/* Option 1: Tài khoản mặc định */}
                <label
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.8rem', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="sw-bank-option"
                    checked={!isCustomBank}
                    onChange={() => setIsCustomBank(false)}
                    style={{ transform: 'scale(1.2)', accentColor: TEAL, marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, color: '#333' }}>Tài khoản ngân hàng mặc định</div>
                    <div style={{ fontSize: '0.85rem', color: hasDefaultBank ? '#26aa99' : '#f44336', marginTop: '2px' }}>
                      {hasDefaultBank
                        ? `${shop.TenNganHang} — ${shop.SoTaiKhoang}`
                        : '⚠ Chưa cập nhật trong hồ sơ gian hàng'}
                    </div>
                  </div>
                </label>

                {/* Option 2: Tài khoản khác */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sw-bank-option"
                    checked={isCustomBank}
                    onChange={() => setIsCustomBank(true)}
                    style={{ transform: 'scale(1.2)', accentColor: TEAL }}
                  />
                  <span style={{ fontWeight: 500, color: '#333' }}>Sử dụng tài khoản ngân hàng khác</span>
                </label>
              </div>

              {/* Input tùy chỉnh */}
              {isCustomBank && (
                <div
                  style={{
                    background: '#f9f9f9',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px dashed #ccc',
                  }}
                >
                  <div className="wallet-form-group">
                    <label className="wallet-form-label">
                      Ngân hàng nhận (*)
                    </label>
                    <select
                      id="sw-custom-bank-select"
                      required={isCustomBank}
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

                  <div className="wallet-form-group wallet-form-group--last">
                    <label className="wallet-form-label">
                      Số tài khoản (*)
                    </label>
                    <input
                      id="sw-custom-bank-account"
                      type="text"
                      required={isCustomBank}
                      placeholder="Nhập số tài khoản ngân hàng..."
                      value={withdrawForm.bankAccount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccount: e.target.value })}
                      className="wallet-form-input"
                    />
                  </div>
                </div>
              )}

              <button
                id="sw-withdraw-submit"
                type="submit"
                disabled={processing}
                className="wallet-form-submit-btn"
                style={{
                  background: processing ? '#ccc' : TEAL,
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

export default SellerWallet;

// ────────────────────────────────────────────────────────────────────────────────
//  SellerWithdrawalHistorySection — Lịch sử yêu cầu rút tiền của Seller
// ────────────────────────────────────────────────────────────────────────────────
const SELLER_STATUS_CONFIG = {
  pending:  { label: 'Chờ duyệt',   color: '#f57f17', bg: '#fff8e1', Icon: Clock },
  approved: { label: 'Đã duyệt',    color: '#2e7d32', bg: '#e8f5e9', Icon: CheckCircle },
  rejected: { label: 'Bị từ chối',  color: '#c62828', bg: '#ffebee', Icon: XCircle },
};

function SellerWithdrawalHistorySection({ history, loading, onRefresh }) {
  return (
    <div className="shopee-card wallet-utilities-card" style={{ marginTop: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="wallet-utilities-title" style={{ margin: 0 }}>
          <ArrowUpCircle size={18} color={TEAL} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Lịch Sử Yêu Cầu Rút Tiền
        </h3>
        <button
          id="sw-history-refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: '1px solid #ddd', borderRadius: '6px',
            padding: '4px 10px', cursor: loading ? 'not-allowed' : 'pointer',
            color: '#666', fontSize: '0.8rem',
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Làm mới
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
          <div className="spinner" style={{ borderColor: TEAL, margin: '0 auto 0.5rem' }} />
          Đang tải...
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#bbb' }}>
          Chưa có yêu cầu rút tiền nào.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.map((item) => {
            const cfg = SELLER_STATUS_CONFIG[item.status] || SELLER_STATUS_CONFIG.pending;
            const { Icon } = cfg;
            return (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${cfg.color}33`,
                  borderLeft: `4px solid ${cfg.color}`,
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  background: cfg.bg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: trạng thái + ngân hàng */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Icon size={15} color={cfg.color} />
                    <span style={{ fontWeight: 600, color: cfg.color, fontSize: '0.85rem' }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#555' }}>
                    {item.bank_name} — {item.bank_account}
                  </div>
                  {/* Lý do từ chối */}
                  {item.status === 'rejected' && item.note && (
                    <div style={{
                      marginTop: '4px', fontSize: '0.78rem', color: '#c62828',
                      background: '#ffcdd2', borderRadius: '4px', padding: '3px 8px',
                    }}>
                      Lý do: {item.note}
                    </div>
                  )}
                </div>

                {/* Right: số tiền + ngày */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                    -{formatCurrency(item.amount)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>
                    {new Date(item.created_at).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
