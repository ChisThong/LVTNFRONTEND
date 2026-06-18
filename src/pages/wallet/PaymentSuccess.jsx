import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  // VNPay redirect từ backend /vnpay-return:
  // ?status=success&txn_ref=...&amount=...
  // ?status=failed&responseCode=...&txn_ref=...
  const status       = searchParams.get('status');
  const txnRef       = searchParams.get('txn_ref')      // từ vnpayReturn (web route)
                    || searchParams.get('txnRef')         // fallback format cũ
                    || searchParams.get('orderId')        // MoMo compat (deprecated)
                    || '';
  const amount       = searchParams.get('amount');
  const responseCode = searchParams.get('responseCode');

  const { fetchWallet } = useWallet();

  const isSuccess = status === 'success';

  // Mapping VNPay responseCode sang mô tả lỗi thân thiện
  const getErrorMessage = (code) => {
    const messages = {
      '07': 'Giao dịch bị nghi ngờ (liên hệ VNPay hoặc ngân hàng).',
      '09': 'Thẻ/tài khoản chưa đăng ký Internet Banking.',
      '10': 'Xác thực thông tin thẻ/tài khoản quá 3 lần.',
      '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại.',
      '12': 'Thẻ/tài khoản bị khóa.',
      '13': 'Sai mật khẩu OTP. Vui lòng thực hiện lại.',
      '24': 'Giao dịch bị hủy.',
      '51': 'Tài khoản không đủ số dư.',
      '65': 'Vượt hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng đang bảo trì.',
      '79': 'Sai mật khẩu quá số lần quy định.',
      '99': 'Lỗi không xác định. Vui lòng thử lại.',
    };
    return messages[code] || 'Giao dịch không thành công. Vui lòng thử lại.';
  };

  const formatVND = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('vi-VN').format(num) + '₫';
  };

  useEffect(() => {
    // Tự động refresh ví sau khi nạp tiền thành công
    // (IPN có thể đã cộng tiền, hoặc returnUrl đã xử lý)
    if (isSuccess) {
      const timer = setTimeout(() => {
        fetchWallet();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, fetchWallet]);

  return (
    <div
      className="page-container"
      style={{
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '120px',    /* Đẩy xuống để không bị Navbar fixed che */
        paddingBottom: '60px',  /* Khoảng thở phía dưới */
        boxSizing: 'border-box',
      }}
    >
      <div
        className="shopee-card"
        style={{ padding: '3rem 2rem', maxWidth: '480px', width: '100%', borderRadius: '12px' }}
      >
        {isSuccess ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <CheckCircle color="#26aa99" size={80} style={{ display: 'block', margin: '0 auto' }} />
            </div>
            <h2 style={{ color: '#26aa99', marginBottom: '0.8rem', fontSize: '1.5rem' }}>
              Nạp Tiền Thành Công!
            </h2>
            <p style={{ color: '#555', marginBottom: '0.5rem', lineHeight: '1.6' }}>
              {amount && (
                <>
                  Số tiền <strong style={{ color: '#26aa99' }}>{formatVND(amount)}</strong> đã được nạp vào ví.
                  <br />
                </>
              )}
            </p>
            {txnRef && (
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
                Mã giao dịch: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{txnRef}</code>
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '2rem', color: '#888', fontSize: '0.85rem' }}>
              <Clock size={14} />
              <span>Số dư ví đang được cập nhật...</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <XCircle color="#e53935" size={80} style={{ display: 'block', margin: '0 auto' }} />
            </div>
            <h2 style={{ color: '#e53935', marginBottom: '0.8rem', fontSize: '1.5rem' }}>
              Giao Dịch Không Thành Công
            </h2>
            <p style={{ color: '#555', marginBottom: '0.5rem', lineHeight: '1.6' }}>
              {responseCode ? getErrorMessage(responseCode) : 'Giao dịch đã bị hủy hoặc không thành công.'}
            </p>
            {txnRef && (
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
                Mã tham chiếu: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{txnRef}</code>
              </p>
            )}
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <Link
            to="/wallet"
            className="shopee-btn"
            style={{
              width: '100%',
              textAlign: 'center',
              background: isSuccess ? '#26aa99' : 'var(--shopee-orange)',
            }}
          >
            {isSuccess ? 'Xem Số Dư Ví' : 'Quay Lại Ví'}
          </Link>
          {!isSuccess && (
            <Link
              to="/wallet/deposit"
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #0066cc',
                color: '#0066cc',
                background: '#fff',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Thử Lại
            </Link>
          )}
          <Link to="/" className="shopee-btn-outline" style={{ width: '100%', textAlign: 'center' }}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
