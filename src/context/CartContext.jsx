import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  getCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  syncCartApi,
} from '../api/cartApi';

const CartContext = createContext();

const CART_LOCAL_KEY = 'cart';

// ── Helpers đọc/ghi localStorage ────────────────────────────────────────────
const getLocalCart = () => {
  try {
    const raw = localStorage.getItem(CART_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalCart = (items) => {
  localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-change'));
};

// ── Normalize item từ localStorage (nhiều format khác nhau) ─────────────────
const normalizeLocalItem = (item) => ({
  ID_SanPham: item.ID_SanPham || item.id,
  TenSanPham: item.TenSanPham || item.name,
  Gia:        item.Gia || item.price || 0,
  SoLuong:    item.SoLuong || item.qty || 1,
  HinhAnh:    item.HinhAnh || null,
  ID_Shop:    item.ID_Shop || null,
  TenShop:    item.TenShop || 'Gian hàng đặc sản',
});

// ── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading]     = useState(false);

  const isLoggedIn = () => !!localStorage.getItem('token');

  // Tổng số sản phẩm (badge trên navbar)
  const cartCount = cartItems.reduce((s, i) => s + (i.SoLuong || 0), 0);

  // ── Load giỏ hàng ──────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartItems(getLocalCart().map(normalizeLocalItem));
      return;
    }
    setLoading(true);
    try {
      const res = await getCart();
      if (res.data?.success) {
        setCartItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
      // Fallback về localStorage nếu API lỗi
      setCartItems(getLocalCart().map(normalizeLocalItem));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // Lắng nghe auth-change (đăng nhập / đăng xuất)
  useEffect(() => {
    const handleAuthChange = async () => {
      if (isLoggedIn()) {
        // Vừa đăng nhập → sync localStorage lên server rồi tải lại
        const localItems = getLocalCart();
        if (localItems.length > 0) {
          try {
            const syncPayload = localItems.map((i) => ({
              ID_SanPham: i.ID_SanPham || i.id,
              SoLuong:    i.SoLuong    || i.qty || 1,
            }));
            const res = await syncCartApi(syncPayload);
            if (res.data?.success) {
              setCartItems(res.data.data || []);
              localStorage.removeItem(CART_LOCAL_KEY); // Dọn localStorage sau sync
            }
          } catch (err) {
            console.error('Sync cart lỗi:', err);
            await fetchCart();
          }
        } else {
          await fetchCart();
        }
      } else {
        // Đăng xuất → dùng localStorage
        setCartItems(getLocalCart().map(normalizeLocalItem));
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [fetchCart]);

  // ── Thêm vào giỏ ──────────────────────────────────────────────────────────
  const addToCart = async (product, soLuong = 1) => {
    if (isLoggedIn()) {
      try {
        await addToCartApi(product.ID_SanPham, soLuong);
        await fetchCart(); // Reload để đồng bộ
      } catch (err) {
        const msg = err.response?.data?.message || 'Không thể thêm vào giỏ hàng.';
        throw new Error(msg);
      }
    } else {
      // Guest: dùng localStorage
      const local = getLocalCart();
      const idx = local.findIndex((i) => (i.ID_SanPham || i.id) === product.ID_SanPham);
      let newCart;
      if (idx >= 0) {
        newCart = local.map((i, index) =>
          index === idx ? { ...i, SoLuong: (i.SoLuong || i.qty || 1) + soLuong } : i
        );
      } else {
        newCart = [
          ...local,
          {
            ID_SanPham: product.ID_SanPham,
            TenSanPham: product.TenSanPham,
            Gia:        product.Gia,
            SoLuong:    soLuong,
            HinhAnh:    product.hinh_anh?.[0]?.HinhAnh || product.HinhAnh || null,
            ID_Shop:    product.ID_Shop,
            TenShop:    product.shop?.TenShop || 'Gian hàng đặc sản',
          },
        ];
      }
      setLocalCart(newCart);
      setCartItems(newCart.map(normalizeLocalItem));
    }
  };

  // ── Cập nhật số lượng ─────────────────────────────────────────────────────
  const updateQty = async (ID_SanPham, newQty) => {
    if (newQty < 1) return;

    if (isLoggedIn()) {
      try {
        await updateCartItemApi(ID_SanPham, newQty);
        setCartItems((prev) =>
          prev.map((i) => (i.ID_SanPham === ID_SanPham ? { ...i, SoLuong: newQty } : i))
        );
      } catch (err) {
        const msg = err.response?.data?.message || 'Không thể cập nhật số lượng.';
        throw new Error(msg);
      }
    } else {
      const local = getLocalCart();
      const newCart = local.map((i) =>
        (i.ID_SanPham || i.id) === ID_SanPham ? { ...i, SoLuong: newQty, qty: newQty } : i
      );
      setLocalCart(newCart);
      setCartItems(newCart.map(normalizeLocalItem));
    }
  };

  // ── Xóa 1 sản phẩm ───────────────────────────────────────────────────────
  const removeItem = async (ID_SanPham) => {
    if (isLoggedIn()) {
      try {
        await removeCartItemApi(ID_SanPham);
        setCartItems((prev) => prev.filter((i) => i.ID_SanPham !== ID_SanPham));
      } catch (err) {
        console.error('Xóa sản phẩm lỗi:', err);
      }
    } else {
      const newCart = getLocalCart().filter((i) => (i.ID_SanPham || i.id) !== ID_SanPham);
      setLocalCart(newCart);
      setCartItems(newCart.map(normalizeLocalItem));
    }
  };

  // ── Xóa toàn bộ ──────────────────────────────────────────────────────────
  const clearCart = async () => {
    if (isLoggedIn()) {
      try {
        await clearCartApi();
      } catch (err) {
        console.error('Xóa giỏ hàng lỗi:', err);
      }
    }
    localStorage.removeItem(CART_LOCAL_KEY);
    setCartItems([]);
    window.dispatchEvent(new CustomEvent('cart-change'));
  };

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, loading, fetchCart, addToCart, updateQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
