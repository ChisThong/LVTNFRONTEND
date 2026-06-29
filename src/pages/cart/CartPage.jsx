import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Trash2, Minus, Plus, ShoppingCart, Store, MapPin, ClipboardCheck, CheckCircle, Sparkles, Package } from 'lucide-react';
import { formatPrice } from '../../api/productPublicApi';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const BACKEND_URL = "https://lvtnbackend.onrender.com/storage/";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";

const getProductImage = (item) => {
  if (!item) return FALLBACK_IMAGE;

  let imgPath =
    item.HinhAnh ||
    item.hinhanh ||
    item.hinh_anh ||
    item.image ||
    item.HinhAnhDauTien;

  if (!imgPath || typeof imgPath !== 'string') {
    if (Array.isArray(item.hinh_anh) && item.hinh_anh.length > 0) {
      imgPath = item.hinh_anh[0].HinhAnh || item.hinh_anh[0].hinhanh;
    } else if (Array.isArray(item.hinhanh) && item.hinhanh.length > 0) {
      imgPath = item.hinhanh[0].HinhAnh || item.hinhanh[0].hinhanh;
    } else if (item.product?.hinh_anh?.[0]?.HinhAnh) {
      imgPath = item.product.hinh_anh[0].HinhAnh;
    }
  }

  if (imgPath && typeof imgPath === 'string') {
    return imgPath.startsWith('http') ? imgPath : `${BACKEND_URL}${imgPath}`;
  }

  return FALLBACK_IMAGE;
};

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const normalizedCart = storedCart.map(item => ({
      ID_SanPham: item.ID_SanPham || item.id,
      TenSanPham: item.TenSanPham || item.name,
      Gia: item.Gia || item.price,
      SoLuong: item.SoLuong || item.qty,
      HinhAnh: item.HinhAnh || null,
      ID_Shop: item.ID_Shop || 'shop_0',
      TenShop: item.TenShop || 'Gian hàng đặc sản',
      ...item
    }));
    setCartItems(normalizedCart);
    
    fetchSuggestedProducts();
  }, []);

  const fetchSuggestedProducts = async () => {
    try {
      const res = await axiosClient.get('/products/suggest');
      if (res.data?.success) {
        setSuggestedProducts(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy sản phẩm gợi ý:", err);
    }
  };

  const handleAddToCart = (product) => {
    const existingIndex = cartItems.findIndex(item => item.ID_SanPham === product.ID_SanPham);
    let newCart;
    if (existingIndex >= 0) {
      newCart = [...cartItems];
      newCart[existingIndex].SoLuong += 1;
    } else {
      newCart = [...cartItems, {
        ID_SanPham: product.ID_SanPham,
        TenSanPham: product.TenSanPham,
        Gia: product.Gia,
        SoLuong: 1,
        HinhAnh: product.hinh_anh && product.hinh_anh.length > 0 ? product.hinh_anh[0].HinhAnh : null,
        ID_Shop: product.ID_Shop,
        TenShop: product.shop ? product.shop.TenShop : 'Gian hàng đặc sản'
      }];
    }
    saveCart(newCart);
    toast.success(`Đã thêm ${product.TenSanPham} vào giỏ!`);
  };

  const saveCart = (newCart) => {
    setCartItems(newCart);
    const savedFormat = newCart.map(item => ({
      id: item.ID_SanPham,
      name: item.TenSanPham,
      price: item.Gia,
      qty: item.SoLuong,
      ID_SanPham: item.ID_SanPham,
      TenSanPham: item.TenSanPham,
      Gia: item.Gia,
      SoLuong: item.SoLuong,
      HinhAnh: item.HinhAnh,
      ID_Shop: item.ID_Shop,
      TenShop: item.TenShop
    }));
    localStorage.setItem('cart', JSON.stringify(savedFormat));
    window.dispatchEvent(new CustomEvent('cart-change'));
  };

  const updateQuantity = (id, delta) => {
    const newCart = cartItems.map(item => {
      if (item.ID_SanPham === id) {
        const newQty = Math.max(1, item.SoLuong + delta);
        return { ...item, SoLuong: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeItem = (id) => {
    const newCart = cartItems.filter(item => item.ID_SanPham !== id);
    saveCart(newCart);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const groupedCart = cartItems.reduce((acc, item) => {
    if (!acc[item.ID_Shop]) {
      acc[item.ID_Shop] = {
        TenShop: item.TenShop,
        items: []
      };
    }
    acc[item.ID_Shop].items.push(item);
    return acc;
  }, {});

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);

  return (
    <div style={{ backgroundColor: '#FDFCF0', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 20px', paddingTop: '120px', paddingBottom: '60px' }}>
        
        {/* KHỐI 1: STEPPER TIẾN TRÌNH */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '1.5rem 3rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#A04B38', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(160, 75, 56, 0.3)' }}>
                <ShoppingCart size={24} />
              </div>
              <span style={{ fontWeight: 'bold', color: '#A04B38', fontSize: '0.9rem' }}>GIỎ HÀNG</span>
            </div>
            <div style={{ width: '80px', height: '2px', background: '#EAE3DA', margin: '0 1rem', marginBottom: '24px' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A89E92' }}>
                <ClipboardCheck size={24} />
              </div>
              <span style={{ fontWeight: '600', color: '#A89E92', fontSize: '0.9rem' }}>XÁC NHẬN</span>
            </div>
            <div style={{ width: '80px', height: '2px', background: '#EAE3DA', margin: '0 1rem', marginBottom: '24px' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#F5F0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A89E92' }}>
                <CheckCircle size={24} />
              </div>
              <span style={{ fontWeight: '600', color: '#A89E92', fontSize: '0.9rem' }}>HOÀN TẤT</span>
            </div>
          </div>
        </div>

        {/* TIÊU ĐỀ TRANG */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#A04B38', color: '#fff', padding: '0.5rem', borderRadius: '12px' }}>
              <ShoppingCart size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2D241E', fontWeight: 'bold' }}>Giỏ hàng</h2>
              <span style={{ color: '#8C7B6D', fontSize: '0.95rem' }}>{totalQuantity} sản phẩm</span>
            </div>
          </div>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#2D241E', textDecoration: 'none', fontWeight: '600', border: '1px solid #EAE3DA', transition: 'all 0.2s' }}>
            <Package size={18} /> Tiếp tục mua sắm
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ background: '#fff', padding: '5rem 2rem', textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F5F0EA' }}>
            <ShoppingCart size={80} color="#EAE3DA" style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#4A3B32', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Giỏ hàng của bạn đang trống</h3>
            <Link to="/products" style={{ display: 'inline-block', background: '#A04B38', color: '#fff', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'start' }} className="lg:grid-cols-[7fr_3fr]">
            
            {/* KHỐI 2 - CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F5F0EA', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {/* Header Cột Trái */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F5F0EA', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingCart size={20} color="#2D241E" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2D241E', fontWeight: 'bold' }}>Danh sách sản phẩm ({totalQuantity})</h3>
                </div>

                {/* Danh sách Shop & Items */}
                <div>
                  {Object.keys(groupedCart).map((shopId, index) => {
                    const shop = groupedCart[shopId];
                    return (
                      <div key={shopId} style={{ borderBottom: index < Object.keys(groupedCart).length - 1 ? '8px solid #FDFCF0' : 'none' }}>
                        {/* Tên Shop */}
                        <div style={{ padding: '1rem 1.5rem', background: '#FAFAF7', borderBottom: '1px solid #F5F0EA', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#2D241E' }}>
                          <Store size={18} color="#A04B38" />
                          {shop.TenShop}
                        </div>
                        
                        {/* Items của Shop */}
                        <div style={{ padding: '0 1.5rem' }}>
                          {shop.items.map((item, itemIdx) => {
                            const imgSrc = getProductImage(item);
                            return (
                              <div key={item.ID_SanPham} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1.5rem 0',
                                borderBottom: itemIdx < shop.items.length - 1 ? '1px solid #F5F0EA' : 'none',
                                flexWrap: 'wrap',
                                gap: '1.5rem'
                              }}>
                                {/* Cột Ảnh + Thông tin */}
                                <div style={{ display: 'flex', gap: '1.25rem', flex: '1', minWidth: '280px' }}>
                                  <img
                                    src={imgSrc}
                                    alt={item.TenSanPham}
                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #F5F0EA' }}
                                  />
                                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Link to={`/products/${item.ID_SanPham}`} style={{ color: '#2D241E', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', display: 'block', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                                      {item.TenSanPham}
                                    </Link>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8C7B6D', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                                      <Package size={14} />
                                      {item.PhanLoai || 'Sản phẩm tiêu chuẩn'}
                                    </div>
                                    <div style={{ color: '#A04B38', fontWeight: 'bold', fontSize: '1.15rem' }}>
                                      {formatPrice(item.Gia)}
                                    </div>
                                  </div>
                                </div>

                                {/* Cột Nút tăng giảm + Xóa */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                  <div style={{ display: 'flex', border: '1px solid #EAE3DA', borderRadius: '8px', overflow: 'hidden' }}>
                                    <button
                                      onClick={() => updateQuantity(item.ID_SanPham, -1)}
                                      style={{ width: '36px', height: '36px', background: '#fff', border: 'none', borderRight: '1px solid #EAE3DA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D241E', transition: 'background 0.2s' }}
                                      onMouseOver={(e) => e.currentTarget.style.background = '#F5F0EA'}
                                      onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <input
                                      type="text"
                                      value={item.SoLuong}
                                      readOnly
                                      style={{ width: '48px', height: '36px', border: 'none', textAlign: 'center', fontSize: '1rem', outline: 'none', fontWeight: '600', color: '#2D241E' }}
                                    />
                                    <button
                                      onClick={() => updateQuantity(item.ID_SanPham, 1)}
                                      style={{ width: '36px', height: '36px', background: '#fff', border: 'none', borderLeft: '1px solid #EAE3DA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D241E', transition: 'background 0.2s' }}
                                      onMouseOver={(e) => e.currentTarget.style.background = '#F5F0EA'}
                                      onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.ID_SanPham)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A89E92', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s' }}
                                    title="Xóa sản phẩm"
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#A89E92'; }}
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* KHỐI 2 - CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY) */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F5F0EA', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {/* Header Cột Phải */}
                <div style={{ padding: '1.25rem 1.5rem', background: '#A04B38', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ClipboardCheck size={20} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Tóm tắt đơn hàng</h3>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', color: '#666', fontSize: '0.95rem' }}>
                    <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                    <span style={{ fontWeight: '600', color: '#2D241E' }}>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <div style={{ borderTop: '1px dashed #EAE3DA', margin: '1.25rem 0' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#2D241E', fontSize: '1.1rem' }}>Tổng cộng</span>
                    <span style={{ fontWeight: 'bold', color: '#A04B38', fontSize: '1.5rem' }}>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    style={{ width: '100%', background: '#A04B38', color: '#fff', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(160, 75, 56, 0.2)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#8A3E2D'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#A04B38'}
                  >
                    MUA HÀNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KHỐI 3: GỢI Ý SẢN PHẨM */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Sparkles size={24} color="#A04B38" />
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#2D241E', fontWeight: 'bold' }}>Có thể bạn sẽ thích</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {suggestedProducts.map(product => (
              <div key={product.ID_SanPham} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F5F0EA', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Badge */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 2 }}>
                  Gợi ý
                </div>
                
                {/* Image */}
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img src={getProductImage(product)} alt={product.TenSanPham} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Info */}
                <div style={{ padding: '1.25rem' }}>
                  <Link to={`/products/${product.ID_SanPham}`} style={{ textDecoration: 'none' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#2D241E', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.TenSanPham}
                    </h4>
                  </Link>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8C7B6D', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <MapPin size={14} />
                    <span>{product.tinh_thanh?.TenTinhThanh || 'Đang cập nhật'}</span>
                  </div>
                  
                  <p style={{ margin: '0 0 1.25rem 0', color: '#666', fontSize: '0.85rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.MoTa || 'Sản phẩm đặc sản miền Tây chất lượng cao.'}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', color: '#A04B38', fontSize: '1.15rem' }}>
                      {formatPrice(product.Gia)}
                    </span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2D241E', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#A04B38'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#2D241E'}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
