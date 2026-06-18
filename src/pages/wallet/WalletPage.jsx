import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { Wallet, Lock, History, ArrowDownCircle, ArrowUpCircle, X, CheckCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import walletApi from '../../api/walletApi';
import toast from 'react-hot-toast';

function WalletPage() {
  const { wallet, walletLoading, fetchWallet } = useWallet();
  const [user, setUser] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankName: '', bankAccount: '' });
  const [processing, setProcessing] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchWallet();
    axiosClient.get('/me')
      .then(res => {
        if (res.data?.data) setUser(res.data.data);
      })
      .catch(err => console.error('Failed to fetch user', err));
  }, []);

  // Xác định role: Nếu có user.shop hoặc ID_role === 3 thì là Seller
  const isSeller = Boolean(user?.shop || user?.role?.ID_role === 3);

  // Điều hướng bảo vệ: Seller cố tình vào /wallet thì chuyển sang /seller/wallet
  useEffect(() => {
    if (isSeller && location.pathname === '/wallet') {
      navigate('/seller/wallet', { replace: true });
    }
  }, [isSeller, location.pathname, navigate]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (withdrawForm.amount < 10000) {
      return toast.error('Số tiền rút tối thiểu là 10.000đ');
    }
    if (withdrawForm.amount > wallet?.balance) {
      return toast.error('Số dư không đủ để rút số tiền này');
    }

    let finalBankName = withdrawForm.bankName;
    let finalBankAccount = withdrawForm.bankAccount;

    if (!isCustomBank) {
      if (!user?.shop?.TenNganHang || !user?.shop?.SoTaiKhoang) {
        return toast.error('Bạn chưa cấu hình ngân hàng mặc định. Vui lòng chọn tài khoản khác hoặc cập nhật hồ sơ.');
      }
      finalBankName = user.shop.TenNganHang;
      finalBankAccount = user.shop.SoTaiKhoang;
    } else {
      if (!finalBankName || !finalBankAccount) {
        return toast.error('Vui lòng nhập đầy đủ thông tin ngân hàng mới.');
      }
    }
    
    setProcessing(true);
    toast.loading('Đang xử lý...', { id: 'withdraw' });
    try {
      await walletApi.withdraw({
        amount: withdrawForm.amount,
        bank_name: finalBankName,
        bank_account: finalBankAccount
      });
      toast.success('Gửi yêu cầu rút tiền thành công! Đang chờ admin duyệt.', { id: 'withdraw' });
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', bankName: '', bankAccount: '' });
      setIsCustomBank(false);
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi yêu cầu rút tiền', { id: 'withdraw' });
    } finally {
      setProcessing(false);
    }
  };

  if (walletLoading && !wallet) {
    return (
      <div className="loading-screen" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ borderColor: 'var(--shopee-orange)', borderTopColor: 'transparent' }}></div>
        <p>Đang tải thông tin ví...</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', minHeight: '80vh', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
          <Wallet color={isSeller ? '#26aa99' : 'var(--shopee-orange)'} size={28} /> 
          {isSeller ? 'Ví Doanh Thu (Seller)' : 'Ví Mua Sắm (Buyer)'}
        </h2>
        <button onClick={fetchWallet} className="shopee-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
          Làm mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card 1: Số dư khả dụng */}
        <div className="shopee-card" style={{ padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
            <Wallet size={150} />
          </div>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>Số dư khả dụng</h3>
          <h1 style={{ color: isSeller ? '#26aa99' : 'var(--shopee-orange)', fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
            {wallet ? formatCurrency(wallet.balance) : formatCurrency(0)}
          </h1>
          
          {/* Action Buttons Động Dựa Theo Role */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isSeller ? (
              <>
                {/* Seller: Rút tiền nổi bật, Ẩn/Thu nhỏ nút nạp */}
                <button 
                  onClick={() => setShowWithdrawModal(true)} 
                  className="shopee-btn" 
                  style={{ flex: 2, padding: '0.8rem', background: '#26aa99' }}
                >
                  <ArrowUpCircle size={18} style={{ marginRight: '6px' }} /> Yêu Cầu Rút Tiền
                </button>
                <Link to="/wallet/deposit" className="shopee-btn-outline" style={{ flex: 1, padding: '0.8rem', fontSize: '0.85rem' }}>
                  Nạp thêm
                </Link>
              </>
            ) : (
              <>
                {/* Buyer: Nạp tiền nổi bật */}
                <Link to="/wallet/deposit" className="shopee-btn" style={{ flex: 2, padding: '0.8rem' }}>
                  <ArrowDownCircle size={18} style={{ marginRight: '6px' }} /> Nạp Tiền
                </Link>
                <button 
                  onClick={() => setShowWithdrawModal(true)} 
                  className="shopee-btn-outline" 
                  style={{ flex: 1, padding: '0.8rem' }}
                >
                  Rút Tiền
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Số dư đóng băng & Lịch sử */}
        <div className="shopee-card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Lock size={18} color="#f57f17" />
              <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Số dư đóng băng</h3>
            </div>
            <h2 style={{ color: '#f57f17', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
              {wallet ? formatCurrency(wallet.frozen_balance) : formatCurrency(0)}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.5 }}>
              Số tiền này đang được giữ lại cho các đơn hàng chưa hoàn tất hoặc yêu cầu rút tiền đang chờ duyệt.
            </p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.8rem', fontStyle: 'italic' }}>
              * Lịch sử giao dịch hiển thị: {isSeller ? 'Nhận doanh thu đơn hàng (+), Trừ tiền rút về (-).' : 'Nạp tiền (+), Thanh toán đơn hàng (-).'}
            </p>
            <Link to="/wallet/transactions" className="shopee-btn-outline" style={{ width: '100%', padding: '0.6rem', color: '#555', borderColor: '#ddd', display: 'flex', justifyContent: 'center' }}>
              <History size={18} style={{ marginRight: '6px' }} /> Xem lịch sử giao dịch chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Tiện ích ví: Chỉ hiển thị nổi bật VNPay nếu là Buyer */}
      <div className="shopee-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Tiện ích Ví</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          
          {!isSeller && (
            <div
               style={{ padding: '1rem', border: '1px solid #c5d8f5', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: '#f0f7ff' }}
               onClick={() => window.location.href = '/wallet/deposit'}
            >
               <img
                 src="https://vnpay.vn/s1/statics/img/logo2.png"
                 alt="VNPay"
                 style={{ width: '48px', height: 'auto', objectFit: 'contain', marginBottom: '0.5rem' }}
                 onError={(e) => { e.target.style.display='none'; }}
               />
               <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#003087' }}>Nạp tiền VNPay</div>
            </div>
          )}

          <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
             <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏦</div>
             <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>Ngân hàng liên kết</div>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', cursor: 'not-allowed', opacity: 0.5 }}>
             <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</div>
             <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Mã giảm giá</div>
          </div>
        </div>
      </div>

      {/* Modal Yêu cầu rút tiền */}
      {showWithdrawModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '90%', maxWidth: '400px', padding: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setShowWithdrawModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpCircle color="#26aa99" /> Yêu Cầu Rút Tiền
            </h3>
            
            <form onSubmit={handleWithdrawSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem', fontWeight: 500 }}>Số tiền muốn rút (*)</label>
                <input 
                  type="number" 
                  required
                  min="10000"
                  max={wallet?.balance || 0}
                  placeholder="Ví dụ: 50000"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }}
                />
                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tối thiểu: 10.000đ</span>
                  <span>Tối đa: {formatCurrency(wallet?.balance)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="bankOption" 
                    checked={!isCustomBank} 
                    onChange={() => setIsCustomBank(false)}
                    style={{ transform: 'scale(1.2)', accentColor: '#26aa99' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, color: '#333' }}>Tài khoản ngân hàng mặc định</div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                      {user?.shop?.TenNganHang && user?.shop?.SoTaiKhoang 
                        ? `${user.shop.TenNganHang} - ${user.shop.SoTaiKhoang}` 
                        : 'Chưa cập nhật trong hồ sơ gian hàng'}
                    </div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="bankOption" 
                    checked={isCustomBank} 
                    onChange={() => setIsCustomBank(true)}
                    style={{ transform: 'scale(1.2)', accentColor: '#26aa99' }}
                  />
                  <span style={{ fontWeight: 500, color: '#333' }}>Sử dụng tài khoản ngân hàng khác</span>
                </label>
              </div>

              {isCustomBank && (
                <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed #ccc' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem', fontWeight: 500 }}>Ngân hàng nhận (*)</label>
                    <select 
                      required={isCustomBank}
                      value={withdrawForm.bankName}
                      onChange={(e) => setWithdrawForm({...withdrawForm, bankName: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }}
                    >
                      <option value="">-- Chọn ngân hàng --</option>
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="MBBank">MB Bank</option>
                      <option value="ACB">ACB</option>
                      <option value="BIDV">BIDV</option>
                      <option value="Agribank">Agribank</option>
                      <option value="VietinBank">VietinBank</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontSize: '0.9rem', fontWeight: 500 }}>Số tài khoản (*)</label>
                    <input 
                      type="text" 
                      required={isCustomBank}
                      placeholder="Nhập số tài khoản ngân hàng..."
                      value={withdrawForm.bankAccount}
                      onChange={(e) => setWithdrawForm({...withdrawForm, bankAccount: e.target.value})}
                      style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={processing}
                style={{ 
                  width: '100%', padding: '0.8rem', background: processing ? '#ccc' : '#26aa99', 
                  color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: processing ? 'not-allowed' : 'pointer' 
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

export default WalletPage;
