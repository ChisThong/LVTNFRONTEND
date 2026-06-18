import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

/* ═══════════════════════════════════════════════════════════
   PublicLayout — wrapper cho tất cả trang Public
   Navbar + <Outlet /> (nội dung trang) + Footer
   ═══════════════════════════════════════════════════════════ */
export default function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  );
}
