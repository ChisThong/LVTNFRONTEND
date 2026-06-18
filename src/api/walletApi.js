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
  // Response: { status: 'success', payUrl: '...', txnRef: '...' }
  createVNPayPayment: (data) => {
    return axiosClient.post('/vnpay/create-payment', data);
  },

  // ── Admin ─────────────────────────────────────────────────────
  getAdminStats: () => {
    return axiosClient.get('/admin/wallet/stats');
  },

  getAdminWithdrawals: () => {
    return axiosClient.get('/admin/wallet/withdrawals');
  },

  processAdminWithdrawal: (id, status) => {
    return axiosClient.put(`/admin/wallet/withdrawals/${id}`, { status });
  },
};

export default walletApi;
