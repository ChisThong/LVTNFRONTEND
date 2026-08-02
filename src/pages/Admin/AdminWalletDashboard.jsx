import React, { useState, useEffect, useCallback } from 'react';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';
import {
  DollarSign, ArrowDownRight, ArrowUpRight, Clock, CheckCircle, XCircle,
  Search, Filter, RefreshCw, Eye, Users, ShoppingBag, Wallet,
  TrendingUp, CreditCard, ChevronLeft, ChevronRight, X
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatDateTime = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const TYPE_LABELS = {
  deposit:    { label: 'Nạp tiền',        color: '#16a34a', bg: '#dcfce7', icon: '⬆️' },
  withdraw:   { label: 'Rút tiền',        color: '#dc2626', bg: '#fee2e2', icon: '⬇️' },
  payment:    { label: 'Thanh toán',      color: '#d97706', bg: '#fef3c7', icon: '💳' },
  refund:     { label: 'Hoàn tiền',       color: '#0284c7', bg: '#e0f2fe', icon: '↩️' },
  commission: { label: 'Hoa hồng',        color: '#7c3aed', bg: '#ede9fe', icon: '💰' },
  transfer:   { label: 'Chuyển tiền',     color: '#0369a1', bg: '#e0f2fe', icon: '🔄' },
  order:      { label: 'Đơn hàng',        color: '#be185d', bg: '#fce7f3', icon: '📦' },
  release:    { label: 'Hoàn tất đơn',   color: '#059669', bg: '#d1fae5', icon: '✅' },
};

const STATUS_LABELS = {
  completed: { label: 'Hoàn thành', color: '#16a34a', bg: '#dcfce7' },
  pending:   { label: 'Chờ xử lý',  color: '#d97706', bg: '#fef3c7' },
  failed:    { label: 'Thất bại',   color: '#dc2626', bg: '#fee2e2' },
  cancelled: { label: 'Đã huỷ',    color: '#6b7280', bg: '#f3f4f6' },
};

const WITHDRAWAL_STATUS = {
  pending:  { label: 'Chờ duyệt',   color: '#d97706', bg: '#fef3c7' },
  approved: { label: 'Đã chuyển',   color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'Từ chối',     color: '#dc2626', bg: '#fee2e2' },
};

// ── Badge component ───────────────────────────────────────────────────────────
const Badge = ({ config, text }) => {
  if (!config) return <span style={{ color: '#6b7280' }}>{text || '—'}</span>;
  return (
    <span style={{
      background: config.bg, color: config.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {config.label || text}
    </span>
  );
};

// ── Stat Card component ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg, note }) => (
  <div style={{
    background: '#fff', borderRadius: '16px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
    display: 'flex', flexDirection: 'column', gap: '0.4rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>
      <div style={{ padding: '6px', borderRadius: '8px', background: bg }}>
        <Icon size={16} color={color} />
      </div>
      {label}
    </div>
    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
      {formatCurrency(value)}
    </div>
    {note && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{note}</div>}
  </div>
);

// ── Modal Chi tiết giao dịch ──────────────────────────────────────────────────
const TransactionDetailModal = ({ txn, onClose }) => {
  if (!txn) return null;
  const typeConf = TYPE_LABELS[txn.type] || {};
  const statusConf = STATUS_LABELS[txn.status] || {};
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>Chi tiết giao dịch</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>#{txn.id}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Amount highlight */}
          <div style={{
            background: txn.amount >= 0 ? '#dcfce7' : '#fee2e2',
            borderRadius: '12px', padding: '1.25rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>Số tiền</div>
            <div style={{
              fontSize: '2rem', fontWeight: 900,
              color: txn.amount >= 0 ? '#16a34a' : '#dc2626'
            }}>
              {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
            </div>
          </div>

          {/* Info rows */}
          {[
            { label: 'Mã giao dịch', value: `#${txn.id}` },
            { label: 'Loại giao dịch', value: <Badge config={typeConf} text={txn.type} /> },
            { label: 'Trạng thái', value: <Badge config={statusConf} text={txn.status} /> },
            { label: 'Người dùng', value: txn.user ? `${txn.user.HoTen} (${txn.user.email})` : '—' },
            { label: 'Số dư trước', value: formatCurrency(txn.balance_before) },
            { label: 'Số dư sau', value: formatCurrency(txn.balance_after) },
            { label: 'Loại tham chiếu', value: txn.reference_type || '—' },
            { label: 'Mã tham chiếu', value: txn.reference_id || '—' },
            { label: 'Thời gian', value: formatDateTime(txn.created_at) },
          ].map(({ label, value }, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9'
            }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{label}</span>
              <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right', maxWidth: '60%' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
function AdminWalletDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | transactions | withdrawals
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txnMeta, setTxnMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [datePreset, setDatePreset] = useState(''); // '' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month'

  // Helper: tính date_from / date_to từ preset
  const getPresetDates = (preset) => {
    const toISO = (d) => d.toISOString().slice(0, 10);
    const now = new Date();
    if (preset === 'today') {
      const s = toISO(now);
      return { date_from: s, date_to: s };
    }
    if (preset === 'yesterday') {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const s = toISO(y);
      return { date_from: s, date_to: s };
    }
    if (preset === 'this_week') {
      const day = now.getDay() || 7; // Mon=1..Sun=7
      const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
      return { date_from: toISO(mon), date_to: toISO(now) };
    }
    if (preset === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { date_from: toISO(first), date_to: toISO(now) };
    }
    if (preset === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { date_from: toISO(first), date_to: toISO(last) };
    }
    return { date_from: '', date_to: '' };
  };

  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const { date_from, date_to } = getPresetDates(preset);
    setTxnFilter(p => ({ ...p, date_from, date_to, page: 1 }));
  };

  // Filter state
  const [txnFilter, setTxnFilter] = useState({
    search: '', type: '', status: '', role: '', date_from: '', date_to: '', page: 1
  });
  const [wdFilter, setWdFilter] = useState({
    search: '', status: '', date_from: '', date_to: ''
  });

  // ── Fetch Stats ──
  const fetchStats = async () => {
    try {
      const res = await walletApi.getAdminStats();
      setStats(res.data.data);
    } catch {
      toast.error('Lỗi khi tải tổng quan tài chính');
    }
  };

  // ── Fetch Transactions ──
  const fetchTransactions = useCallback(async (filter) => {
    setTxnLoading(true);
    try {
      const params = { per_page: 15, ...filter };
      // Xóa key rỗng
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
      const res = await walletApi.getAdminTransactions(params);
      const d = res.data.data;
      setTransactions(d.data || []);
      setTxnMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total });
    } catch {
      toast.error('Lỗi khi tải danh sách giao dịch');
    } finally {
      setTxnLoading(false);
    }
  }, []);

  // ── Fetch Withdrawals ──
  const fetchWithdrawals = useCallback(async (filter) => {
    try {
      const params = { ...filter };
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
      const res = await walletApi.getAdminWithdrawals(params);
      setWithdrawals(res.data.data || []);
    } catch {
      toast.error('Lỗi khi tải yêu cầu rút tiền');
    }
  }, []);

  // ── Initial Load ──
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchTransactions(txnFilter), fetchWithdrawals(wdFilter)]);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch khi filter thay đổi ──
  useEffect(() => {
    if (!loading) fetchTransactions(txnFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txnFilter]);

  useEffect(() => {
    if (!loading) fetchWithdrawals(wdFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wdFilter]);

  const handleRefresh = () => {
    fetchStats();
    fetchTransactions(txnFilter);
    fetchWithdrawals(wdFilter);
    toast.success('Đã làm mới dữ liệu');
  };

  const handleProcessWithdrawal = async (id, status) => {
    if (!window.confirm(`Bạn có chắc muốn ${status === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu này?`)) return;
    toast.loading('Đang xử lý...', { id: 'wd' });
    try {
      await walletApi.processAdminWithdrawal(id, status);
      toast.success('Xử lý thành công', { id: 'wd' });
      fetchWithdrawals(wdFilter);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra', { id: 'wd' });
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const tabStyle = (active) => ({
    padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontWeight: active ? 700 : 500, fontSize: '0.9rem', transition: 'all 0.2s',
    background: active ? '#1e293b' : 'transparent',
    color: active ? '#fff' : '#64748b',
  });

  const inputStyle = {
    padding: '0.5rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.875rem', outline: 'none', background: '#fff', color: '#1e293b',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid #e2e8f0',
          borderTopColor: '#1e293b', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <div style={{ color: '#64748b' }}>Đang tải dữ liệu...</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .aw-row:hover { background: #f8fafc !important; }
        .aw-tab-btn:hover { background: #f1f5f9 !important; }
        .aw-action-btn:hover { opacity: 0.85; }
        .aw-page-btn:hover:not(:disabled) { background: #e2e8f0 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>
            🏦 Quản lý Ví điện tử
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Tổng quan tài chính & lịch sử giao dịch toàn hệ thống
          </p>
        </div>
        <button onClick={handleRefresh} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#1e293b', color: '#fff', border: 'none',
          padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 600
        }}>
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px',
        borderRadius: '10px', marginBottom: '2rem', width: 'fit-content'
      }}>
        {[
          { key: 'overview', label: '📊 Tổng quan' },
          { key: 'transactions', label: '📋 Giao dịch' },
          { key: 'withdrawals', label: `💸 Rút tiền${stats?.pending_withdrawals > 0 ? ` (${stats.pending_withdrawals})` : ''}` },
        ].map(tab => (
          <button key={tab.key} className="aw-tab-btn"
            onClick={() => setActiveTab(tab.key)}
            style={tabStyle(activeTab === tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: TỔNG QUAN
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem', marginBottom: '2rem'
          }}>
            <StatCard icon={Users}        label="Số dư ví Khách hàng"   value={stats.total_customer_balance}  color="#0284c7" bg="#e0f2fe" note={`Tổng ${stats.total_wallets} ví`} />
            <StatCard icon={ShoppingBag}  label="Số dư ví Người bán"    value={stats.total_seller_balance}    color="#7c3aed" bg="#ede9fe" />
            <StatCard icon={ArrowDownRight} label="Tổng tiền nạp (VNPay)" value={stats.total_deposits}         color="#16a34a" bg="#dcfce7" />
            <StatCard icon={CreditCard}   label="Tổng tiền đã thanh toán" value={stats.total_payments}         color="#d97706" bg="#fef3c7" />
            <StatCard icon={TrendingUp}   label="Doanh thu hoa hồng"    value={stats.total_commissions}       color="#be185d" bg="#fce7f3" />
            <StatCard icon={ArrowUpRight} label="Tổng tiền đã rút"      value={stats.total_withdrawals}       color="#dc2626" bg="#fee2e2" />
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '4px solid #d97706',
              display: 'flex', flexDirection: 'column', gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#fef3c7' }}>
                  <Clock size={16} color="#d97706" />
                </div>
                Rút tiền chờ duyệt
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>
                {stats.pending_withdrawals}
              </div>
              {stats.pending_withdrawals > 0 && (
                <button onClick={() => setActiveTab('withdrawals')} style={{
                  background: 'none', border: 'none', color: '#d97706', fontSize: '0.78rem',
                  fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0
                }}>
                  → Xem ngay
                </button>
              )}
            </div>
          </div>

          {/* Summary table */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
              📊 Bảng cân đối tài chính
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Chỉ số', 'Giá trị', 'Ghi chú'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Tổng tiền nạp vào hệ thống', value: stats.total_deposits, note: 'Qua VNPay' },
                  { label: 'Tổng tiền thanh toán đơn hàng', value: stats.total_payments, note: 'Qua ví điện tử' },
                  { label: 'Hoa hồng thu được', value: stats.total_commissions, note: 'Từ giao dịch' },
                  { label: 'Tổng tiền đã rút ra', value: stats.total_withdrawals, note: 'Người bán rút' },
                  { label: 'Số dư ví khách hàng', value: stats.total_customer_balance, note: 'Chưa chi tiêu' },
                  { label: 'Số dư ví người bán', value: stats.total_seller_balance, note: 'Chưa rút' },
                ].map((row, i) => (
                  <tr key={i} className="aw-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.875rem 1rem', color: '#374151', fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(row.value)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: DANH SÁCH GIAO DỊCH
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'transactions' && (
        <div>
          {/* Filter bar */}
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '1.25rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.25rem',
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>
              <Filter size={15} /> Bộ lọc
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                style={{ ...inputStyle, paddingLeft: '32px', width: '100%', boxSizing: 'border-box' }}
                placeholder="Tìm người dùng (tên, email)..."
                value={txnFilter.search}
                onChange={e => setTxnFilter(p => ({ ...p, search: e.target.value, page: 1 }))}
              />
            </div>

            {/* Loại giao dịch */}
            <select style={inputStyle} value={txnFilter.type}
              onChange={e => setTxnFilter(p => ({ ...p, type: e.target.value, page: 1 }))}>
              <option value="">Tất cả loại</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Trạng thái */}
            <select style={inputStyle} value={txnFilter.status}
              onChange={e => setTxnFilter(p => ({ ...p, status: e.target.value, page: 1 }))}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {/* Role */}
            <select style={inputStyle} value={txnFilter.role}
              onChange={e => setTxnFilter(p => ({ ...p, role: e.target.value, page: 1 }))}>
              <option value="">Tất cả người dùng</option>
              <option value="2">Khách hàng</option>
              <option value="3">Người bán</option>
            </select>

            {/* Ngày từ */}
            <input type="date" style={inputStyle} value={txnFilter.date_from}
              onChange={e => {
                setDatePreset('');
                setTxnFilter(p => ({ ...p, date_from: e.target.value, page: 1 }));
              }} />
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>→</span>
            <input type="date" style={inputStyle} value={txnFilter.date_to}
              onChange={e => {
                setDatePreset('');
                setTxnFilter(p => ({ ...p, date_to: e.target.value, page: 1 }));
              }} />

            {/* ── Lọc nhanh theo thời gian ── */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'today',      label: 'Hôm nay' },
                { key: 'yesterday',  label: 'Hôm qua' },
                { key: 'this_week',  label: 'Tuần này' },
                { key: 'this_month', label: 'Tháng này' },
                { key: 'last_month', label: 'Tháng trước' },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => datePreset === p.key ? applyDatePreset('') : applyDatePreset(p.key)}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, border: 'none', transition: 'all 0.15s',
                    background: datePreset === p.key ? '#1e293b' : '#f1f5f9',
                    color: datePreset === p.key ? '#fff' : '#475569',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Reset */}
            {(txnFilter.search || txnFilter.type || txnFilter.status || txnFilter.role || txnFilter.date_from || txnFilter.date_to) && (
              <button onClick={() => { setDatePreset(''); setTxnFilter({ search: '', type: '', status: '', role: '', date_from: '', date_to: '', page: 1 }); }}
                style={{ ...inputStyle, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', background: '#fff1f1', border: '1px solid #fca5a5' }}>
                <X size={13} /> Xóa lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                Danh sách giao dịch
              </div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Tổng: <b>{txnMeta.total}</b> giao dịch
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {txnLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1e293b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} />
                  Đang tải...
                </div>
              ) : transactions.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  Không có giao dịch nào phù hợp
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Mã GD', 'Người dùng', 'Loại GD', 'Số tiền', 'Số dư sau', 'Thời gian', 'Trạng thái', 'Chi tiết'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(txn => (
                      <tr key={txn.id} className="aw-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}>
                        <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontWeight: 600 }}>#{txn.id}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {txn.user ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{txn.user.HoTen}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{txn.user.email}</div>
                              <div style={{ fontSize: '0.72rem', color: txn.user.ID_role === 2 ? '#0284c7' : '#7c3aed', fontWeight: 600 }}>
                                {txn.user.ID_role === 2 ? 'Khách hàng' : 'Người bán'}
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <Badge config={TYPE_LABELS[txn.type]} text={txn.type} />
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: txn.amount >= 0 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                          {txn.amount >= 0 ? '+' : ''}{formatCurrency(txn.amount)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#374151', whiteSpace: 'nowrap' }}>
                          {formatCurrency(txn.balance_after)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                          {formatDateTime(txn.created_at)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <Badge config={STATUS_LABELS[txn.status]} text={txn.status} />
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <button onClick={() => setSelectedTxn(txn)} style={{
                            background: '#f1f5f9', border: 'none', borderRadius: '8px',
                            padding: '5px 10px', cursor: 'pointer', color: '#1e293b',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600
                          }}>
                            <Eye size={13} /> Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {txnMeta.last_page > 1 && (
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Trang {txnMeta.current_page} / {txnMeta.last_page}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="aw-page-btn" disabled={txnMeta.current_page === 1}
                    onClick={() => setTxnFilter(p => ({ ...p, page: p.page - 1 }))}
                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: txnMeta.current_page === 1 ? 'not-allowed' : 'pointer', color: '#1e293b' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button className="aw-page-btn" disabled={txnMeta.current_page === txnMeta.last_page}
                    onClick={() => setTxnFilter(p => ({ ...p, page: p.page + 1 }))}
                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: txnMeta.current_page === txnMeta.last_page ? 'not-allowed' : 'pointer', color: '#1e293b' }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: YÊU CẦU RÚT TIỀN
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'withdrawals' && (
        <div>
          {/* Filter bar */}
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '1.25rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.25rem',
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>
              <Filter size={15} /> Bộ lọc
            </div>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input style={{ ...inputStyle, paddingLeft: '32px', width: '100%', boxSizing: 'border-box' }}
                placeholder="Tìm người dùng..." value={wdFilter.search}
                onChange={e => setWdFilter(p => ({ ...p, search: e.target.value }))} />
            </div>
            <select style={inputStyle} value={wdFilter.status}
              onChange={e => setWdFilter(p => ({ ...p, status: e.target.value }))}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã chuyển</option>
              <option value="rejected">Từ chối</option>
            </select>
            <input type="date" style={inputStyle} value={wdFilter.date_from}
              onChange={e => setWdFilter(p => ({ ...p, date_from: e.target.value }))} />
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>→</span>
            <input type="date" style={inputStyle} value={wdFilter.date_to}
              onChange={e => setWdFilter(p => ({ ...p, date_to: e.target.value }))} />
            {(wdFilter.search || wdFilter.status || wdFilter.date_from || wdFilter.date_to) && (
              <button onClick={() => setWdFilter({ search: '', status: '', date_from: '', date_to: '' })}
                style={{ ...inputStyle, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', background: '#fff1f1', border: '1px solid #fca5a5' }}>
                <X size={13} /> Xóa lọc
              </button>
            )}
          </div>

          {/* Withdrawal table */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Yêu cầu rút tiền</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['pending', 'approved', 'rejected'].map(s => (
                  <span key={s} style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                    background: WITHDRAWAL_STATUS[s].bg, color: WITHDRAWAL_STATUS[s].color
                  }}>
                    {WITHDRAWAL_STATUS[s].label}: {withdrawals.filter(w => w.status === s).length}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {withdrawals.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Không có yêu cầu nào</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Mã YC', 'Người dùng', 'Số tiền', 'Ngân hàng', 'Thời gian', 'Trạng thái', 'Thao tác'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(w => (
                      <tr key={w.id} className="aw-row" style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '0.875rem 1rem', color: '#6b7280', fontWeight: 600 }}>#{w.id}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{w.user?.HoTen || '—'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{w.user?.email}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>
                          {formatCurrency(w.amount)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#0284c7' }}>{w.bank_name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{w.bank_account}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {formatDateTime(w.created_at)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <Badge config={WITHDRAWAL_STATUS[w.status]} text={w.status} />
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {w.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="aw-action-btn" onClick={() => handleProcessWithdrawal(w.id, 'approved')}
                                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                                <CheckCircle size={13} /> Duyệt
                              </button>
                              <button className="aw-action-btn" onClick={() => handleProcessWithdrawal(w.id, 'rejected')}
                                style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                                <XCircle size={13} /> Từ chối
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal chi tiết giao dịch ── */}
      {selectedTxn && (
        <TransactionDetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
    </div>
  );
}

export default AdminWalletDashboard;
