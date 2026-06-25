import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Layout ──────────────────────────────────────────────────
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';

import SellerLayout from './components/SellerLayout';

// ── Public Pages ────────────────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/VerifyOtp';
import CartPage from './pages/cart/CartPage';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ShopDetail from './pages/shops/ShopDetail';
import AccountPage from './pages/account/AccountPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// ── Seller Pages ────────────────────────────────────────────
import SellerRegister from './pages/seller/SellerRegister';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerShopEdit from './pages/seller/SellerShopEdit';
import SellerProducts from './pages/seller/SellerProducts';
import SellerProductCreate from './pages/seller/SellerProductCreate';
import SellerProductEdit from './pages/seller/SellerProductEdit';
import SellerOrders from './pages/seller/SellerOrders';

// ── Wallet Pages ────────────────────────────────────────────
import UserWallet from './pages/wallet/UserWallet';
import SellerWallet from './pages/wallet/SellerWallet';
import DepositPage from './pages/wallet/DepositPage';
import WalletTransactions from './pages/wallet/WalletTransactions'
import VNPayReturnPage from './pages/checkout/VNPayReturnPage';
import AdminWalletDashboard from './pages/admin/AdminWalletDashboard';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderHistory from './pages/orders/OrderHistory';

// ── Admin Pages ─────────────────────────────────────────────
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Admin/Dashboard';
import BanDoControl from './pages/Admin/BanDoControl';
import BaiVietControler from './pages/Admin/BaiVietControl';
import AdminShopControl from './pages/Admin/AdminShopControl';
import AdminProductControl from './pages/Admin/AdminProductControl';
import NguoiDungControl from './pages/Admin/NguoiDungControl';
import DonHangControl from './pages/Admin/DonHangControl';
import CauChuyenSanVat from './pages/shops/CauChuyenSanVat';
import BaiVietTinhThanh from './pages/shops/BaiVietTinhThanh';
import BanDoDacSan from './pages/BanDoDacSan';
import BaoCaoThongKe from './pages/Admin/BaoCaoThongKe';

import { WalletProvider } from './context/WalletContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>

          {/* ════════════════════════════════════════════════
            PUBLIC ROUTES — dùng PublicLayout (Navbar + Footer)
            ════════════════════════════════════════════════ */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/about" element={<div style={{ padding: '10rem 5%', minHeight: '80vh' }}><h1>Giới thiệu (Đang phát triển)</h1></div>} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/shops/:id" element={<ShopDetail />} />
            <Route path="/map" element={<BanDoDacSan />} />
            <Route path="/stories" element={<CauChuyenSanVat />} />
            <Route path="/tinh-thanh/:id/blogs" element={<BaiVietTinhThanh />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            {/* VNPay redirect target */}
            <Route path="/thanh-toan-thanh-cong" element={<VNPayReturnPage />} />
            {/* Backward compat alias */}
            <Route path="/payment-success" element={<VNPayReturnPage />} />
            {/* Redirect backward-compat */}
            <Route path="/specialties" element={<Navigate to="/products" replace />} />
            <Route path="/intro" element={<Navigate to="/stories" replace />} />
          </Route>

          {/* ════════════════════════════════════════════════
            AUTH ROUTES — không có layout wrapper
            ════════════════════════════════════════════════ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ════════════════════════════════════════════════
            WALLET ROUTES — ProtectedRoute (role 1, 2, 3)
            /wallet        → UserWallet  (Buyer)
            /seller/wallet → SellerWallet (via SellerLayout bên dưới)
            ════════════════════════════════════════════════ */}
          <Route element={<ProtectedRoute allowedRoles={[1, 2, 3]} />}>
            <Route element={<PublicLayout />}>
              <Route path="/wallet" element={<UserWallet />} />
              <Route path="/wallet/deposit" element={<DepositPage />} />
              <Route path="/wallet/transactions" element={<WalletTransactions />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>
          </Route>

          {/* ════════════════════════════════════════════════
            SELLER ROUTES — ProtectedRoute + SellerLayout
            (Role 2 hoặc 3, không dùng PublicLayout)
            ════════════════════════════════════════════════ */}
          <Route element={<ProtectedRoute allowedRoles={[2, 3]} />}>
            <Route path="/seller/register" element={<SellerRegister />} />
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SellerDashboard />} />
              <Route path="settings/profile" element={<SellerShopEdit />} />
              <Route path="settings/payment" element={<div style={{ padding: '2rem' }}><h2>Thanh toán (Đang phát triển)</h2></div>} />
              <Route path="settings/shipping" element={<div style={{ padding: '2rem' }}><h2>Vận chuyển (Đang phát triển)</h2></div>} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="products/create" element={<SellerProductCreate />} />
              <Route path="products/edit/:id" element={<SellerProductEdit />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="inventory" element={<div style={{ padding: '2rem' }}><h2>Quản lý kho (Đang phát triển)</h2></div>} />
              <Route path="revenue" element={<div style={{ padding: '2rem' }}><h2>Thống kê doanh thu (Đang phát triển)</h2></div>} />
              <Route path="reviews" element={<div style={{ padding: '2rem' }}><h2>Đánh giá khách hàng (Đang phát triển)</h2></div>} />
              <Route path="wallet" element={<SellerWallet />} />
              <Route path="wallet/transactions" element={<WalletTransactions backPath="/seller/wallet" />} />
            </Route>
          </Route>

          {/* ════════════════════════════════════════════════
            ADMIN ROUTES — ProtectedRoute + Admin layout
            (Role 1, không dùng PublicLayout)
            ════════════════════════════════════════════════ */}
          <Route element={<ProtectedRoute allowedRoles={[1]} />}>
            <Route path="/admin" element={<Admin />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="shops" element={<AdminShopControl />} />
              <Route path="products" element={<AdminProductControl />} />
              <Route path="orders" element={<DonHangControl />} />
              <Route path="posts" element={<BaiVietControler />} />
              <Route path="regions" element={<BanDoControl />} />
              <Route path="users" element={<NguoiDungControl />} />
              <Route path="wallet" element={<AdminWalletDashboard />} />
              <Route path="reports" element={<BaoCaoThongKe />} />
            </Route>
          </Route>

          {/* ════════════════════════════════════════════════
            FALLBACK
            ════════════════════════════════════════════════ */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
