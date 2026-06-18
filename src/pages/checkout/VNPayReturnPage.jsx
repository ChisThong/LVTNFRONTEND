import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ShoppingBag, Home, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../api/productPublicApi';

export default function VNPayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Đọc các tham số từ URL do VNPay trả về
  const responseCode = searchParams.get('vnp_ResponseCode');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const amountParam = searchParams.get('vnp_Amount');
  
  // VNPay gửi số tiền nhân với 100, nên ta chia lại cho 100 để hiển thị đúng
  const amount = amountParam ? parseInt(amountParam) / 100 : 0;
  
  const isSuccess = responseCode === '00';

  useEffect(() => {
    if (isSuccess) {
      // Dọn sạch giỏ hàng khi thanh toán VNPay thành công
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cart-change'));
    }
  }, [isSuccess]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="shopee-card" style={{ 
        maxWidth: '500px', 
        width: '100%', 
        padding: '3rem 2rem', 
        textAlign: 'center',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        
        {isSuccess ? (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={80} color="#2e7d32" strokeWidth={1.5} />
            </div>
            <h2 style={{ color: '#2e7d32', marginBottom: '1rem', fontSize: '1.8rem' }}>Thanh Toán Thành Công!</h2>
            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được ghi nhận và thanh toán thành công qua cổng VNPay.
            </p>

            <div style={{ 
              background: '#f9f9f9', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              textAlign: 'left',
              marginBottom: '2rem',
              border: '1px solid #eee'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ color: '#666' }}>Mã giao dịch VNPay:</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{transactionNo || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Số tiền đã thanh toán:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--shopee-orange)', fontSize: '1.2rem' }}>
                  {formatPrice(amount)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <XCircle size={80} color="#d32f2f" strokeWidth={1.5} />
            </div>
            <h2 style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '1.8rem' }}>Thanh Toán Thất Bại!</h2>
            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý từ ngân hàng. Vui lòng thử lại.
            </p>
            <div style={{ 
              background: '#ffebee', 
              padding: '1rem', 
              borderRadius: '8px', 
              color: '#c62828',
              marginBottom: '2rem',
              fontSize: '0.9rem'
            }}>
              Mã lỗi VNPay: {responseCode || 'Không xác định'}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="shopee-btn-outline" style={{ flex: 1, minWidth: '180px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Home size={18} /> Về Trang Chủ
          </Link>
          
          {isSuccess ? (
            <button 
              onClick={() => navigate('/orders')} 
              className="shopee-btn" 
              style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ShoppingBag size={18} /> Xem Đơn Hàng
            </button>
          ) : (
            <button 
              onClick={() => navigate('/checkout')} 
              className="shopee-btn" 
              style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ShoppingCart size={18} /> Thử thanh toán lại
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
