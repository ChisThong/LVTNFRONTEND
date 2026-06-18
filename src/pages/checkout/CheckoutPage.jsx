import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, CreditCard, AlertCircle, MapPin, Smartphone } from 'lucide-react';
import { formatPrice } from '../../api/productPublicApi';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { useWallet } from '../../context/WalletContext';

const BACKEND_URL = "http://localhost:8000/storage/";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { wallet, fetchWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Form states
  const [diaChiGiao, setDiaChiGiao] = useState('');
  const [sdtNhanHang, setSdtNhanHang] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' hoặc 'VNPAY' hoặc 'WALLET'
  
  // Tính số dư từ Context thay vì state cục bộ
  const walletBalance = parseFloat(wallet?.balance || 0);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);

    // Refresh ví để đảm bảo số dư mới nhất
    if (fetchWallet) {
      fetchWallet();
    }
  }, []);

  const totalAmount = cartItems.reduce((acc, item) => acc + ( (item.price || item.Gia) * (item.qty || item.SoLuong) ), 0);

  // Gom nhóm sản phẩm theo Shop
  const groupedCart = cartItems.reduce((acc, item) => {
    const shopId = item.ID_Shop || 'shop_0';
    if (!acc[shopId]) {
      acc[shopId] = {
        TenShop: item.TenShop || 'Gian hàng đặc sản',
        items: []
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }
    if (!diaChiGiao.trim() || !sdtNhanHang.trim()) {
      toast.error('Vui lòng nhập đầy đủ Địa chỉ giao hàng và Số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Đang xử lý đơn hàng...', { id: 'checkout' });

    try {
      // 1. Chuyển đổi định dạng sản phẩm
      const payloadProducts = cartItems.map(item => ({
        ID_SanPham: item.ID_SanPham || item.id,
        SoLuong: item.SoLuong || item.qty
      }));

      // 2. Chuẩn bị Payload
      const payload = {
        DiaChiGiao: diaChiGiao,
        SDTNhanHang: sdtNhanHang,
        PhuongThucThanhToan: paymentMethod,
        san_pham: payloadProducts
      };

      // 3. Gọi API bằng Axios
      const response = await axiosClient.post('/don-hang', payload);

      if (response.data?.success) {
        // Xóa giỏ hàng
        localStorage.removeItem('cart');
        window.dispatchEvent(new CustomEvent('cart-change'));

        toast.success('Tạo đơn hàng thành công!', { id: 'checkout' });

        // 4. Xử lý điều hướng VNPay hoặc COD
        if (paymentMethod === 'VNPAY' && response.data?.vnpay_url) {
          // Chuyển hướng thẳng sang VNPay
          window.location.href = response.data.vnpay_url;
        } else {
          // Điều hướng về Lịch sử mua hàng
          navigate('/orders');
        }
      }
    } catch (error) {
      const errRes = error.response;
      if (errRes?.status === 422) {
        toast.error('Lỗi dữ liệu: ' + (errRes.data.message || 'Kiểm tra lại thông tin'), { id: 'checkout' });
        
        // Hiển thị chi tiết lỗi tồn kho nếu có
        if (errRes.data.errors && Array.isArray(errRes.data.errors)) {
          errRes.data.errors.forEach(err => toast.error(err, { duration: 5000 }));
        }
      } else {
        toast.error('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.', { id: 'checkout' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4" style={{ flex: 1, padding: '2rem 0', paddingTop: '120px', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: '#666' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
        <ChevronRight size={16} />
        <span style={{ color: 'var(--shopee-orange)', fontWeight: 'bold' }}>Thanh toán</span>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Thanh toán đơn hàng</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Thông tin Giao Hàng */}
        <div className="shopee-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--shopee-orange)" /> Địa Chỉ Nhận Hàng
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Số điện thoại người nhận <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} style={{ position: 'absolute', top: '10px', left: '10px', color: '#888' }} />
                <input 
                  type="text" 
                  style={{ paddingLeft: '35px' }}
                  placeholder="Ví dụ: 0912345678" 
                  value={sdtNhanHang} 
                  onChange={e => setSdtNhanHang(e.target.value)} 
                />
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Địa chỉ giao hàng chi tiết <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', top: '10px', left: '10px', color: '#888' }} />
                <input 
                  type="text" 
                  style={{ paddingLeft: '35px' }}
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố" 
                  value={diaChiGiao} 
                  onChange={e => setDiaChiGiao(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.length === 0 ? (
            <div className="shopee-card" style={{ padding: '1.5rem' }}>
              <p>Giỏ hàng trống.</p>
            </div>
          ) : (
            Object.values(groupedCart).map((shop, shopIdx) => (
              <div key={shopIdx} className="shopee-card" style={{ overflow: 'hidden' }}>
                {/* Shop Header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.05rem', color: '#333' }}>
                  <span>🏡</span>
                  {shop.TenShop}
                </div>
                
                {/* Shop Items */}
                <div style={{ padding: '0 1.5rem' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {shop.items.map((item, idx) => {
                      const imgSrc = item.HinhAnh 
                        ? (item.HinhAnh.startsWith('http') ? item.HinhAnh : `${BACKEND_URL}${item.HinhAnh}`) 
                        : 'https://via.placeholder.com/150';

                      return (
                        <li key={item.id || item.ID_SanPham || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', borderBottom: idx < shop.items.length - 1 ? '1px solid #eee' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img 
                              src={imgSrc} 
                              alt={item.name || item.TenSanPham} 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} 
                            />
                            <div>
                              <h4 style={{ margin: 0, color: '#333', fontSize: '1rem', marginBottom: '0.3rem' }}>{item.name || item.TenSanPham}</h4>
                              <span style={{ color: '#888', fontSize: '0.9rem' }}>
                                Đơn giá: {formatPrice(item.price || item.Gia)} x {item.qty || item.SoLuong}
                              </span>
                            </div>
                          </div>
                          <div style={{ fontWeight: 'bold', color: 'var(--shopee-orange)', display: 'flex', alignItems: 'center' }}>
                            {formatPrice((item.price || item.Gia) * (item.qty || item.SoLuong))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Methods */}
        <div className="shopee-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Phương thức thanh toán</h3>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
             <div 
               onClick={() => setPaymentMethod('COD')}
               style={{ 
                 flex: 1,
                 border: `2px solid ${paymentMethod === 'COD' ? 'var(--shopee-orange)' : '#ddd'}`, 
                 borderRadius: '4px', 
                 padding: '1.5rem', 
                 cursor: 'pointer',
                 background: paymentMethod === 'COD' ? 'var(--shopee-light)' : '#fff',
                 position: 'relative'
               }}>
               {paymentMethod === 'COD' && (
                 <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--shopee-orange)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderBottomLeftRadius: '4px' }}>Đã chọn</div>
               )}
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: paymentMethod === 'COD' ? 'var(--shopee-orange)' : '#555', fontSize: '1.1rem' }}>
                 <CreditCard size={24} /> Thanh toán khi nhận hàng (COD)
               </div>
               <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                 Thanh toán bằng tiền mặt khi shipper giao hàng tới.
               </div>
             </div>

             <div 
               onClick={() => setPaymentMethod('VNPAY')}
               style={{ 
                 flex: 1,
                 border: `2px solid ${paymentMethod === 'VNPAY' ? 'var(--shopee-orange)' : '#ddd'}`, 
                 borderRadius: '4px', 
                 padding: '1.5rem', 
                 cursor: 'pointer',
                 background: paymentMethod === 'VNPAY' ? 'var(--shopee-light)' : '#fff',
                 position: 'relative'
               }}>
               {paymentMethod === 'VNPAY' && (
                 <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--shopee-orange)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderBottomLeftRadius: '4px' }}>Đã chọn</div>
               )}
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: paymentMethod === 'VNPAY' ? 'var(--shopee-orange)' : '#555', fontSize: '1.1rem' }}>
                 💳 Thanh toán VNPay
               </div>
               <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                 Thanh toán an toàn qua cổng VNPay (hỗ trợ thẻ ATM nội địa, Visa/Mastercard).
               </div>
             </div>
             
             {/* WALLET */}
             <div 
               onClick={() => {
                 if (walletBalance >= totalAmount) {
                   setPaymentMethod('WALLET');
                 }
               }}
               style={{ 
                 flex: 1,
                 border: `2px solid ${paymentMethod === 'WALLET' ? 'var(--shopee-orange)' : '#ddd'}`, 
                 borderRadius: '4px', 
                 padding: '1.5rem', 
                 cursor: walletBalance >= totalAmount ? 'pointer' : 'not-allowed',
                 background: paymentMethod === 'WALLET' ? 'var(--shopee-light)' : (walletBalance >= totalAmount ? '#fff' : '#f9f9f9'),
                 position: 'relative',
                 opacity: walletBalance >= totalAmount ? 1 : 0.6
               }}>
               {paymentMethod === 'WALLET' && (
                 <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--shopee-orange)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderBottomLeftRadius: '4px' }}>Đã chọn</div>
               )}
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: paymentMethod === 'WALLET' ? 'var(--shopee-orange)' : '#555', fontSize: '1.1rem' }}>
                 💼 Thanh toán bằng Ví cá nhân
               </div>
               <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                 Số dư khả dụng: <strong style={{ color: 'var(--shopee-orange)' }}>{formatPrice(walletBalance)}</strong>
               </div>
               {walletBalance < totalAmount && (
                 <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <AlertCircle size={14} /> Số dư tài khoản không đủ để thanh toán
                 </div>
               )}
             </div>
          </div>

          {/* Footer Summary */}
          <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem', border: '1px dashed #ddd' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#555', marginBottom: '0.5rem' }}>Tổng thanh toán ({cartItems.length} mặt hàng):</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--shopee-orange)' }}>
                {formatPrice(totalAmount)}
              </div>
            </div>
            
            <button 
              className="shopee-btn"
              style={{ 
                padding: '1rem 3rem', 
                fontSize: '1.2rem',
                opacity: (isSubmitting || cartItems.length === 0) ? 0.6 : 1
              }}
              onClick={handleCheckout}
              disabled={isSubmitting || cartItems.length === 0}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
