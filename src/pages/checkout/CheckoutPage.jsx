import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { formatPrice } from '../../api/productPublicApi';
import { useWallet } from '../../context/WalletContext';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { wallet, walletLoading, fetchWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, you'd fetch from an API or a global store.
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load local cart
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  }, []);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleWalletCheckout = () => {
    if (!wallet || wallet.balance < totalAmount) {
      toast.error('Số dư ví không đủ! Vui lòng nạp thêm tiền.');
      return navigate('/wallet/deposit');
    }

    setIsSubmitting(true);
    toast.loading('Đang xử lý thanh toán...', { id: 'checkout' });
    
    // TODO: Call API to create order & deduct wallet balance via DonHangController/WalletService
    setTimeout(() => {
      toast.success('Thanh toán thành công! Tiền đã được trừ (Mock)', { id: 'checkout' });
      localStorage.removeItem('cart');
      setIsSubmitting(false);
      fetchWallet(); // Real-time update context
      navigate('/orders');
    }, 1500);
  };

  if (walletLoading && !wallet) return <div style={{ padding: '5rem', textAlign: 'center' }}>Đang tải thông tin thanh toán...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: '#666' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
        <ChevronRight size={16} />
        <span style={{ color: 'var(--shopee-orange)', fontWeight: 'bold' }}>Thanh toán</span>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Thanh toán đơn hàng</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Product List */}
        <div className="shopee-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Sản phẩm</h3>
          {cartItems.length === 0 ? (
            <p>Giỏ hàng trống.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cartItems.map(item => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                      <ShoppingCart size={24} color="#ccc" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{item.name}</h4>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>Đơn giá: {formatPrice(item.price)} x {item.qty}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--shopee-orange)' }}>{formatPrice(item.price * item.qty)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payment Methods & Summary */}
        <div className="shopee-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Phương thức thanh toán</h3>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
             <div style={{ 
               flex: 1,
               border: '1px solid var(--shopee-orange)', 
               borderRadius: '4px', 
               padding: '1.5rem', 
               cursor: 'pointer',
               background: 'var(--shopee-light)',
               position: 'relative'
             }}>
               <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--shopee-orange)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderBottomLeftRadius: '4px' }}>Khuyên dùng</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--shopee-orange)', fontSize: '1.1rem' }}>
                 <Wallet size={24} /> Ví ShopeeStyle
               </div>
               <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                 Số dư khả dụng: <strong style={{ color: wallet?.balance >= totalAmount ? 'var(--shopee-orange)' : '#ff0000', fontSize: '1.1rem' }}>
                   {wallet ? formatPrice(wallet.balance) : 'Đang tải...'}
                 </strong>
               </div>
               {wallet && wallet.balance < totalAmount && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff0000', marginTop: '0.8rem', fontSize: '0.85rem' }}>
                   <AlertCircle size={14} /> Số dư không đủ
                   <Link to="/wallet/deposit" style={{ color: '#1890ff', marginLeft: 'auto', textDecoration: 'underline' }}>Nạp thêm ngay</Link>
                 </div>
               )}
             </div>

             <div style={{ 
               flex: 1,
               border: '1px solid #ddd', 
               borderRadius: '4px', 
               padding: '1.5rem', 
               color: '#aaa',
               cursor: 'not-allowed',
               background: '#f9f9f9'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                 <CreditCard size={24} /> Thanh toán khi nhận hàng
               </div>
               <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Đang bảo trì</div>
             </div>
          </div>

          {/* Footer Summary */}
          <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem', border: '1px dashed #ddd' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#555', marginBottom: '0.5rem' }}>Tổng thanh toán ({cartItems.length} sản phẩm):</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--shopee-orange)' }}>
                {formatPrice(totalAmount)}
              </div>
            </div>
            
            <button 
              className="shopee-btn"
              style={{ 
                padding: '1rem 3rem', 
                fontSize: '1.2rem',
                opacity: (isSubmitting || cartItems.length === 0 || !wallet || wallet.balance < totalAmount) ? 0.6 : 1
              }}
              onClick={handleWalletCheckout}
              disabled={isSubmitting || cartItems.length === 0 || !wallet || wallet.balance < totalAmount}
            >
              {isSubmitting ? 'Đang thanh toán...' : 'Đặt hàng'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
