import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Admin/Dashboard';
import Home from './pages/Home';
import BanDoControl from './pages/Admin/BanDoControl';
import BaiVietControler from './pages/Admin/BaiVietControl';
import AdminShopControl from './pages/Admin/AdminShopControl';

// Seller Pages
import SellerRegister from './pages/seller/SellerRegister';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerShopEdit from './pages/seller/SellerShopEdit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Seller Routes */}
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/shop/edit" element={<SellerShopEdit />} />


        {/* Admin layout route */}
        <Route path="/admin" element={<Admin />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shops" element={<AdminShopControl />} />
          <Route path="posts" element={<BaiVietControler />} />
          <Route path="regions" element={<BanDoControl />} />
        </Route>

        {/* Fallback: mặc định vào login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
