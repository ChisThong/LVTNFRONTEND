import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

/* ═══════════════════════════════════════════════════════════
   PublicLayout — wrapper cho tất cả trang Public
   Navbar + <Outlet /> (nội dung trang) + Footer
   ═══════════════════════════════════════════════════════════ */
export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
      <PublicFooter />
    </>
  );
}
