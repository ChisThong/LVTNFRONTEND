import axiosClient from './axiosClient';

const walletApi = {
  // ── Ví người dùng ───────────────────────────────────────────
  getWallet: () => {
    return axiosClient.get('/wallet');
  },

  getTransactions: () => {
    return axiosClient.get('/wallet/transactions');
  },

  withdraw: (data) => {
    return axiosClient.post('/withdrawals', data);
  },

  // ── VNPay — Tạo thanh toán ───────────────────────────────────
  createVNPayPayment: (data) => {
    return axiosClient.post('/vnpay/create-payment', data);
  },

  // ── Admin ─────────────────────────────────────────────────────
  getAdminStats: () => {
    return axiosClient.get('/admin/wallet/stats');
  },

  /**
   * Lấy danh sách giao dịch toàn hệ thống với filter
   * @param {Object} params - { type, status, date_from, date_to, search, role, page, per_page }
   */
  getAdminTransactions: (params = {}) => {
    return axiosClient.get('/admin/wallet/transactions', { params });
  },

  /**
   * Lấy danh sách yêu cầu rút tiền với filter
   * @param {Object} params - { status, search, date_from, date_to }
   */
  getAdminWithdrawals: (params = {}) => {
    return axiosClient.get('/admin/wallet/withdrawals', { params });
  },

  processAdminWithdrawal: (id, status) => {
    return axiosClient.put(`/admin/wallet/withdrawals/${id}`, { status });
  },
};

export default walletApi;
