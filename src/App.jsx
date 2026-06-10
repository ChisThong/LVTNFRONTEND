import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Home from './pages/Home';

// Seller Pages
import SellerRegister from './pages/seller/SellerRegister';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerShopEdit from './pages/seller/SellerShopEdit';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Seller Routes */}
        <Route path="/seller/register"   element={<SellerRegister />} />
        <Route path="/seller/dashboard"  element={<SellerDashboard />} />
        <Route path="/seller/shop/edit"  element={<SellerShopEdit />} />

        {/* Fallback: mặc định vào login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
