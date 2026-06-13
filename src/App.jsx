import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Layout ──────────────────────────────────────────────────
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SellerLayout from './components/SellerLayout';

// ── Public Pages ────────────────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ShopDetail from './pages/shops/ShopDetail';

// ── Seller Pages ────────────────────────────────────────────
import SellerRegister from './pages/seller/SellerRegister';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerShopEdit from './pages/seller/SellerShopEdit';
import SellerProducts from './pages/seller/SellerProducts';
import SellerProductCreate from './pages/seller/SellerProductCreate';
import SellerProductEdit from './pages/seller/SellerProductEdit';

// ── Admin Pages ─────────────────────────────────────────────
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Admin/Dashboard';
import BanDoControl from './pages/Admin/BanDoControl';
import BaiVietControler from './pages/Admin/BaiVietControl';
import AdminShopControl from './pages/Admin/AdminShopControl';
import AdminProductControl from './pages/Admin/AdminProductControl';
import NguoiDungControl from './pages/Admin/NguoiDungControl';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ════════════════════════════════════════════════
            PUBLIC ROUTES — dùng PublicLayout (Navbar + Footer)
            ════════════════════════════════════════════════ */}
        <Route element={<PublicLayout />}>
          <Route path="/"           element={<Home />} />
          <Route path="/about"      element={<div style={{ padding: '10rem 5%', minHeight: '80vh' }}><h1>Giới thiệu (Đang phát triển)</h1></div>} />
          <Route path="/products"   element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/shops/:id"  element={<ShopDetail />} />
          <Route path="/map"        element={<div style={{ padding: '10rem 5%', minHeight: '80vh' }}><h1>Bản đồ đặc sản (Đang phát triển)</h1></div>} />
          <Route path="/stories"    element={<div style={{ padding: '10rem 5%', minHeight: '80vh' }}><h1>Câu chuyện sản vật (Đang phát triển)</h1></div>} />
          <Route path="/privacy"    element={<div style={{ padding: '10rem 5%', minHeight: '80vh' }}><h1>Chính sách bảo mật (Đang phát triển)</h1></div>} />
          <Route path="/terms"      element={<div style={{ padding: '10rem 5%', minHeight: '80vh' }}><h1>Điều khoản sử dụng (Đang phát triển)</h1></div>} />
          {/* Redirect backward-compat */}
          <Route path="/specialties" element={<Navigate to="/products" replace />} />
          <Route path="/intro"       element={<Navigate to="/stories"  replace />} />
        </Route>

        {/* ════════════════════════════════════════════════
            AUTH ROUTES — không có layout wrapper
            ════════════════════════════════════════════════ */}
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* ════════════════════════════════════════════════
            SELLER ROUTES — ProtectedRoute + SellerLayout
            (Role 2 hoặc 3, không dùng PublicLayout)
            ════════════════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={[2, 3]} />}>
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<SellerDashboard />} />
            <Route path="settings/profile" element={<SellerShopEdit />} />
            <Route path="settings/payment"  element={<div style={{ padding: '2rem' }}><h2>Thanh toán (Đang phát triển)</h2></div>} />
            <Route path="settings/shipping" element={<div style={{ padding: '2rem' }}><h2>Vận chuyển (Đang phát triển)</h2></div>} />
            <Route path="products"          element={<SellerProducts />} />
            <Route path="products/create"   element={<SellerProductCreate />} />
            <Route path="products/edit/:id" element={<SellerProductEdit />} />
            <Route path="orders"     element={<div style={{ padding: '2rem' }}><h2>Quản lý đơn hàng (Đang phát triển)</h2></div>} />
            <Route path="inventory"  element={<div style={{ padding: '2rem' }}><h2>Quản lý kho (Đang phát triển)</h2></div>} />
            <Route path="revenue"    element={<div style={{ padding: '2rem' }}><h2>Thống kê doanh thu (Đang phát triển)</h2></div>} />
            <Route path="reviews"    element={<div style={{ padding: '2rem' }}><h2>Đánh giá khách hàng (Đang phát triển)</h2></div>} />
          </Route>
        </Route>

        {/* ════════════════════════════════════════════════
            ADMIN ROUTES — ProtectedRoute + Admin layout
            (Role 1, không dùng PublicLayout)
            ════════════════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route path="/admin" element={<Admin />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="shops"     element={<AdminShopControl />} />
            <Route path="products"  element={<AdminProductControl />} />
            <Route path="posts"     element={<BaiVietControler />} />
            <Route path="regions"   element={<BanDoControl />} />
            <Route path="users"     element={<NguoiDungControl />} />
          </Route>
        </Route>

        {/* ════════════════════════════════════════════════
            FALLBACK
            ════════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
